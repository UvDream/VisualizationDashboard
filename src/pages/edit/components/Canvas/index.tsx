import { useRef } from 'react'
import { useDrop } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import { useEditor } from '../../context/EditorContext'
import Ruler from '../Ruler'
import type { ComponentType, ComponentItem } from '../../types'
import CanvasItem from './CanvasItem'
import './index.less'

// 默认组件配置
const defaultConfigs: Record<ComponentType, { props: ComponentItem['props']; style: Partial<ComponentItem['style']> }> = {
    // 图表类
    lineChart: { props: {}, style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' } },
    barChart: { props: {}, style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' } },
    pieChart: { props: {}, style: { width: 350, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' } },
    gaugeChart: { props: {}, style: { width: 300, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' } },
    radarChart: { props: {}, style: { width: 350, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' } },
    scatterChart: { props: {}, style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' } },

    // Antd 组件
    text: { props: { content: '文本内容' }, style: { width: 120, height: 40, color: '#ffffff', fontSize: 14 } },
    button: { props: { content: '按钮', buttonType: 'primary' }, style: { width: 100, height: 40 } },
    input: { props: {}, style: { width: 200, height: 40 } },
    select: { props: {}, style: { width: 200, height: 40 } },
    switch: { props: { checked: false }, style: { width: 60, height: 30 } },
    progress: { props: { percent: 50 }, style: { width: 200, height: 30 } },
    tag: { props: { content: '标签', tagColor: 'blue' }, style: { width: 60, height: 30 } },
    badge: { props: {}, style: { width: 60, height: 60 } },
    avatar: { props: {}, style: { width: 64, height: 64 } },
    card: { props: { content: '卡片内容' }, style: { width: 300, height: 200, backgroundColor: 'rgba(255,255,255,0.1)' } },
    table: { props: {}, style: { width: 400, height: 200, backgroundColor: 'rgba(255,255,255,0.05)' } },

    // 小组件
    borderBox1: { props: {}, style: { width: 300, height: 200 } },
    borderBox2: { props: {}, style: { width: 300, height: 200 } },
    borderBox3: { props: {}, style: { width: 300, height: 200 } },
    decoration1: { props: {}, style: { width: 200, height: 60 } },
    decoration2: { props: {}, style: { width: 200, height: 60 } },
    container: { props: {}, style: { width: 300, height: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 } },

    // 图片
    image: { props: { alt: '图片' }, style: { width: 200, height: 150, backgroundColor: '#2a2a2a' } },
    carousel: { props: {}, style: { width: 400, height: 200, backgroundColor: '#2a2a2a' } },

    // 图标
    icon: { props: { iconType: 'smile' }, style: { width: 60, height: 60, fontSize: 32, color: '#1890ff' } },
}

export default function Canvas() {
    const { state, addComponent, selectComponent } = useEditor()
    const customCanvasRef = useRef<HTMLDivElement>(null)

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'NEW_COMPONENT',
        drop: (item: { componentType: ComponentType }, monitor) => {
            const offset = monitor.getClientOffset()
            const canvasRect = customCanvasRef.current?.getBoundingClientRect()

            if (offset && canvasRect) {
                // 计算缩放后的坐标 [Logic X = (Screen X - Canvas Left) / Scale]
                const x = (offset.x - canvasRect.left) / state.scale
                const y = (offset.y - canvasRect.top) / state.scale

                const config = defaultConfigs[item.componentType] || { props: {}, style: { width: 100, height: 100 } }
                const newComponent: ComponentItem = {
                    id: uuidv4(),
                    type: item.componentType,
                    name: `${item.componentType}_${Date.now()}`,
                    props: config.props,
                    style: {
                        x,
                        y,
                        width: config.style.width || 100,
                        height: config.style.height || 100,
                        ...config.style,
                    },
                    visible: true,
                    locked: false,
                }

                addComponent(newComponent)
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }))

    const handleCanvasClick = () => {
        selectComponent(null)
    }

    // 合并 refs
    const setRefs = (el: HTMLDivElement | null) => {
        (customCanvasRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        drop(el)
    }

    return (
        <div className="canvas-wrapper">
            <div className="ruler-corner" />
            <Ruler type="horizontal" />
            <Ruler type="vertical" />

            <div
                ref={setRefs}
                className={`canvas-area ${isOver ? 'drag-over' : ''}`}
                style={{
                    transform: `scale(${state.scale}) translate(0px, 0px)`, // 注意: 先Scale再Translate，这里简化处理，实际可能需要更复杂的平移
                    // 实际上为了滚动正常，scale应该应用在内部容器或者使用 transform-origin
                }}
                onClick={handleCanvasClick}
            >
                {state.components.map((item) => (
                    <CanvasItem key={item.id} item={item} />
                ))}

                {/* 渲染吸附辅助线 */}
                {state.snapLines.map((line, index) => (
                    <div
                        key={index}
                        className={`snap-line snap-line-${line.type}`}
                        style={{
                            left: line.type === 'v' ? line.position : 0,
                            top: line.type === 'h' ? line.position : 0,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
