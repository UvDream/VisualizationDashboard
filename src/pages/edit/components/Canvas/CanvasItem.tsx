import { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { Button, Input, Select, Switch, Progress, Tag, Badge, Avatar, Card } from 'antd'
import ReactECharts from 'echarts-for-react'
import {
    SmileOutlined,
    HeartOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useEditor } from '../../context/EditorContext'
import { calculateSnap } from '../../utils/snapping'
import type { ComponentItem } from '../../types'
import './index.less'

interface CanvasItemProps {
    item: ComponentItem
}

// ECharts 默认配置
const getChartOption = (type: string) => {
    const baseOption = {
        backgroundColor: 'transparent',
        grid: { top: 30, right: 20, bottom: 30, left: 40 },
    }

    // ... (保持原有的 getChartOption 内容不变)
    switch (type) {
        case 'lineChart':
            return {
                ...baseOption,
                xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                yAxis: { type: 'value' },
                series: [{ data: [150, 230, 224, 218, 135, 147, 260], type: 'line', smooth: true }],
            }
        case 'barChart':
            return {
                ...baseOption,
                xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
                yAxis: { type: 'value' },
                series: [{ data: [120, 200, 150, 80, 70, 110, 130], type: 'bar' }],
            }
        case 'pieChart':
            return {
                ...baseOption,
                series: [{
                    type: 'pie',
                    radius: '60%',
                    data: [
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
                    data: [{ value: 70 }],
                }],
            }
        case 'radarChart':
            return {
                ...baseOption,
                radar: {
                    indicator: [
                        { name: 'Sales', max: 100 },
                        { name: 'Admin', max: 100 },
                        { name: 'Tech', max: 100 },
                        { name: 'Support', max: 100 },
                        { name: 'Dev', max: 100 },
                    ],
                },
                series: [{
                    type: 'radar',
                    data: [{ value: [80, 60, 90, 70, 85] }],
                }],
            }
        case 'scatterChart':
            return {
                ...baseOption,
                xAxis: {},
                yAxis: {},
                series: [{
                    type: 'scatter',
                    data: [[10, 20], [20, 30], [30, 50], [40, 60], [50, 80], [60, 90]],
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
    const { state, selectComponent, moveComponent, setSnapLines } = useEditor()
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

    // 渲染组件内容
    const renderContent = () => {
        switch (item.type) {
            // 图表类
            case 'lineChart':
            case 'barChart':
            case 'pieChart':
            case 'gaugeChart':
            case 'radarChart':
            case 'scatterChart':
                return (
                    <ReactECharts
                        option={item.props.chartOption || getChartOption(item.type)}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )

            // Antd 组件
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
                        options={[{ value: '1', label: '选项1' }, { value: '2', label: '选项2' }]}
                    />
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
            case 'table':
                return (
                    <div className="canvas-item-table-placeholder">
                        <span>📊 表格组件</span>
                    </div>
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
                    <div className="resize-handle top-left" />
                    <div className="resize-handle top-right" />
                    <div className="resize-handle bottom-left" />
                    <div className="resize-handle bottom-right" />
                </>
            )}
        </div>
    )
}
