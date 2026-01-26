import { useDrag } from 'react-dnd'
import { Tooltip } from 'antd'
import type { ComponentType } from '../../types'
import './index.less'

interface DraggableItemProps {
    type: ComponentType
    name: string
    icon: React.ReactNode
    data?: any // 额外数据，如 iconType
    onDragStart?: () => void // 拖拽开始回调
}

export default function DraggableItem({ type, name, icon, data, onDragStart }: DraggableItemProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'NEW_COMPONENT',
        item: () => {
            onDragStart?.()
            return { componentType: type, data }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }))

    return (
        <Tooltip title={name} mouseEnterDelay={0.3} placement="top">
            <div
                ref={drag as unknown as React.Ref<HTMLDivElement>}
                className={`draggable-item ${isDragging ? 'dragging' : ''}`}
            >
                <span className="draggable-item-icon">{icon}</span>
                <span className="draggable-item-name">{name}</span>
            </div>
        </Tooltip>
    )
}
