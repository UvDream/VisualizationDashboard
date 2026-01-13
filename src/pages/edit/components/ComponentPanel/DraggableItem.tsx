import { useDrag } from 'react-dnd'
import type { ComponentType } from '../../types'
import './index.less'

interface DraggableItemProps {
    type: ComponentType
    name: string
    icon: React.ReactNode
}

export default function DraggableItem({ type, name, icon }: DraggableItemProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'NEW_COMPONENT',
        item: { componentType: type },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }))

    return (
        <div
            ref={drag as unknown as React.Ref<HTMLDivElement>}
            className={`draggable-item ${isDragging ? 'dragging' : ''}`}
        >
            <span className="draggable-item-icon">{icon}</span>
            <span className="draggable-item-name">{name}</span>
        </div>
    )
}
