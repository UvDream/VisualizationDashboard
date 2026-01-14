import { useRef, Suspense, lazy } from 'react'
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
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere } from '@react-three/drei'
import { TextureLoader } from 'three'
import { useEditor } from '../../context/EditorContext'
import { calculateSnap } from '../../utils/snapping'
import type { ComponentItem } from '../../types'
import './index.less'

// 懒加载地图组件
const MapChart = lazy(() => import('./MapChart'))
const ScrollRankList = lazy(() => import('./ScrollRankList'))
const CarouselList = lazy(() => import('./CarouselList'))

interface CanvasItemProps {
    item: ComponentItem
    onContextMenu?: (e: React.MouseEvent) => void
    previewMode?: boolean
}

// ECharts 默认配置
const getChartOption = (type: string, props: ComponentItem['props']) => {
    // 构建X轴配置
    const buildAxisConfig = (axisConfig: any, defaultType: string, defaultData?: any[]) => {
        const config: any = {
            type: axisConfig?.type || defaultType,
            show: axisConfig?.show !== false,
            name: axisConfig?.name,
            nameLocation: axisConfig?.nameLocation,
            nameGap: axisConfig?.nameGap,
            position: axisConfig?.position,
        }

        // 名称文本样式
        if (axisConfig?.nameTextStyle) {
            config.nameTextStyle = {
                color: axisConfig.nameTextStyle.color || '#fff',
                fontSize: axisConfig.nameTextStyle.fontSize || 12,
                fontWeight: axisConfig.nameTextStyle.fontWeight || 'normal',
            }
        }

        // 轴线
        if (axisConfig?.axisLine) {
            config.axisLine = {
                show: axisConfig.axisLine.show !== false,
                lineStyle: {
                    color: axisConfig.axisLine.lineStyle?.color || '#ccc',
                    width: axisConfig.axisLine.lineStyle?.width || 1,
                    type: axisConfig.axisLine.lineStyle?.type || 'solid',
                }
            }
        }

        // 刻度线
        if (axisConfig?.axisTick) {
            config.axisTick = {
                show: axisConfig.axisTick.show !== false,
                lineStyle: {
                    color: axisConfig.axisTick.lineStyle?.color || '#ccc',
                    width: axisConfig.axisTick.lineStyle?.width || 1,
                }
            }
        }

        // 轴标签
        if (axisConfig?.axisLabel) {
            config.axisLabel = {
                show: axisConfig.axisLabel.show !== false,
                color: axisConfig.axisLabel.color || '#fff',
                fontSize: axisConfig.axisLabel.fontSize || 12,
                fontWeight: axisConfig.axisLabel.fontWeight || 'normal',
                rotate: axisConfig.axisLabel.rotate || 0,
                margin: axisConfig.axisLabel.margin || 8,
            }
        }

        // 分割线
        if (axisConfig?.splitLine) {
            config.splitLine = {
                show: axisConfig.splitLine.show !== false,
                lineStyle: {
                    color: axisConfig.splitLine.lineStyle?.color || '#333',
                    width: axisConfig.splitLine.lineStyle?.width || 1,
                    type: axisConfig.splitLine.lineStyle?.type || 'solid',
                    opacity: axisConfig.splitLine.lineStyle?.opacity || 1,
                }
            }
        }

        // 分割区域
        if (axisConfig?.splitArea) {
            config.splitArea = {
                show: axisConfig.splitArea.show !== false,
                areaStyle: {
                    color: axisConfig.splitArea.areaStyle?.color || ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
                    opacity: axisConfig.splitArea.areaStyle?.opacity || 0.3,
                }
            }
        }

        // 数据
        if (defaultData) {
            config.data = defaultData
        }

        return config
    }

    const baseOption = {
        backgroundColor: 'transparent',
        title: props.chartTitle ? { text: props.chartTitle, left: 'center', textStyle: { color: '#fff' } } : undefined,
        grid: {
            top: props.chartTitle ? 40 : 30,
            right: props.legend?.show && props.legend.orient === 'vertical' && props.legend.left === 'right' ? 100 : 20,
            bottom: props.legend?.show && props.legend.top === 'bottom' ? 60 : 30,
            left: props.legend?.show && props.legend.orient === 'vertical' && props.legend.left === 'left' ? 100 : 40,
        },
        tooltip: { trigger: 'axis' },
        legend: props.legend?.show ? {
            show: true,
            orient: props.legend.orient || 'horizontal',
            left: props.legend.left || 'center',
            top: props.legend.top || 'top',
            textStyle: {
                color: props.legend.textStyle?.color || '#fff',
                fontSize: props.legend.textStyle?.fontSize || 12,
                fontWeight: props.legend.textStyle?.fontWeight || 'normal',
            },
        } : { show: false },
    }

    const xAxis = buildAxisConfig(props.xAxisConfig, 'category', props.xAxisData || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    const yAxis = buildAxisConfig(props.yAxisConfig, 'value')
    // 为不同图表类型生成 series
    const commonSeries = props.seriesData?.map(s => {
        const baseSeries = {
            ...s,
            type: (type === 'singleLineChart' || type === 'doubleLineChart') ? 'line' :
                (type === 'singleBarChart' || type === 'doubleBarChart' || type === 'horizontalBarChart') ? 'bar' :
                    type === 'scatterChart' ? 'scatter' :
                        type === 'radarChart' ? 'radar' : 'line'
        }

        // 为折线图添加符号配置
        if (type === 'singleLineChart' || type === 'doubleLineChart') {
            // 优先使用系列自身的符号配置，否则使用全局配置
            const symbolConfig = s.symbolConfig || props.symbolConfig;
            if (symbolConfig) {
                return {
                    ...baseSeries,
                    showSymbol: symbolConfig.show !== false,
                    symbol: symbolConfig.type || 'circle',
                    symbolSize: symbolConfig.size || 4,
                    symbolRotate: symbolConfig.type === 'arrow' ? 0 : undefined,
                    itemStyle: {
                        color: symbolConfig.color || '#c23531',
                        borderColor: symbolConfig.borderColor || '#fff',
                        borderWidth: symbolConfig.borderWidth || 1,
                        opacity: symbolConfig.opacity || 1
                    }
                }
            }
        }

        // 为散点图也支持符号配置
        if (type === 'scatterChart') {
            // 优先使用系列自身的符号配置，否则使用全局配置
            const symbolConfig = s.symbolConfig || props.symbolConfig;
            if (symbolConfig) {
                return {
                    ...baseSeries,
                    symbol: symbolConfig.type && symbolConfig.type !== 'none' ? symbolConfig.type : 'circle',
                    symbolSize: symbolConfig.size || 10,
                    itemStyle: {
                        color: symbolConfig.color || '#c23531',
                        borderColor: symbolConfig.borderColor || '#fff',
                        borderWidth: symbolConfig.borderWidth || 0,
                        opacity: symbolConfig.opacity || 1
                    }
                }
            }
        }

        return baseSeries;
    }) || []

    if (commonSeries.length === 0) {
        // Fallback demos if no data provided (should be overridden by defaultConfigs usually)
        if (type === 'singleLineChart' || type === 'doubleLineChart') commonSeries.push({ name: 'Demo', data: [150, 230, 224, 218, 135, 147, 260], type: 'line', smooth: true } as any)
        if (type === 'singleBarChart' || type === 'doubleBarChart' || type === 'horizontalBarChart') commonSeries.push({ name: 'Demo', data: [120, 200, 150, 80, 70, 110, 130], type: 'bar' } as any)
    }

    switch (type) {
        case 'singleLineChart':
        case 'doubleLineChart':
            return { ...baseOption, xAxis, yAxis, series: commonSeries }
        case 'singleBarChart':
        case 'doubleBarChart':
            return { ...baseOption, xAxis, yAxis, series: commonSeries }
        case 'horizontalBarChart':
            // 横向柱状图：交换x轴和y轴
            return {
                ...baseOption,
                xAxis: buildAxisConfig(props.xAxisConfig, 'value'),
                yAxis: buildAxisConfig(props.yAxisConfig, 'category', props.xAxisData || ['产品A', '产品B', '产品C', '产品D', '产品E']),
                series: commonSeries
            }
        case 'scatterChart':
            return {
                ...baseOption,
                xAxis: {},
                yAxis: {},
                series: commonSeries.length ? commonSeries : [{
                    type: 'scatter',
                    data: [[10, 20], [20, 30], [30, 50], [40, 60], [50, 80], [60, 90]],
                }],
            }
        case 'radarChart':
            const radarConfig = props.radarConfig || {}
            const radarSeriesConfig = props.radarSeriesConfig || {}
            const radarIndicator = radarConfig.indicator || [
                { name: '销售', max: 100 },
                { name: '管理', max: 100 },
                { name: '技术', max: 100 },
                { name: '客服', max: 100 },
                { name: '研发', max: 100 },
            ]
            
            // 构建雷达图系列数据
            const radarSeriesData = props.seriesData?.map(s => ({
                name: s.name,
                value: Array.isArray(s.data[0]) ? s.data[0] : s.data,
                areaStyle: radarSeriesConfig.areaStyle?.show ? {
                    opacity: radarSeriesConfig.areaStyle?.opacity || 0.3
                } : undefined,
                lineStyle: {
                    width: radarSeriesConfig.lineStyle?.width || 2
                },
                symbol: radarSeriesConfig.symbol || 'circle',
                symbolSize: radarSeriesConfig.symbolSize || 6,
            })) || [{ value: [80, 60, 90, 70, 85], name: '默认' }]

            return {
                ...baseOption,
                radar: {
                    shape: radarConfig.shape || 'polygon',
                    radius: `${radarConfig.radius || 65}%`,
                    indicator: radarIndicator,
                    axisLine: {
                        show: radarConfig.axisLine?.show !== false,
                        lineStyle: {
                            color: radarConfig.axisLine?.lineStyle?.color || 'rgba(255,255,255,0.3)',
                            width: radarConfig.axisLine?.lineStyle?.width || 1,
                        }
                    },
                    splitLine: {
                        show: radarConfig.splitLine?.show !== false,
                        lineStyle: {
                            color: radarConfig.splitLine?.lineStyle?.color || 'rgba(255,255,255,0.3)',
                            width: radarConfig.splitLine?.lineStyle?.width || 1,
                        }
                    },
                    splitArea: {
                        show: radarConfig.splitArea?.show !== false,
                        areaStyle: {
                            color: radarConfig.splitArea?.areaStyle?.color || ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)']
                        }
                    },
                    axisName: {
                        color: radarConfig.axisName?.color || '#fff',
                        fontSize: radarConfig.axisName?.fontSize || 12,
                        fontWeight: radarConfig.axisName?.fontWeight || 'normal',
                    }
                },
                series: [{
                    type: 'radar',
                    data: radarSeriesData,
                }],
            }
        case 'pieChart':
            const pieConfig = props.pieConfig || {}
            return {
                ...baseOption,
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'pie',
                    radius: pieConfig.radius || ['0%', '70%'],
                    center: pieConfig.center || ['50%', '50%'],
                    roseType: pieConfig.roseType || false,
                    itemStyle: {
                        borderRadius: pieConfig.borderRadius || 0,
                        borderWidth: pieConfig.borderWidth || 0,
                        borderColor: pieConfig.borderColor || '#000',
                        shadowBlur: pieConfig.itemStyle?.shadowBlur || 0,
                        shadowColor: pieConfig.itemStyle?.shadowColor || 'rgba(0,0,0,0.5)',
                    },
                    label: {
                        show: pieConfig.label?.show !== false,
                        position: pieConfig.label?.position || 'outside',
                        color: pieConfig.label?.color || '#fff',
                        fontSize: pieConfig.label?.fontSize || 12,
                        formatter: pieConfig.label?.formatter || '{b}: {d}%',
                    },
                    labelLine: {
                        show: pieConfig.labelLine?.show !== false,
                        length: pieConfig.labelLine?.length || 10,
                        length2: pieConfig.labelLine?.length2 || 10,
                        lineStyle: {
                            color: pieConfig.labelLine?.lineStyle?.color || '#fff',
                            width: pieConfig.labelLine?.lineStyle?.width || 1,
                        }
                    },
                    data: props.pieData || [
                        { value: 1048, name: 'A' },
                        { value: 735, name: 'B' },
                        { value: 580, name: 'C' },
                        { value: 484, name: 'D' },
                    ],
                }],
            }
        case 'halfPieChart':
            const halfPieConfig = props.pieConfig || {}
            return {
                ...baseOption,
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'pie',
                    radius: halfPieConfig.radius || ['40%', '70%'],
                    center: halfPieConfig.center || ['50%', '70%'],
                    startAngle: 180,
                    endAngle: 360,
                    roseType: halfPieConfig.roseType || false,
                    itemStyle: {
                        borderRadius: halfPieConfig.borderRadius || 0,
                        borderWidth: halfPieConfig.borderWidth || 0,
                        borderColor: halfPieConfig.borderColor || '#000',
                        shadowBlur: halfPieConfig.itemStyle?.shadowBlur || 0,
                        shadowColor: halfPieConfig.itemStyle?.shadowColor || 'rgba(0,0,0,0.5)',
                    },
                    label: {
                        show: halfPieConfig.label?.show !== false,
                        position: halfPieConfig.label?.position || 'outside',
                        color: halfPieConfig.label?.color || '#fff',
                        fontSize: halfPieConfig.label?.fontSize || 12,
                        formatter: halfPieConfig.label?.formatter || '{b}: {d}%',
                    },
                    labelLine: {
                        show: halfPieConfig.labelLine?.show !== false,
                        length: halfPieConfig.labelLine?.length || 10,
                        length2: halfPieConfig.labelLine?.length2 || 10,
                        lineStyle: {
                            color: halfPieConfig.labelLine?.lineStyle?.color || '#fff',
                            width: halfPieConfig.labelLine?.lineStyle?.width || 1,
                        }
                    },
                    data: props.pieData || [
                        { value: 1048, name: 'A' },
                        { value: 735, name: 'B' },
                        { value: 580, name: 'C' },
                        { value: 484, name: 'D' },
                    ],
                }],
            }
        case 'gaugeChart':
            return {
                ...baseOption,
                series: [{
                    type: 'gauge',
                    progress: { show: true },
                    detail: { formatter: '{value}%' },
                    data: [{ value: props.singleData ?? 70 }],
                }],
            }

        default:
            return baseOption
    }
}

// 日历热力图配置
const getCalendarOption = (props: ComponentItem['props']) => {
    const year = props.calendarYear || new Date().getFullYear()
    const data = props.calendarData || []
    const colors = props.calendarColors || ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
    const cellSize = props.calendarCellSize || 15
    const lang = props.calendarLang || 'zh'
    
    // 中英文月份名称
    const monthNameMap: Record<string, string[]> = {
        zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
    
    // 中英文星期名称
    const dayNameMap: Record<string, string[]> = {
        zh: ['日', '一', '二', '三', '四', '五', '六'],
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }

    const showLegend = props.legend?.show !== false
    const legendOrient = props.legend?.orient || 'horizontal'
    const legendLeft = props.legend?.left || 'center'
    const legendTop = props.legend?.top || 'bottom'
    
    // 根据图例位置调整日历位置
    let calendarTop = 40
    let calendarBottom = 20
    let calendarLeft = 50
    let calendarRight = 30
    
    if (showLegend) {
        if (legendTop === 'top') {
            calendarTop = 70
        } else if (legendTop === 'bottom') {
            calendarBottom = 50
        }
        
        if (legendOrient === 'vertical') {
            if (legendLeft === 'left') {
                calendarLeft = 100
            } else if (legendLeft === 'right') {
                calendarRight = 100
            }
        }
    }
    
    // 构建 visualMap 配置
    const visualMapConfig: any = showLegend ? {
        min: 0,
        max: 100,
        calculable: true,
        orient: legendOrient,
        inRange: {
            color: colors
        },
        textStyle: { 
            color: props.legend?.textStyle?.color || '#fff',
            fontSize: props.legend?.textStyle?.fontSize || 12,
            fontWeight: props.legend?.textStyle?.fontWeight || 'normal'
        }
    } : { show: false }
    
    // 设置图例位置
    if (showLegend) {
        if (legendOrient === 'horizontal') {
            visualMapConfig.left = legendLeft
            if (legendTop === 'top') {
                visualMapConfig.top = 10
            } else if (legendTop === 'bottom') {
                visualMapConfig.bottom = 10
            } else {
                visualMapConfig.top = 'middle'
            }
        } else {
            visualMapConfig.top = legendTop === 'middle' ? 'center' : legendTop
            if (legendLeft === 'left') {
                visualMapConfig.left = 10
            } else if (legendLeft === 'right') {
                visualMapConfig.right = 10
            } else {
                visualMapConfig.left = 'center'
            }
        }
    }
    
    return {
        backgroundColor: 'transparent',
        title: props.chartTitle ? {
            text: props.chartTitle,
            left: 'center',
            textStyle: { color: '#fff', fontSize: 16 }
        } : undefined,
        tooltip: {
            formatter: (params: any) => {
                return `${params.value[0]}: ${params.value[1]}`
            }
        },
        visualMap: visualMapConfig,
        calendar: {
            top: calendarTop,
            left: calendarLeft,
            right: calendarRight,
            bottom: calendarBottom,
            cellSize: ['auto', cellSize],
            range: year,
            itemStyle: {
                borderWidth: 2,
                borderColor: '#1a1a1a'
            },
            yearLabel: {
                show: props.calendarYearLabel?.show !== false,
                color: props.calendarYearLabel?.color || '#fff',
                fontSize: props.calendarYearLabel?.fontSize || 14
            },
            monthLabel: {
                show: props.calendarMonthLabel?.show !== false,
                color: props.calendarMonthLabel?.color || '#fff',
                fontSize: props.calendarMonthLabel?.fontSize || 12,
                nameMap: monthNameMap[lang]
            },
            dayLabel: {
                show: props.calendarDayLabel?.show !== false,
                color: props.calendarDayLabel?.color || '#fff',
                fontSize: props.calendarDayLabel?.fontSize || 12,
                firstDay: props.calendarDayLabel?.firstDay ?? 1,
                nameMap: dayNameMap[lang]
            },
            splitLine: {
                lineStyle: {
                    color: '#333'
                }
            }
        },
        series: [{
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: data
        }]
    }
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

export default function CanvasItem({ item, onContextMenu, previewMode = false }: CanvasItemProps) {
    const { state, selectComponent, moveComponent, updateComponent, setSnapLines } = useEditor()
    const isSelected = state.selectedId === item.id
    const ref = useRef<HTMLDivElement>(null)

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
            selectComponent(item.id)
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (item.locked || previewMode) return
        e.stopPropagation()

        const startX = e.clientX
        const startY = e.clientY
        // 考虑缩放比例
        const startPosX = item.style.x
        const startPosY = item.style.y

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

            // OPTIMIZATION: Update DOM directly to avoid re-renders and history flood
            if (ref.current) {
                ref.current.style.left = `${snappedX}px`
                ref.current.style.top = `${snappedY}px`
            }

            // Only update snap lines in global state (transient)
            setSnapLines(snapLines)
        }

        const handleMouseUp = (upEvent: MouseEvent) => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            setSnapLines([])

            // Commit final position to history
            // Re-calculate final position to be sure (or store in a ref)
            // For simplicity, we recalculate using same logic as last move
            // Better: store lastSnapped in a variable closure
            const deltaX = (upEvent.clientX - startX) / state.scale
            const deltaY = (upEvent.clientY - startY) / state.scale
            const newRawX = startPosX + deltaX
            const newRawY = startPosY + deltaY
            const { x: finalX, y: finalY } = calculateSnap(item.id, newRawX, newRawY, state.components)

            // Only update if changed
            if (finalX !== item.style.x || finalY !== item.style.y) {
                moveComponent(item.id, finalX, finalY)
            }
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
                }
            }
            if (direction.includes('bottom')) {
                newHeight = Math.max(10, startHeight + deltaY)
            }
            if (direction.includes('left')) {
                const w = startWidth - deltaX
                if (w > 10) {
                    newWidth = w
                    newX = startItemX + deltaX
                }
            }
            if (direction.includes('right')) {
                newWidth = Math.max(10, startWidth + deltaX)
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
            case 'gaugeChart':
            case 'radarChart':
            case 'scatterChart':
                return (
                    <ReactECharts
                        option={item.props.chartOption || getChartOption(item.type, item.props)}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )
            
            case 'mapChart':
                return (
                    <Suspense fallback={<div style={{ color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>加载地图...</div>}>
                        <MapChart
                            mapRegion={item.props.mapRegion || 'china'}
                            mapData={item.props.mapData}
                            chartTitle={item.props.chartTitle}
                        />
                    </Suspense>
                )
            
            case 'calendarChart':
                return (
                    <ReactECharts
                        option={getCalendarOption(item.props)}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )
            // ... (Antd components continue)

            case 'table':
                return (
                    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                        {/* @ts-ignore */}
                        <Table
                            columns={item.props.tableColumns || [
                                { title: '姓名', dataIndex: 'name', key: 'name' },
                                { title: '年龄', dataIndex: 'age', key: 'age' },
                            ]}
                            dataSource={item.props.tableData || [
                                { key: '1', name: '张三', age: 32 },
                                { key: '2', name: '李四', age: 42 },
                            ]}
                            pagination={false}
                            size="small"
                        />
                    </div>
                )
            case 'scrollRankList':
                return (
                    <Suspense fallback={<div style={{ color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>加载中...</div>}>
                        <ScrollRankList
                            data={item.props.rankListData || []}
                            config={item.props.rankListConfig}
                        />
                    </Suspense>
                )
            case 'carouselList':
                return (
                    <Suspense fallback={<div style={{ color: '#999', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>加载中...</div>}>
                        <CarouselList
                            data={item.props.carouselListData || []}
                            config={item.props.carouselListConfig}
                        />
                    </Suspense>
                )
            case 'text':
                return (
                    <div style={{ color: item.style.color || '#fff', fontSize: item.style.fontSize || 14 }}>
                        {item.props.content || '文本内容'}
                    </div>
                )
            case 'button':
                return (
                    <Button type={item.props.buttonType || 'primary'}>
                        {item.props.content || '按钮'}
                    </Button>
                )
            case 'input':
                return <Input placeholder="输入框" style={{ width: '100%' }} />
            case 'select':
                return (
                    <Select
                        placeholder="请选择"
                        style={{ width: '100%' }}
                        value={item.props.content}
                        options={item.props.selectOptions || [{ value: '1', label: '选项1' }, { value: '2', label: '选项2' }]}
                    />
                )
                // 地球组件
                function Earth() {
                    const [colorMap, normalMap, specularMap] = useLoader(TextureLoader, [
                        'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
                        'https://unpkg.com/three-globe/example/img/earth-topology.png',
                        'https://unpkg.com/three-globe/example/img/earth-water.png'
                    ])

                    return (
                        <mesh>
                            <sphereGeometry args={[1.2, 64, 64]} />
                            <meshPhongMaterial
                                map={colorMap}
                                normalMap={normalMap}
                                specularMap={specularMap}
                                shininess={5}
                            />
                        </mesh>
                    )
                }

            // ... inside renderContent ...
            // 3D 组件
            case 'threeEarth':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', position: 'absolute', top: 0, left: 0 }}>
                        <Canvas
                            camera={{ position: [0, 0, 3] }}
                            style={{ width: '100%', height: '100%' }}
                            resize={{ scroll: false }}
                        >
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
                            <Suspense fallback={
                                <Sphere args={[1.2, 32, 32]} visible>
                                    <meshStandardMaterial color="#1E90FF" wireframe />
                                </Sphere>
                            }>
                                <Earth />
                            </Suspense>
                            <OrbitControls enableZoom={false} autoRotate makeDefault />
                            <Stars />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: 'white',
                            pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', fontSize: 10
                        }}>
                            3D 地球 (加载中...)
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
            case 'switch':
                return <Switch checked={item.props.checked} />
            case 'progress':
                return <Progress percent={item.props.percent || 50} style={{ width: '100%' }} />
            case 'tag':
                return <Tag color={item.props.tagColor || 'blue'}>{item.props.content || '标签'}</Tag>
            case 'badge':
                return <Badge count={5}><Avatar shape="square" /></Badge>
            case 'avatar':
                return <Avatar size={64} icon={<UserOutlined />} />
            case 'card':
                return (
                    <Card size="small" title="卡片标题" style={{ width: '100%', height: '100%' }}>
                        {item.props.content || '卡片内容'}
                    </Card>
                )


            // 小组件 - 装饰边框
            case 'borderBox1':
                return (
                    <div className="border-box border-box-1">
                        <div className="border-box-content">{item.props.content || ''}</div>
                    </div>
                )
            case 'borderBox2':
                return (
                    <div className="border-box border-box-2">
                        <div className="border-box-content">{item.props.content || ''}</div>
                    </div>
                )
            case 'borderBox3':
                return (
                    <div className="border-box border-box-3">
                        <div className="border-box-content">{item.props.content || ''}</div>
                    </div>
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
                    <div className="canvas-item-carousel-placeholder">
                        <span>轮播图</span>
                    </div>
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

            default:
                return null
        }
    }

    if (!item.visible) return null

    return (
        <div
            ref={ref}
            className={`canvas-item ${!previewMode && isSelected ? 'selected' : ''} ${item.locked ? 'locked' : ''}`}
            style={{
                left: item.style.x,
                top: item.style.y,
                width: item.style.width,
                height: item.style.height,
                backgroundColor: item.style.backgroundColor,
                borderRadius: item.style.borderRadius,
                opacity: isDragging && !previewMode ? 0.5 : (item.style.opacity ?? 1),
                zIndex: item.style.zIndex,
                cursor: !previewMode && !item.locked ? 'move' : 'default',
            }}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onContextMenu={onContextMenu}
        >
            {renderContent()}
            {!previewMode && isSelected && (
                <>
                    <div className="resize-handle top-left" onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')} />
                    <div className="resize-handle top-right" onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')} />
                    <div className="resize-handle bottom-left" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')} />
                    <div className="resize-handle bottom-right" onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')} />
                </>
            )}
        </div>
    )
}
