import { useDrop } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import { useEditor } from '../../context/EditorContext'
import { ComponentType, ComponentItem } from '../../types'
import CanvasItem from './CanvasItem'
import './index.less'

// 默认组件配置
const defaultConfigs: Record<ComponentType, { props: ComponentItem['props']; style: Partial<ComponentItem['style']> }> = {
    text: {
        props: { content: '文本内容' },
        style: { width: 120, height: 40, color: '#ffffff', fontSize: 14 },
    },
    button: {
        props: { content: '按钮', buttonType: 'primary' },
        style: { width: 100, height: 40 },
    },
    image: {
        props: { alt: '图片' },
        style: { width: 200, height: 150, backgroundColor: '#2a2a2a' },
    },
    chart: {
        props: { chartType: 'bar' },
        style: { width: 300, height: 200, backgroundColor: '#2a2a2a' },
    },
    container: {
        props: {},
        style: { width: 300, height: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 },
    },
}

export default function Canvas() {
    const { state, addComponent, selectComponent } = useEditor()

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'NEW_COMPONENT',
        drop: (item: { componentType: ComponentType }, monitor) => {
            const offset = monitor.getClientOffset()
            const canvasRect = document.querySelector('.canvas-area')?.getBoundingClientRect()

            if (offset && canvasRect) {
                const x = offset.x - canvasRect.left
                const y = offset.y - canvasRect.top

                const config = defaultConfigs[item.componentType]
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

    return (
        <div className="canvas-wrapper">
            <div
                ref={drop}
                className={`canvas-area ${isOver ? 'drag-over' : ''}`}
                onClick={handleCanvasClick}
            >
                {state.components.map((item) => (
                    <CanvasItem key={item.id} item={item} />
                ))}
            </div>
        </div>
    )
}
