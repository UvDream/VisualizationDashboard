import { useRef, Suspense, lazy, useState, useMemo, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { Button, Input, Select, Switch, Progress, Tag, Badge, Avatar, Card, Table } from 'antd'
import ReactECharts from 'echarts-for-react'
import {
    SmileOutlined,
    HeartOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    UserOutlined,
} from '@ant-design/icons'
import * as AntdIcons from '@ant-design/icons'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere } from '@react-three/drei'
import { useEditor } from '../../context/EditorContext'
import { useInteraction } from '../../hooks/useInteraction'
import { calculateSnap } from '../../utils/snapping'
import { getCachedChartOption, getCalendarOption } from '../../utils/chartOptions'
import { fetchChartData, dataRefreshManager } from '../../utils/dataSource'
import { getCurrentThemeColors } from '../../config/chartThemes'
import type { ComponentItem } from '../../types'
import WordCloudChart from './WordCloudChart'
import LayoutCell from './LayoutCell'
import Carousel from './Carousel'
import BorderBox1 from './BorderBox1'
import BorderBox2 from './BorderBox2'
import BorderBox3 from './BorderBox3'
import CustomImageBorder from './CustomImageBorder'
import FullscreenButton from './FullscreenButton'
import GradientText from './GradientText'
import FlipCountdown from './FlipCountdown'
import FuturisticTitle from './FuturisticTitle'
import './index.less'

// 懒加载地图组件
const MapChart = lazy(() => import('./MapChart'))
const CityMapChart = lazy(() => import('./CityMapChart'))
const ScrollRankList = lazy(() => import('./ScrollRankList'))
const CarouselList = lazy(() => import('./CarouselList'))

interface CanvasItemProps {
    item: ComponentItem
    onContextMenu?: (e: React.MouseEvent) => void
    previewMode?: boolean
    isInLayoutCell?: boolean // 是否在布局单元格内
}

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
    smile: <SmileOutlined />,
    heart: <HeartOutlined />,
    check: <CheckCircleOutlined />,
    warning: <WarningOutlined />,
    info: <InfoCircleOutlined />,
    user: <UserOutlined />,
}

export default function CanvasItem({ item, onContextMenu, previewMode = false, isInLayoutCell = false }: CanvasItemProps) {
    const { state, selectComponent, selectComponents, moveComponent, updateComponent, setSnapLines } = useEditor()
    const { triggerInteraction, hasInteractions } = useInteraction(item.id, previewMode)
    const isSelected = state.selectedId === item.id || (state.selectedIds || []).includes(item.id)
    const ref = useRef<HTMLDivElement>(null)
    const [isLocalDragging, setIsLocalDragging] = useState(false)
    const [dynamicData, setDynamicData] = useState<any>(null)

    // 处理数据源获取（JSON序列化依赖确保参数变化时重新请求）
    const dataSourceKey = JSON.stringify(item.props.dataSource)
    useEffect(() => {
        const loadData = async () => {
            if (item.props.dataSource && item.props.dataSource.type === 'api') {
                try {
                    const data = await fetchChartData(item.props.dataSource)
                    setDynamicData(data)
                } catch (error) {
                    console.error('获取图表数据失败:', error)
                    setDynamicData(null)
                }
            } else {
                setDynamicData(null)
            }
        }

        loadData()

        // 设置自动刷新
        if (item.props.dataSource) {
            dataRefreshManager.setAutoRefresh(item.id, item.props.dataSource, (data) => {
                setDynamicData(data)
            })
        }

        return () => {
            dataRefreshManager.clearAutoRefresh(item.id)
        }
    }, [item.id, dataSourceKey])

    // 获取最终的图表数据
    const getFinalChartData = () => {
        if (dynamicData) {
            // 使用动态数据
            const finalProps = { ...item.props }

            if (['singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart', 'horizontalBarChart', 'scatterChart'].includes(item.type)) {
                if (dynamicData.xAxisData) finalProps.xAxisData = dynamicData.xAxisData
                if (dynamicData.seriesData) finalProps.seriesData = dynamicData.seriesData
            } else if (['pieChart', 'halfPieChart'].includes(item.type)) {
                if (dynamicData.pieData || Array.isArray(dynamicData)) {
                    finalProps.pieData = dynamicData.pieData || dynamicData
                }
            } else if (item.type === 'funnelChart') {
                if (dynamicData.funnelData || Array.isArray(dynamicData)) {
                    finalProps.funnelData = dynamicData.funnelData || dynamicData
                }
            } else if (item.type === 'mapChart') {
                if (dynamicData.mapData || Array.isArray(dynamicData)) {
                    finalProps.mapData = dynamicData.mapData || dynamicData
                }
            } else if (item.type === 'wordCloudChart') {
                if (dynamicData.wordCloudData || Array.isArray(dynamicData)) {
                    finalProps.wordCloudData = dynamicData.wordCloudData || dynamicData
                }
            } else if (item.type === 'scrollRankList') {
                if (dynamicData.rankListData || Array.isArray(dynamicData)) {
                    finalProps.rankListData = dynamicData.rankListData || dynamicData
                }
            } else if (item.type === 'carouselList') {
                if (dynamicData.carouselListData || Array.isArray(dynamicData)) {
                    finalProps.carouselListData = dynamicData.carouselListData || dynamicData
                }
            } else if (item.type === 'table') {
                if (dynamicData.tableData || Array.isArray(dynamicData)) {
                    finalProps.tableData = dynamicData.tableData || dynamicData
                }
                if (dynamicData.tableColumns) {
                    finalProps.tableColumns = dynamicData.tableColumns
                }
            } else if (item.type === 'progress') {
                // 支持直接返回数值或带 percent/value 属性的对象
                if (typeof dynamicData === 'number') {
                    finalProps.percent = dynamicData
                } else if (dynamicData) {
                    if (typeof dynamicData.percent === 'number') {
                        finalProps.percent = dynamicData.percent
                    } else if (typeof dynamicData.value === 'number') {
                        finalProps.percent = dynamicData.value
                    }
                }
            } else if (item.type === 'gaugeChart') {
                if (typeof dynamicData === 'number') {
                    finalProps.singleData = dynamicData
                } else if (dynamicData) {
                    if (typeof dynamicData.value === 'number') {
                        finalProps.singleData = dynamicData.value
                    }
                }
            } else if (item.type === 'calendarChart') {
                if (dynamicData.calendarData || Array.isArray(dynamicData)) {
                    finalProps.calendarData = dynamicData.calendarData || dynamicData
                }
            }

            return finalProps
        }

        // 使用静态数据
        return item.props
    }

    // 强制刷新图表的状态
    const [chartRefreshKey, setChartRefreshKey] = useState(0)

    // 监听图表主题变化事件
    useEffect(() => {
        const handleThemeChange = () => {
            setChartRefreshKey(prev => prev + 1)
        }

        window.addEventListener('chartThemeChanged', handleThemeChange)
        return () => {
            window.removeEventListener('chartThemeChanged', handleThemeChange)
        }
    }, [])

    // 缓存的图表配置
    const chartOption = useMemo(() => {
        const chartTypes = ['singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart',
            'horizontalBarChart', 'pieChart', 'halfPieChart', 'funnelChart', 'gaugeChart', 'radarChart', 'scatterChart', 'treeChart', 'sankeyChart']
        if (chartTypes.includes(item.type)) {
            const finalProps = getFinalChartData()
            // 获取当前主题颜色
            const themeColors = getCurrentThemeColors(state.canvasConfig)
            return finalProps.chartOption || getCachedChartOption(item.type, finalProps, themeColors)
        }
        if (item.type === 'calendarChart') {
            return getCalendarOption(item.props)
        }
        return null
    }, [item.type, item.props, dynamicData, state.canvasConfig?.chartTheme, chartRefreshKey])

    // 只有在非预览模式下才使用useDrag
    const [isDragging] = !previewMode ? (() => {
        const [{ isDragging }] = useDrag(() => ({
            type: 'CANVAS_COMPONENT',
            item: { id: item.id, type: 'CANVAS_COMPONENT' },
            canDrag: !item.locked && !previewMode,
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
            end: () => {
                // 拖拽结束，清除吸附线
                if (!previewMode) {
                    setSnapLines([])
                }
            }
        }), [item.id, item.locked, previewMode])
        return [isDragging]
    })() : [false]

    const handleClick = (e: React.MouseEvent) => {
        if (!previewMode) {
            e.stopPropagation()

            // Ctrl/Cmd + 点击实现多选
            if (e.ctrlKey || e.metaKey) {
                const currentSelectedIds = state.selectedIds || []
                if (currentSelectedIds.includes(item.id)) {
                    // 取消选中
                    selectComponents(currentSelectedIds.filter(id => id !== item.id))
                } else {
                    // 添加到选中列表
                    selectComponents([...currentSelectedIds, item.id])
                }
                return
            }

            // 普通点击：只选中当前组件，不自动选中整个组合
            selectComponent(item.id)
        }
    }

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (!previewMode && item.groupId) {
            e.stopPropagation()
            // 双击选中整个组合
            const groupComponents = state.components
                .filter(comp => comp.groupId === item.groupId)
                .map(comp => comp.id)
            selectComponents(groupComponents)
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (item.locked || previewMode) return
        e.stopPropagation()

        setIsLocalDragging(true)  // 开始拖拽

        const startX = e.clientX
        const startY = e.clientY
        // 考虑缩放比例
        const startPosX = item.style.x
        const startPosY = item.style.y

        // 获取画布尺寸
        const canvasWidth = state.canvasConfig?.width || 1920
        const canvasHeight = state.canvasConfig?.height || 1080

        // 获取需要一起拖拽的组件
        // 如果当前组件在多选列表中，拖拽所有选中的组件
        // 否则，只拖拽当前组件
        const selectedIds = state.selectedIds || []
        const componentsToDrag = selectedIds.includes(item.id) && selectedIds.length > 1
            ? state.components.filter(comp => selectedIds.includes(comp.id))
            : [item]

        // 记录所有组件的初始位置
        const initialPositions = componentsToDrag.map(comp => ({
            id: comp.id,
            startX: comp.style.x,
            startY: comp.style.y
        }))

        const handleMouseMove = (moveEvent: MouseEvent) => {
            // 这里的移动距离需要除以缩放比例，回到逻辑坐标系
            const deltaX = (moveEvent.clientX - startX) / state.scale
            const deltaY = (moveEvent.clientY - startY) / state.scale

            const newRawX = startPosX + deltaX
            const newRawY = startPosY + deltaY

            // 计算吸附 (Snap calculation stays same)
            const { x: snappedX, y: snappedY, snapLines } = calculateSnap(
                item.id,
                newRawX,
                newRawY,
                state.components
            )

            // 计算实际移动的偏移量
            const actualDeltaX = snappedX - startPosX
            const actualDeltaY = snappedY - startPosY

            // 更新所有需要拖拽的组件位置
            componentsToDrag.forEach((comp, index) => {
                let newX = initialPositions[index].startX + actualDeltaX
                let newY = initialPositions[index].startY + actualDeltaY

                // 边界限制：确保组件不会超出画布
                newX = Math.max(0, Math.min(newX, canvasWidth - comp.style.width))
                newY = Math.max(0, Math.min(newY, canvasHeight - comp.style.height))

                // 直接更新DOM以避免重新渲染
                const compElement = document.querySelector(`[data-component-id="${comp.id}"]`) as HTMLElement
                if (compElement) {
                    compElement.style.left = `${newX}px`
                    compElement.style.top = `${newY}px`
                }
            })

            // Only update snap lines in global state (transient)
            setSnapLines(snapLines)
        }

        const handleMouseUp = (upEvent: MouseEvent) => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            setSnapLines([])
            setIsLocalDragging(false)  // 结束拖拽

            // Commit final position to history
            // Re-calculate final position to be sure (or store in a ref)
            // For simplicity, we recalculate using same logic as last move
            // Better: store lastSnapped in a variable closure
            const deltaX = (upEvent.clientX - startX) / state.scale
            const deltaY = (upEvent.clientY - startY) / state.scale
            const newRawX = startPosX + deltaX
            const newRawY = startPosY + deltaY
            const { x: finalX, y: finalY } = calculateSnap(item.id, newRawX, newRawY, state.components)

            // 计算实际移动的偏移量
            const actualDeltaX = finalX - startPosX
            const actualDeltaY = finalY - startPosY

            // 更新所有需要拖拽的组件位置到状态
            componentsToDrag.forEach((comp, index) => {
                let newX = initialPositions[index].startX + actualDeltaX
                let newY = initialPositions[index].startY + actualDeltaY

                // 边界限制：确保组件不会超出画布
                newX = Math.max(0, Math.min(newX, canvasWidth - comp.style.width))
                newY = Math.max(0, Math.min(newY, canvasHeight - comp.style.height))

                // Only update if changed
                if (newX !== comp.style.x || newY !== comp.style.y) {
                    moveComponent(comp.id, newX, newY)
                }
            })
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }



    // Resize Handler
    const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation()
        if (item.locked) return

        const startX = e.clientX
        const startY = e.clientY
        const startItemX = item.style.x
        const startItemY = item.style.y
        const startWidth = item.style.width
        const startHeight = item.style.height

        // 获取画布尺寸
        const canvasWidth = state.canvasConfig?.width || 1920
        const canvasHeight = state.canvasConfig?.height || 1080

        // Closure variables to track final state
        let currentX = startItemX
        let currentY = startItemY
        let currentWidth = startWidth
        let currentHeight = startHeight

        const handleMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault()
            const deltaX = (moveEvent.clientX - startX) / state.scale
            const deltaY = (moveEvent.clientY - startY) / state.scale

            let newX = startItemX
            let newY = startItemY
            let newWidth = startWidth
            let newHeight = startHeight

            if (direction.includes('top')) {
                const h = startHeight - deltaY
                if (h > 10) {
                    newHeight = h
                    newY = startItemY + deltaY
                    // 边界限制：不能超出画布顶部
                    if (newY < 0) {
                        newY = 0
                        newHeight = startItemY + startHeight
                    }
                }
            }
            if (direction.includes('bottom')) {
                newHeight = Math.max(10, startHeight + deltaY)
                // 边界限制：不能超出画布底部
                if (startItemY + newHeight > canvasHeight) {
                    newHeight = canvasHeight - startItemY
                }
            }
            if (direction.includes('left')) {
                const w = startWidth - deltaX
                if (w > 10) {
                    newWidth = w
                    newX = startItemX + deltaX
                    // 边界限制：不能超出画布左侧
                    if (newX < 0) {
                        newX = 0
                        newWidth = startItemX + startWidth
                    }
                }
            }
            if (direction.includes('right')) {
                newWidth = Math.max(10, startWidth + deltaX)
                // 边界限制：不能超出画布右侧
                if (startItemX + newWidth > canvasWidth) {
                    newWidth = canvasWidth - startItemX
                }
            }

            // Update closure vars
            currentX = newX
            currentY = newY
            currentWidth = newWidth
            currentHeight = newHeight

            // Direct DOM update
            if (ref.current) {
                ref.current.style.left = `${newX}px`
                ref.current.style.top = `${newY}px`
                ref.current.style.width = `${newWidth}px`
                ref.current.style.height = `${newHeight}px`
            }
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)

            // Commit final state
            if (currentX !== startItemX || currentY !== startItemY || currentWidth !== startWidth || currentHeight !== startHeight) {
                updateComponent(item.id, {
                    style: {
                        ...item.style,
                        x: currentX,
                        y: currentY,
                        width: currentWidth,
                        height: currentHeight,
                    }
                })
            }
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }


    // I need to implement handleResizeMouseDown fully.
    // Re-writing the block below correctly.


    // 渲染组件内容
    const renderContent = () => {
        switch (item.type) {
            // 图表类
            // 图表类
            case 'singleLineChart':
            case 'doubleLineChart':
            case 'singleBarChart':
            case 'doubleBarChart':
            case 'horizontalBarChart':
            case 'pieChart':
            case 'halfPieChart':
            case 'funnelChart':
            case 'gaugeChart':
            case 'radarChart':
            case 'scatterChart':
                return (
                    <ReactECharts
                        option={chartOption!}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                        onEvents={{
                            click: (params: any) => {
                                triggerInteraction('click', {
                                    name: params.name,
                                    value: params.value,
                                    seriesName: params.seriesName,
                                    dataIndex: params.dataIndex,
                                    data: params.data,
                                })
                            },
                            mouseover: (params: any) => {
                                triggerInteraction('hover', {
                                    name: params.name,
                                    value: params.value,
                                    seriesName: params.seriesName,
                                    dataIndex: params.dataIndex,
                                })
                            },
                        }}
                    />
                )

            case 'wordCloudChart':
                const finalWordCloudProps = getFinalChartData()
                return (
                    <WordCloudChart
                        data={finalWordCloudProps.wordCloudData || []}
                        width={item.style.width}
                        height={item.style.height}
                        config={finalWordCloudProps.wordCloudConfig}
                    />
                )

            case 'mapChart':
                const finalMapProps = getFinalChartData()
                return (
                    <Suspense fallback={<div style={{ color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>加载地图...</div>}>
                        <MapChart
                            mapRegion={finalMapProps.mapRegion || 'china'}
                            mapData={finalMapProps.mapData}
                            chartTitle={finalMapProps.chartTitle}
                            autoHighlight={finalMapProps.autoHighlight}
                            highlightInterval={finalMapProps.highlightInterval}
                            highlightColor={finalMapProps.highlightColor}
                            highlightBorderColor={finalMapProps.highlightBorderColor}
                            highlightBorderWidth={finalMapProps.highlightBorderWidth}
                            highlightShowTooltip={finalMapProps.highlightShowTooltip}
                            highlightPauseOnHover={finalMapProps.highlightPauseOnHover}
                            highlightLabelColor={finalMapProps.highlightLabelColor}
                            highlightLabelFontSize={finalMapProps.highlightLabelFontSize}
                            highlightShadowBlur={finalMapProps.highlightShadowBlur}
                            highlightShadowColor={finalMapProps.highlightShadowColor}
                            onHighlightChange={(data) => {
                                triggerInteraction('autoHighlight', {
                                    name: data.name,
                                    value: data.value,
                                    dataIndex: data.dataIndex,
                                    mapRegion: data.mapRegion,
                                })
                            }}
                        />
                    </Suspense>
                )

            case 'cityMapChart':
                const finalCityMapProps = getFinalChartData()
                return (
                    <Suspense fallback={<div style={{ color: '#4a90e2', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>加载城市地图...</div>}>
                        <CityMapChart
                            cityName={finalCityMapProps.mapRegion || 'nanjing'}
                            mapData={finalCityMapProps.mapData}
                            chartTitle={finalCityMapProps.chartTitle}
                            showBuiltinData={finalCityMapProps.showBuiltinData !== false}
                            colorScheme={finalCityMapProps.colorScheme || 'blue'}
                            autoHighlight={finalCityMapProps.autoHighlight}
                            highlightInterval={finalCityMapProps.highlightInterval}
                            highlightColor={finalCityMapProps.highlightColor}
                            highlightBorderColor={finalCityMapProps.highlightBorderColor}
                            highlightBorderWidth={finalCityMapProps.highlightBorderWidth}
                            highlightShowTooltip={finalCityMapProps.highlightShowTooltip}
                            highlightPauseOnHover={finalCityMapProps.highlightPauseOnHover}
                            highlightLabelColor={finalCityMapProps.highlightLabelColor}
                            highlightLabelFontSize={finalCityMapProps.highlightLabelFontSize}
                            highlightShadowBlur={finalCityMapProps.highlightShadowBlur}
                            highlightShadowColor={finalCityMapProps.highlightShadowColor}
                            onHighlightChange={(data) => {
                                triggerInteraction('autoHighlight', {
                                    name: data.name,
                                    value: data.value,
                                    dataIndex: data.dataIndex,
                                    mapRegion: data.mapRegion,
                                })
                            }}
                        />
                    </Suspense>
                )

            case 'calendarChart':
                return (
                    <ReactECharts
                        option={chartOption!}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )

            case 'treeChart':
                return (
                    <ReactECharts
                        option={chartOption!}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )

            case 'sankeyChart':
                return (
                    <ReactECharts
                        option={chartOption!}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )
            // ... (Antd components continue)

            case 'table':
                const finalTableProps = getFinalChartData()
                return (
                    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                        {/* @ts-ignore */}
                        <Table
                            columns={finalTableProps.tableColumns || [
                                { title: '姓名', dataIndex: 'name', key: 'name' },
                                { title: '年龄', dataIndex: 'age', key: 'age' },
                            ]}
                            dataSource={finalTableProps.tableData || [
                                { key: '1', name: '张三', age: 32 },
                                { key: '2', name: '李四', age: 42 },
                            ]}
                            pagination={false}
                            size="small"
                        />
                    </div>
                )
            case 'scrollRankList':
                const finalRankProps = getFinalChartData()
                return (
                    <Suspense fallback={<div style={{ color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>加载中...</div>}>
                        <ScrollRankList
                            data={finalRankProps.rankListData || []}
                            config={finalRankProps.rankListConfig}
                        />
                    </Suspense>
                )
            case 'carouselList':
                const finalCarouselProps = getFinalChartData()
                return (
                    <Suspense fallback={<div style={{ color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>加载中...</div>}>
                        <CarouselList
                            data={finalCarouselProps.carouselListData || []}
                            config={finalCarouselProps.carouselListConfig}
                        />
                    </Suspense>
                )
            case 'text':
                const textShadowValue = item.props.textShadow
                    ? `${item.props.shadowOffsetX || 0}px ${item.props.shadowOffsetY || 0}px ${item.props.shadowBlur || 4}px ${item.props.shadowColor || 'rgba(0,0,0,0.5)'}`
                    : 'none'

                return (
                    <div style={{
                        color: item.props.color || '#ffffff',
                        fontSize: `${item.props.fontSize || 16}px`,
                        fontWeight: item.props.fontWeight || 'normal',
                        fontStyle: item.props.fontStyle || 'normal',
                        textDecoration: item.props.textDecoration || 'none',
                        textTransform: item.props.textTransform || 'none',
                        textAlign: item.props.textAlign || 'left',
                        letterSpacing: `${item.props.letterSpacing || 0}px`,
                        lineHeight: item.props.lineHeight || 1.5,
                        textShadow: textShadowValue,
                        backgroundColor: item.props.backgroundColor || 'transparent',
                        borderRadius: `${item.props.borderRadius || 0}px`,
                        borderWidth: `${item.props.borderWidth || 0}px`,
                        borderStyle: item.props.borderWidth ? 'solid' : 'none',
                        borderColor: item.props.borderColor || '#000000',
                        padding: `${item.props.padding || 8}px`,
                        opacity: item.props.opacity || 1,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: item.props.textAlign === 'center' ? 'center' : 'flex-start',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        boxSizing: 'border-box',
                    }}>
                        {item.props.content || '文本内容'}
                    </div>
                )
            case 'button':
                const buttonType = item.props.buttonType || 'primary'
                // 只有在 default 类型时才应用自定义背景色，其他类型使用 Ant Design 的预设样式
                const shouldApplyCustomBg = buttonType === 'default' && item.props.backgroundColor
                return (
                    <Button
                        type={buttonType}
                        disabled={item.props.disabled || false}
                        loading={item.props.loading || false}
                        block={item.props.block || false}
                        danger={item.props.danger || false}
                        style={{
                            fontSize: `${item.props.fontSize || 14}px`,
                            fontWeight: item.props.fontWeight || 'normal',
                            ...(shouldApplyCustomBg && { backgroundColor: item.props.backgroundColor }),
                            ...(item.props.color && { color: item.props.color }),
                            borderRadius: `${item.props.borderRadius || 4}px`,
                            ...(item.props.borderWidth && {
                                borderWidth: `${item.props.borderWidth}px`,
                                borderColor: item.props.borderColor || '#000000',
                            }),
                            ...(item.props.padding && { padding: `${item.props.padding}px` }),
                            width: item.props.block ? '100%' : 'auto',
                        }}
                    >
                        {item.props.content || '按钮'}
                    </Button>
                )
            case 'input':
                return (
                    <Input
                        type={item.props.inputType || 'text'}
                        placeholder={item.props.placeholder || '请输入内容'}
                        value={item.props.content || ''}
                        onChange={(e) => {
                            if (!previewMode) {
                                updateComponent(item.id, {
                                    props: {
                                        ...item.props,
                                        content: e.target.value
                                    }
                                })
                            }
                        }}
                        disabled={item.props.disabled || false}
                        allowClear={item.props.allowClear !== false}
                        showCount={item.props.showCount || false}
                        maxLength={item.props.maxLength || undefined}
                        style={{
                            color: item.props.color || '#ffffff',
                            fontSize: `${item.props.fontSize || 14}px`,
                            fontWeight: item.props.fontWeight || 'normal',
                            backgroundColor: item.props.backgroundColor || 'rgba(0,0,0,0.3)',
                            borderRadius: `${item.props.borderRadius || 4}px`,
                            borderWidth: `${item.props.borderWidth || 1}px`,
                            borderColor: item.props.borderColor || '#434343',
                            padding: `${item.props.padding || 8}px`,
                            width: '100%',
                        }}
                    />
                )
            case 'select':
                return (
                    <Select
                        placeholder="请选择"
                        style={{ width: '100%' }}
                        value={item.props.content}
                        options={item.props.selectOptions || [{ value: '1', label: '选项1' }, { value: '2', label: '选项2' }]}
                    />
                )
            case 'futuristicTitle':
                return (
                    <FuturisticTitle
                        content={item.props.content}
                        subContent={item.props.subContent}
                        titleColor={item.props.titleColor}
                        fontSize={item.props.fontSize}
                    />
                )
                // 蓝色科技主题地球组件
                function Earth() {
                    const meshRef = useRef<any>(null)
                    const atmosphereRef = useRef<any>(null)
                    const ringRef = useRef<any>(null)

                    useFrame((_state) => {
                        if (meshRef.current) {
                            meshRef.current.rotation.y += 0.005
                        }
                        if (atmosphereRef.current) {
                            atmosphereRef.current.rotation.y -= 0.003
                        }
                        if (ringRef.current) {
                            ringRef.current.rotation.x += 0.01
                            ringRef.current.rotation.z += 0.005
                        }
                    })

                    return (
                        <group>
                            {/* 主地球 */}
                            <mesh ref={meshRef}>
                                <sphereGeometry args={[1.2, 64, 64]} />
                                <meshStandardMaterial
                                    color="#1a237e"
                                    emissive="#0d47a1"
                                    emissiveIntensity={0.2}
                                    metalness={0.8}
                                    roughness={0.2}
                                    transparent
                                    opacity={0.9}
                                />
                            </mesh>

                            {/* 大气层光晕 */}
                            <mesh ref={atmosphereRef}>
                                <sphereGeometry args={[1.35, 32, 32]} />
                                <meshStandardMaterial
                                    color="#2196f3"
                                    emissive="#03a9f4"
                                    emissiveIntensity={0.3}
                                    transparent
                                    opacity={0.3}
                                    side={2} // DoubleSide
                                />
                            </mesh>

                            {/* 外层光环 */}
                            <mesh ref={ringRef}>
                                <torusGeometry args={[1.8, 0.02, 8, 64]} />
                                <meshStandardMaterial
                                    color="#00bcd4"
                                    emissive="#00acc1"
                                    emissiveIntensity={0.5}
                                    transparent
                                    opacity={0.8}
                                />
                            </mesh>

                            {/* 内层光环 */}
                            <mesh rotation={[Math.PI / 3, 0, Math.PI / 4]}>
                                <torusGeometry args={[1.6, 0.015, 6, 48]} />
                                <meshStandardMaterial
                                    color="#4fc3f7"
                                    emissive="#29b6f6"
                                    emissiveIntensity={0.4}
                                    transparent
                                    opacity={0.6}
                                />
                            </mesh>
                        </group>
                    )
                }

                // 3D魔方组件
                function AnimatedCube() {
                    const meshRef = useRef<any>(null)

                    useFrame((_state) => {
                        if (meshRef.current) {
                            meshRef.current.rotation.x += 0.01
                            meshRef.current.rotation.y += 0.01
                        }
                    })

                    return (
                        <mesh ref={meshRef}>
                            <boxGeometry args={[2, 2, 2]} />
                            <meshStandardMaterial
                                color="#ff6b6b"
                                metalness={0.7}
                                roughness={0.2}
                                wireframe={false}
                            />
                        </mesh>
                    )
                }

                // DNA螺旋组件
                function DNAHelix() {
                    const groupRef = useRef<any>(null)

                    useFrame((_state) => {
                        if (groupRef.current) {
                            groupRef.current.rotation.y += 0.02
                        }
                    })

                    const helixPoints = []
                    for (let i = 0; i < 100; i++) {
                        const angle = (i / 100) * Math.PI * 8
                        const x = Math.cos(angle) * 0.5
                        const z = Math.sin(angle) * 0.5
                        const y = (i / 100) * 4 - 2
                        helixPoints.push([x, y, z])
                    }

                    return (
                        <group ref={groupRef}>
                            {helixPoints.map((point, index) => (
                                <mesh key={index} position={[point[0], point[1], point[2]]}>
                                    <sphereGeometry args={[0.05, 8, 8]} />
                                    <meshStandardMaterial color={index % 2 === 0 ? "#4ecdc4" : "#ff6b6b"} />
                                </mesh>
                            ))}
                        </group>
                    )
                }

                // 3D波浪组件
                function Wave3D() {
                    const meshRef = useRef<any>(null)

                    useFrame((state) => {
                        if (meshRef.current) {
                            const time = state.clock.elapsedTime
                            const geometry = meshRef.current.geometry
                            const positions = geometry.attributes.position.array

                            for (let i = 0; i < positions.length; i += 3) {
                                const x = positions[i]
                                const z = positions[i + 2]
                                positions[i + 1] = Math.sin(x * 2 + time) * Math.cos(z * 2 + time) * 0.3
                            }

                            geometry.attributes.position.needsUpdate = true
                        }
                    })

                    return (
                        <mesh ref={meshRef}>
                            <planeGeometry args={[4, 4, 32, 32]} />
                            <meshStandardMaterial color="#4ecdc4" wireframe />
                        </mesh>
                    )
                }

                // 3D环形组件
                function AnimatedTorus() {
                    const meshRef = useRef<any>(null)

                    useFrame((_state) => {
                        if (meshRef.current) {
                            meshRef.current.rotation.x += 0.01
                            meshRef.current.rotation.y += 0.02
                        }
                    })

                    return (
                        <mesh ref={meshRef}>
                            <torusGeometry args={[1, 0.4, 16, 100]} />
                            <meshStandardMaterial
                                color="#ff9f43"
                                metalness={0.8}
                                roughness={0.1}
                            />
                        </mesh>
                    )
                }

                // 星系组件
                function Galaxy() {
                    const pointsRef = useRef<any>(null)

                    useFrame((_state) => {
                        if (pointsRef.current) {
                            pointsRef.current.rotation.y += 0.005
                        }
                    })

                    const count = 5000
                    const positions = new Float32Array(count * 3)
                    const colors = new Float32Array(count * 3)

                    for (let i = 0; i < count; i++) {
                        const i3 = i * 3
                        const radius = Math.random() * 3
                        const spinAngle = radius * 2
                        const branchAngle = (i % 3) * (Math.PI * 2) / 3

                        positions[i3] = Math.cos(branchAngle + spinAngle) * radius
                        positions[i3 + 1] = (Math.random() - 0.5) * 0.3
                        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius

                        colors[i3] = Math.random()
                        colors[i3 + 1] = Math.random()
                        colors[i3 + 2] = Math.random()
                    }

                    return (
                        <points ref={pointsRef}>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    args={[positions, 3]}
                                />
                                <bufferAttribute
                                    attach="attributes-color"
                                    args={[colors, 3]}
                                />
                            </bufferGeometry>
                            <pointsMaterial size={0.02} vertexColors />
                        </points>
                    )
                }

                // 时空隧道组件
                function Tunnel() {
                    const groupRef = useRef<any>(null)

                    useFrame((_state) => {
                        if (groupRef.current) {
                            groupRef.current.rotation.z += 0.02
                        }
                    })

                    const rings = []
                    for (let i = 0; i < 20; i++) {
                        rings.push(
                            <mesh key={i} position={[0, 0, -i * 0.5]}>
                                <torusGeometry args={[1 + i * 0.1, 0.05, 8, 32]} />
                                <meshStandardMaterial
                                    color={`hsl(${i * 18}, 70%, 50%)`}
                                    emissive={`hsl(${i * 18}, 70%, 20%)`}
                                />
                            </mesh>
                        )
                    }

                    return <group ref={groupRef}>{rings}</group>
                }

                // 矩阵雨组件
                function MatrixRain() {
                    const pointsRef = useRef<any>(null)

                    useFrame((_state) => {
                        if (pointsRef.current) {
                            const positions = pointsRef.current.geometry.attributes.position.array
                            for (let i = 1; i < positions.length; i += 3) {
                                positions[i] -= 0.02
                                if (positions[i] < -3) {
                                    positions[i] = 3
                                }
                            }
                            pointsRef.current.geometry.attributes.position.needsUpdate = true
                        }
                    })

                    const count = 1000
                    const positions = new Float32Array(count * 3)

                    for (let i = 0; i < count; i++) {
                        const i3 = i * 3
                        positions[i3] = (Math.random() - 0.5) * 6
                        positions[i3 + 1] = Math.random() * 6 - 3
                        positions[i3 + 2] = (Math.random() - 0.5) * 6
                    }

                    return (
                        <points ref={pointsRef}>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    args={[positions, 3]}
                                />
                            </bufferGeometry>
                            <pointsMaterial size={0.05} color="#00ff00" />
                        </points>
                    )
                }

                // 等离子球组件
                function PlasmaBall() {
                    const meshRef = useRef<any>(null)

                    useFrame((state) => {
                        if (meshRef.current) {
                            meshRef.current.rotation.y += 0.01
                            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
                        }
                    })

                    return (
                        <mesh ref={meshRef}>
                            <sphereGeometry args={[1.5, 64, 64]} />
                            <meshStandardMaterial
                                color="#ff6b6b"
                                emissive="#ff1744"
                                emissiveIntensity={0.3}
                                metalness={0.8}
                                roughness={0.2}
                            />
                        </mesh>
                    )
                }

            // ... inside renderContent ...
            // 3D 组件
            case 'threeEarth':
                return (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'auto',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        background: 'linear-gradient(135deg, #0a0e27 0%, #1a237e 50%, #0d47a1 100%)'
                    }}>
                        <Canvas
                            camera={{ position: [0, 0, 4] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            {/* 增强的蓝色科技主题光照 */}
                            <ambientLight intensity={0.3} color="#4fc3f7" />
                            <pointLight position={[10, 10, 10]} intensity={1} color="#00bcd4" />
                            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#2196f3" />
                            <directionalLight position={[0, 5, 5]} intensity={0.8} color="#03a9f4" />

                            <Suspense fallback={
                                <Sphere args={[1.2, 32, 32]} visible>
                                    <meshStandardMaterial
                                        color="#1E90FF"
                                        emissive="#0066cc"
                                        emissiveIntensity={0.3}
                                        wireframe
                                    />
                                </Sphere>
                            }>
                                <Earth />
                            </Suspense>
                            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} makeDefault />
                            <Stars radius={100} depth={50} count={3000} factor={2} saturation={0} fade speed={0.5} />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: '#4fc3f7',
                            pointerEvents: 'none',
                            background: 'rgba(13, 71, 161, 0.8)',
                            padding: '4px 8px',
                            fontSize: 11,
                            borderRadius: '4px',
                            border: '1px solid rgba(79, 195, 247, 0.3)',
                            backdropFilter: 'blur(4px)'
                        }}>
                            🌍 蓝色科技地球
                        </div>
                    </div>
                )
            case 'threeParticles':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', position: 'absolute', top: 0, left: 0 }}>
                        <Canvas
                            camera={{ position: [0, 0, 5] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
                            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} makeDefault />
                        </Canvas>
                    </div>
                )
            case 'threeCube':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', position: 'absolute', top: 0, left: 0 }}>
                        <Canvas
                            camera={{ position: [0, 0, 5] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
                            <AnimatedCube />
                            <OrbitControls enableZoom={true} makeDefault />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: 'white',
                            pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', fontSize: 10
                        }}>
                            3D 魔方
                        </div>
                    </div>
                )
            case 'threeDNA':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', position: 'absolute', top: 0, left: 0 }}>
                        <Canvas
                            camera={{ position: [0, 0, 5] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
                            <DNAHelix />
                            <OrbitControls enableZoom={true} makeDefault />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: 'white',
                            pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', fontSize: 10
                        }}>
                            DNA 螺旋
                        </div>
                    </div>
                )
            case 'threeWave':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', position: 'absolute', top: 0, left: 0 }}>
                        <Canvas
                            camera={{ position: [0, 2, 5] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
                            <Wave3D />
                            <OrbitControls enableZoom={true} makeDefault />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: 'white',
                            pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', fontSize: 10
                        }}>
                            3D 波浪
                        </div>
                    </div>
                )
            case 'threeTorus':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', position: 'absolute', top: 0, left: 0 }}>
                        <Canvas
                            camera={{ position: [0, 0, 5] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
                            <AnimatedTorus />
                            <OrbitControls enableZoom={true} makeDefault />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: 'white',
                            pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', fontSize: 10
                        }}>
                            3D 环形
                        </div>
                    </div>
                )
            case 'threeGalaxy':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', position: 'absolute', top: 0, left: 0 }}>
                        <Canvas
                            camera={{ position: [0, 2, 5] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            <ambientLight intensity={0.2} />
                            <Galaxy />
                            <OrbitControls enableZoom={true} makeDefault />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: 'white',
                            pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', fontSize: 10
                        }}>
                            星系
                        </div>
                    </div>
                )
            case 'threeTunnel':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', position: 'absolute', top: 0, left: 0 }}>
                        <Canvas
                            camera={{ position: [0, 0, 5] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            <ambientLight intensity={0.3} />
                            <pointLight position={[0, 0, 10]} />
                            <Tunnel />
                            <OrbitControls enableZoom={true} makeDefault />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: 'white',
                            pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', fontSize: 10
                        }}>
                            时空隧道
                        </div>
                    </div>
                )
            case 'threeMatrix':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', position: 'absolute', top: 0, left: 0, backgroundColor: '#000' }}>
                        <Canvas
                            camera={{ position: [0, 0, 5] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            <MatrixRain />
                            <OrbitControls enableZoom={true} makeDefault />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: '#00ff00',
                            pointerEvents: 'none', background: 'rgba(0,0,0,0.8)', padding: '2px 5px', fontSize: 10
                        }}>
                            矩阵雨
                        </div>
                    </div>
                )
            case 'threePlasma':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', position: 'absolute', top: 0, left: 0 }}>
                        <Canvas
                            camera={{ position: [0, 0, 5] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            <ambientLight intensity={0.2} />
                            <PlasmaBall />
                            <OrbitControls enableZoom={true} makeDefault />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: 'white',
                            pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', fontSize: 10
                        }}>
                            等离子球
                        </div>
                    </div>
                )
            case 'switch':
                return <Switch checked={item.props.checked} />
            case 'progress':
                const finalProgressProps = getFinalChartData()
                return <Progress percent={finalProgressProps.percent || 50} style={{ width: '100%' }} />
            case 'tag':
                return (
                    <Tag
                        closable={item.props.closable || false}
                        style={{
                            backgroundColor: item.props.tagColor || '#1890ff',
                            color: item.props.color || '#ffffff',
                            fontSize: `${item.props.fontSize || 14}px`,
                            fontWeight: item.props.fontWeight || 'normal',
                            borderRadius: `${item.props.borderRadius || 4}px`,
                            borderWidth: `${item.props.borderWidth || 0}px`,
                            borderStyle: item.props.borderWidth ? 'solid' : 'none',
                            borderColor: item.props.borderColor || '#000000',
                            padding: `${item.props.padding || 4}px 8px`,
                        }}
                    >
                        {item.props.content || '标签'}
                    </Tag>
                )
            case 'badge':
                const badgeCount = typeof item.props.countValue === 'number'
                    ? (item.props.countValue > 99 ? '99+' : item.props.countValue)
                    : (item.props.content || '99+')
                return <Badge count={badgeCount}><Avatar shape="square" /></Badge>
            case 'avatar':
                return <Avatar size={64} icon={<UserOutlined />} />
            case 'card':
                return (
                    <Card
                        size="small"
                        title={item.props.chartTitle || "卡片标题"}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {item.props.content || '卡片内容'}
                    </Card>
                )


            // 小组件 - 装饰边框
            case 'borderBox1':
                return (
                    <BorderBox1
                        width={item.style.width}
                        height={item.style.height}
                        borderColor={item.props.borderColor}
                        glowColor={item.props.glowColor}
                        borderWidth={item.props.borderWidth}
                    >
                        {item.props.content || ''}
                    </BorderBox1>
                )
            case 'borderBox2':
                return (
                    <BorderBox2
                        width={item.style.width}
                        height={item.style.height}
                        borderColor={item.props.borderColor}
                        glowColor={item.props.glowColor}
                        borderWidth={item.props.borderWidth}
                    >
                        {item.props.content || ''}
                    </BorderBox2>
                )
            case 'borderBox3':
                return (
                    <BorderBox3
                        width={item.style.width}
                        height={item.style.height}
                        borderColor={item.props.borderColor}
                        glowColor={item.props.glowColor}
                        borderWidth={item.props.borderWidth}
                        animationDuration={item.props.animationDuration}
                    >
                        {item.props.content || ''}
                    </BorderBox3>
                )
            case 'customImageBorder':
                return (
                    <CustomImageBorder
                        width={item.style.width}
                        height={item.style.height}
                        customBorderImage={item.props.customBorderImage}
                        borderImageSlice={item.props.borderImageSlice}
                        borderImageWidth={item.props.borderImageWidth}
                        borderImageRepeat={item.props.borderImageRepeat}
                        borderImageOutset={item.props.borderImageOutset}
                        borderImageOpacity={item.props.borderImageOpacity}
                        borderImageMode={item.props.borderImageMode}
                        previewMode={previewMode}
                        onImageChange={(imageUrl) => {
                            if (!previewMode) {
                                updateComponent(item.id, {
                                    props: { ...item.props, customBorderImage: imageUrl }
                                })
                            }
                        }}
                        onConfigChange={(config) => {
                            if (!previewMode) {
                                updateComponent(item.id, {
                                    props: { ...item.props, ...config }
                                })
                            }
                        }}
                    />
                )
            case 'fullscreenButton':
                return (
                    <FullscreenButton
                        width={item.style.width}
                        height={item.style.height}
                        buttonSize={item.props.buttonSize}
                        iconSize={item.props.iconSize}
                        buttonColor={item.props.buttonColor}
                        hoverColor={item.props.hoverColor}
                        position={item.props.position}
                        customIcon={item.props.customIcon}
                        showText={item.props.showText}
                        onIconChange={(iconType) => {
                            if (!previewMode) {
                                updateComponent(item.id, {
                                    props: { ...item.props, customIcon: iconType }
                                })
                            }
                        }}
                    >
                        {item.props.showText ? (item.props.content || '点击全屏') : null}
                    </FullscreenButton>
                )
            case 'decoration1':
                return <div className="decoration decoration-1" />
            case 'decoration2':
                return <div className="decoration decoration-2" />
            case 'container':
                return (
                    <div className="canvas-item-container-placeholder">
                        <span>容器</span>
                    </div>
                )

            // 布局组件
            case 'layoutTwoColumn':
                return (
                    <div
                        className="layout-component layout-two-column"
                        style={{
                            flexDirection: item.props.layoutConfig?.direction === 'vertical' ? 'column' : 'row',
                            gap: item.props.layoutConfig?.gap ?? 8
                        }}
                    >
                        <LayoutCell previewMode={previewMode}
                            layoutId={item.id}
                            cellIndex={0}
                            cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '上方' : '左栏'}
                            cellConfig={item.props.layoutConfig?.cells?.[0]}
                        />
                        <LayoutCell previewMode={previewMode}
                            layoutId={item.id}
                            cellIndex={1}
                            cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '下方' : '右栏'}
                            cellConfig={item.props.layoutConfig?.cells?.[1]}
                        />
                    </div>
                )
            case 'layoutThreeColumn':
                return (
                    <div
                        className="layout-component layout-three-column"
                        style={{
                            flexDirection: item.props.layoutConfig?.direction === 'vertical' ? 'column' : 'row',
                            gap: item.props.layoutConfig?.gap ?? 8
                        }}
                    >
                        <LayoutCell previewMode={previewMode}
                            layoutId={item.id}
                            cellIndex={0}
                            cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '上方' : '左栏'}
                            cellConfig={item.props.layoutConfig?.cells?.[0]}
                        />
                        <LayoutCell previewMode={previewMode}
                            layoutId={item.id}
                            cellIndex={1}
                            cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '中间' : '中栏'}
                            cellConfig={item.props.layoutConfig?.cells?.[1]}
                        />
                        <LayoutCell previewMode={previewMode}
                            layoutId={item.id}
                            cellIndex={2}
                            cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '下方' : '右栏'}
                            cellConfig={item.props.layoutConfig?.cells?.[2]}
                        />
                    </div>
                )
            case 'layoutHeader':
                return (
                    <div
                        className="layout-component layout-header"
                        style={{
                            flexDirection: item.props.layoutConfig?.direction === 'horizontal' ? 'row' : 'column',
                            gap: item.props.layoutConfig?.gap ?? 8
                        }}
                    >
                        <LayoutCell previewMode={previewMode}
                            layoutId={item.id}
                            cellIndex={0}
                            cellLabel={item.props.layoutConfig?.direction === 'horizontal' ? '侧栏' : '头部'}
                            className="layout-header-top"
                            cellConfig={item.props.layoutConfig?.cells?.[0]}
                        />
                        <LayoutCell previewMode={previewMode}
                            layoutId={item.id}
                            cellIndex={1}
                            cellLabel="内容区"
                            className="layout-header-content"
                            cellConfig={item.props.layoutConfig?.cells?.[1]}
                        />
                    </div>
                )
            case 'layoutSidebar':
                return (
                    <div
                        className="layout-component layout-sidebar"
                        style={{
                            flexDirection: item.props.layoutConfig?.direction === 'vertical' ? 'column' : 'row',
                            gap: item.props.layoutConfig?.gap ?? 8
                        }}
                    >
                        <LayoutCell previewMode={previewMode}
                            layoutId={item.id}
                            cellIndex={0}
                            cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '头部' : '侧栏'}
                            className="layout-sidebar-left"
                            cellConfig={item.props.layoutConfig?.cells?.[0]}
                        />
                        <LayoutCell previewMode={previewMode}
                            layoutId={item.id}
                            cellIndex={1}
                            cellLabel="内容区"
                            className="layout-sidebar-content"
                            cellConfig={item.props.layoutConfig?.cells?.[1]}
                        />
                    </div>
                )

            // 图片
            case 'image':
                return (
                    <div className="canvas-item-image-placeholder" style={{ width: '100%', height: '100%' }}>
                        {item.props.src ? (
                            <img
                                src={item.props.src}
                                alt={item.props.alt || ''}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    display: 'block',
                                    pointerEvents: 'none'
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#2a2a2a',
                                color: '#aaa'
                            }}>
                                <span>图片占位</span>
                            </div>
                        )}
                    </div>
                )
            case 'carousel':
                return (
                    <Carousel
                        images={item.props.carouselImages || []}
                        config={item.props.carouselConfig}
                        isDragging={isLocalDragging || isDragging}
                    />
                )

            // 图标 (Updated)
            case 'icon':
                const iconType = item.props.iconType
                let IconComp: React.ComponentType | React.ReactNode = null

                // 1. Try AntdIcons by name (e.g. "SearchOutlined")
                if (iconType && (AntdIcons as any)[iconType]) {
                    const AntIcon = (AntdIcons as any)[iconType]
                    IconComp = <AntIcon />
                }
                // 2. Fallback to legacy map (e.g. "smile")
                else if (iconType && iconMap[iconType]) {
                    IconComp = iconMap[iconType]
                }
                // 3. Default
                else {
                    IconComp = <SmileOutlined />
                }

                return (
                    <div className="canvas-item-icon" style={{ fontSize: item.style.fontSize || 32, color: item.style.color || '#1890ff' }}>
                        {IconComp}
                    </div>
                )

            case 'gradientText':
                return (
                    <GradientText
                        key={`${item.id}-${JSON.stringify(item.props.gradientColors)}`}
                        props={item.props}
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />
                )

            case 'flipCountdown':
                return (
                    <FlipCountdown
                        countdownMode={item.props.countdownMode}
                        targetDate={item.props.targetDate}
                        countdownDuration={item.props.countdownDuration}
                        showDays={item.props.showDays}
                        showHours={item.props.showHours}
                        showMinutes={item.props.showMinutes}
                        showSeconds={item.props.showSeconds}
                        cardWidth={item.props.cardWidth}
                        cardHeight={item.props.cardHeight}
                        fontSize={item.props.fontSize}
                        cardColorType={item.props.cardColorType}
                        cardSolidColor={item.props.cardSolidColor}
                        cardGradientStart={item.props.cardGradientStart}
                        cardGradientEnd={item.props.cardGradientEnd}
                        textColor={item.props.textColor}
                        labelColor={item.props.labelColor}
                        showLabels={item.props.showLabels}
                        separator={item.props.separator}
                    />
                )

            default:
                return null
        }
    }

    if (!item.visible) return null

    return (
        <div
            ref={ref}
            data-component-id={item.id}
            className={`canvas-item ${isInLayoutCell ? 'in-layout-cell' : ''} ${!previewMode && isSelected ? 'selected' : ''} ${item.locked ? 'locked' : ''} ${!previewMode && item.groupId ? 'grouped' : ''} ${!previewMode && item.isGroup ? 'group-main' : ''}`}
            style={{
                position: isInLayoutCell ? 'absolute' : 'absolute',
                left: item.style.x,
                top: item.style.y,
                width: item.style.width,
                height: item.style.height,
                backgroundColor: item.type === 'gradientText' ? 'transparent' : item.style.backgroundColor,
                borderRadius: item.style.borderRadius,
                opacity: isDragging && !previewMode ? 0.5 : (item.style.opacity ?? 1),
                zIndex: item.style.zIndex,
                cursor: !previewMode && !item.locked ? 'move' : 'default',
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
            onContextMenu={onContextMenu}
        >
            {renderContent()}
            {/* 联动角标 - 显示联动规则数量 */}
            {!previewMode && hasInteractions && (
                <div
                    className="interaction-badge"
                    title={`${item.interactions?.length || 0} 条交互规则`}
                >
                    ⚡{item.interactions?.length}
                </div>
            )}
            {!previewMode && isSelected && (
                <>
                    <div className="resize-handle top-left" onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')} />
                    <div className="resize-handle top" onMouseDown={(e) => handleResizeMouseDown(e, 'top')} />
                    <div className="resize-handle top-right" onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')} />
                    <div className="resize-handle right" onMouseDown={(e) => handleResizeMouseDown(e, 'right')} />
                    <div className="resize-handle bottom-right" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')} />
                    <div className="resize-handle bottom" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')} />
                    <div className="resize-handle bottom-left" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')} />
                    <div className="resize-handle left" onMouseDown={(e) => handleResizeMouseDown(e, 'left')} />
                </>
            )}
        </div>
    )
}
