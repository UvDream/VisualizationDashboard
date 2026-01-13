import { useRef } from 'react'
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
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Sphere, MeshDistortMaterial } from '@react-three/drei'
import { useEditor } from '../../context/EditorContext'
import { calculateSnap } from '../../utils/snapping'
import type { ComponentItem } from '../../types'
import './index.less'

interface CanvasItemProps {
    item: ComponentItem
}

// ECharts 默认配置
const getChartOption = (type: string, props: ComponentItem['props']) => {
    const baseOption = {
        backgroundColor: 'transparent',
        title: props.chartTitle ? { text: props.chartTitle, left: 'center', textStyle: { color: '#fff' } } : undefined,
        grid: { top: props.chartTitle ? 40 : 30, right: 20, bottom: 30, left: 40 },
        tooltip: { trigger: 'axis' },
    }

    const xAxis = { type: 'category', data: props.xAxisData || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
    const yAxis = { type: 'value' }
    // 为不同图表类型生成 series
    const commonSeries = props.seriesData?.map(s => ({
        ...s,
        type: type === 'lineChart' ? 'line' :
            type === 'barChart' ? 'bar' :
                type === 'scatterChart' ? 'scatter' :
                    type === 'radarChart' ? 'radar' : 'line'
    })) || []

    if (commonSeries.length === 0) {
        // Fallback demos if no data provided (should be overridden by defaultConfigs usually)
        if (type === 'lineChart') commonSeries.push({ name: 'Demo', data: [150, 230, 224, 218, 135, 147, 260], type: 'line', smooth: true } as any)
        if (type === 'barChart') commonSeries.push({ name: 'Demo', data: [120, 200, 150, 80, 70, 110, 130], type: 'bar' } as any)
    }

    switch (type) {
        case 'lineChart':
            return { ...baseOption, xAxis, yAxis, series: commonSeries }
        case 'barChart':
            return { ...baseOption, xAxis, yAxis, series: commonSeries }
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
            return {
                ...baseOption,
                radar: {
                    // Radar needs indicator config too, usually in options. For now simplified.
                    indicator: [
                        { name: 'Sales', max: 100 },
                        { name: 'Admin', max: 100 },
                        { name: 'Tech', max: 100 },
                        { name: 'Support', max: 100 },
                        { name: 'Dev', max: 100 },
                    ],
                },
                series: commonSeries.length ? commonSeries : [{
                    type: 'radar',
                    data: [{ value: [80, 60, 90, 70, 85] }],
                }],
            }
        case 'pieChart':
            return {
                ...baseOption,
                tooltip: { trigger: 'item' },
                series: [{
                    type: 'pie',
                    radius: '60%',
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

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
    smile: <SmileOutlined />,
    heart: <HeartOutlined />,
    check: <CheckCircleOutlined />,
    warning: <WarningOutlined />,
    info: <InfoCircleOutlined />,
    user: <UserOutlined />,
}

export default function CanvasItem({ item }: CanvasItemProps) {
    const { state, selectComponent, moveComponent, updateComponent, setSnapLines } = useEditor()
    const isSelected = state.selectedId === item.id
    const ref = useRef<HTMLDivElement>(null)

    const [{ isDragging }] = useDrag(() => ({
        type: 'CANVAS_COMPONENT',
        item: { id: item.id, type: 'CANVAS_COMPONENT' },
        canDrag: !item.locked,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            // 拖拽结束，清除吸附线
            setSnapLines([])
        }
    }), [item.id, item.locked])

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        selectComponent(item.id)
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (item.locked) return
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

            // 计算吸附
            const { x: snappedX, y: snappedY, snapLines } = calculateSnap(
                item.id,
                newRawX,
                newRawY,
                state.components
            )

            moveComponent(item.id, snappedX, snappedY)
            setSnapLines(snapLines)
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            setSnapLines([])
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }



    const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation()
        if (item.locked) return

        const startX = e.clientX
        const startY = e.clientY
        const startItemX = item.style.x
        const startItemY = item.style.y
        const startWidth = item.style.width
        const startHeight = item.style.height

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

            updateComponent(item.id, {
                style: {
                    ...item.style,
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                }
            })
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
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
            case 'lineChart':
            case 'barChart':
            case 'pieChart':
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
            // 3D 组件
            case 'threeEarth':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
                        <Canvas camera={{ position: [0, 0, 3] }}>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
                            <Sphere args={[1.2, 32, 32]} visible>
                                <MeshDistortMaterial
                                    color="#00f"
                                    attach="material"
                                    distort={0.3} // 扭曲度
                                    speed={1.5} // 动画速度
                                    roughness={0.5}
                                />
                            </Sphere>
                            <OrbitControls enableZoom={false} autoRotate />
                            <Stars />
                        </Canvas>
                        <div style={{
                            position: 'absolute', top: 10, left: 10, color: 'white',
                            pointerEvents: 'none', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', fontSize: 10
                        }}>
                            3D 组件示例
                        </div>
                    </div>
                )
            case 'threeParticles':
                return (
                    <div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
                        <Canvas camera={{ position: [0, 0, 5] }}>
                            <ambientLight intensity={0.5} />
                            <pointLight position={[10, 10, 10]} />
                            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
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
                    <div className="canvas-item-image-placeholder">
                        {item.props.src ? (
                            <img src={item.props.src} alt={item.props.alt || ''} />
                        ) : (
                            <span>图片占位</span>
                        )}
                    </div>
                )
            case 'carousel':
                return (
                    <div className="canvas-item-carousel-placeholder">
                        <span>轮播图</span>
                    </div>
                )

            // 图标
            case 'icon':
                return (
                    <div className="canvas-item-icon" style={{ fontSize: item.style.fontSize || 32, color: item.style.color || '#1890ff' }}>
                        {iconMap[item.props.iconType || 'smile'] || <SmileOutlined />}
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
            className={`canvas-item ${isSelected ? 'selected' : ''} ${item.locked ? 'locked' : ''}`}
            style={{
                left: item.style.x,
                top: item.style.y,
                width: item.style.width,
                height: item.style.height,
                backgroundColor: item.style.backgroundColor,
                borderRadius: item.style.borderRadius,
                opacity: isDragging ? 0.5 : (item.style.opacity ?? 1),
                zIndex: item.style.zIndex,
            }}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            {renderContent()}
            {isSelected && (
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
