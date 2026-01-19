import { useRef, Suspense, lazy, useState, useMemo } from 'react'
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
import { getCachedChartOption, getCalendarOption } from '../../utils/chartOptions'
import type { ComponentItem } from '../../types'
import WordCloudChart from './WordCloudChart'
import LayoutCell from './LayoutCell'
import Carousel from './Carousel'
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
    const { state, selectComponent, selectComponents, moveComponent, updateComponent, setSnapLines } = useEditor()
    const isSelected = state.selectedId === item.id || (state.selectedIds || []).includes(item.id)
    const ref = useRef<HTMLDivElement>(null)
    const [isLocalDragging, setIsLocalDragging] = useState(false)

    // 缓存的图表配置
    const chartOption = useMemo(() => {
        const chartTypes = ['singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart', 
            'horizontalBarChart', 'pieChart', 'halfPieChart', 'funnelChart', 'gaugeChart', 'radarChart', 'scatterChart']
        if (chartTypes.includes(item.type)) {
            return item.props.chartOption || getCachedChartOption(item.type, item.props)
        }
        if (item.type === 'calendarChart') {
            return getCalendarOption(item.props)
        }
        return null
    }, [item.type, item.props])

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
                const newX = initialPositions[index].startX + actualDeltaX
                const newY = initialPositions[index].startY + actualDeltaY
                
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
                const newX = initialPositions[index].startX + actualDeltaX
                const newY = initialPositions[index].startY + actualDeltaY
                
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
            case 'funnelChart':
            case 'gaugeChart':
            case 'radarChart':
            case 'scatterChart':
                return (
                    <ReactECharts
                        option={chartOption!}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )

            case 'wordCloudChart':
                return (
                    <WordCloudChart
                        data={item.props.wordCloudData || []}
                        width={item.style.width}
                        height={item.style.height}
                        config={item.props.wordCloudConfig}
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
                        option={chartOption!}
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
                        <LayoutCell 
                            layoutId={item.id} 
                            cellIndex={0} 
                            cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '上方' : '左栏'}
                            cellConfig={item.props.layoutConfig?.cells?.[0]}
                        />
                        <LayoutCell 
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
                        <LayoutCell 
                            layoutId={item.id} 
                            cellIndex={0} 
                            cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '上方' : '左栏'}
                            cellConfig={item.props.layoutConfig?.cells?.[0]}
                        />
                        <LayoutCell 
                            layoutId={item.id} 
                            cellIndex={1} 
                            cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '中间' : '中栏'}
                            cellConfig={item.props.layoutConfig?.cells?.[1]}
                        />
                        <LayoutCell 
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
                        <LayoutCell 
                            layoutId={item.id} 
                            cellIndex={0} 
                            cellLabel={item.props.layoutConfig?.direction === 'horizontal' ? '侧栏' : '头部'} 
                            className="layout-header-top"
                            cellConfig={item.props.layoutConfig?.cells?.[0]}
                        />
                        <LayoutCell 
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
                        <LayoutCell 
                            layoutId={item.id} 
                            cellIndex={0} 
                            cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '头部' : '侧栏'} 
                            className="layout-sidebar-left"
                            cellConfig={item.props.layoutConfig?.cells?.[0]}
                        />
                        <LayoutCell 
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

            default:
                return null
        }
    }

    if (!item.visible) return null

    return (
        <div
            ref={ref}
            data-component-id={item.id}
            className={`canvas-item ${!previewMode && isSelected ? 'selected' : ''} ${item.locked ? 'locked' : ''} ${!previewMode && item.groupId ? 'grouped' : ''} ${!previewMode && item.isGroup ? 'group-main' : ''}`}
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
            onDoubleClick={handleDoubleClick}
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
