import { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { Button } from 'antd'
import { useEditor } from '../../context/EditorContext'
import type { ComponentItem } from '../../types'
import './index.less'

interface CanvasItemProps {
    item: ComponentItem
}

export default function CanvasItem({ item }: CanvasItemProps) {
    const { state, selectComponent, moveComponent } = useEditor()
    const isSelected = state.selectedId === item.id
    const ref = useRef<HTMLDivElement>(null)

    const [{ isDragging }] = useDrag(() => ({
        type: 'CANVAS_COMPONENT',
        item: { id: item.id, type: 'CANVAS_COMPONENT' },
        canDrag: !item.locked,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
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
        const startPosX = item.style.x
        const startPosY = item.style.y

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX
            const deltaY = moveEvent.clientY - startY
            moveComponent(item.id, startPosX + deltaX, startPosY + deltaY)
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    // 渲染组件内容
    const renderContent = () => {
        switch (item.type) {
            case 'text':
                return (
                    <div
                        style={{
                            color: item.style.color || '#fff',
                            fontSize: item.style.fontSize || 14,
                        }}
                    >
                        {item.props.content || '文本内容'}
                    </div>
                )
            case 'button':
                return (
                    <Button type={item.props.buttonType || 'primary'}>
                        {item.props.content || '按钮'}
                    </Button>
                )
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
            case 'chart':
                return (
                    <div className="canvas-item-chart-placeholder">
                        <span>📊 {item.props.chartType || 'bar'} 图表</span>
                    </div>
                )
            case 'container':
                return (
                    <div className="canvas-item-container-placeholder">
                        <span>容器</span>
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
