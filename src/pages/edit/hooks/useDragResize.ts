import { useRef, useCallback } from 'react'
import { MIN_COMPONENT_WIDTH, MIN_COMPONENT_HEIGHT } from '../config/constants'

interface Position {
    x: number
    y: number
}

interface Size {
    width: number
    height: number
}

interface DragResizeOptions {
    scale: number
    onDragStart?: () => void
    onDrag?: (position: Position) => void
    onDragEnd?: (position: Position) => void
    onResizeStart?: () => void
    onResize?: (position: Position, size: Size) => void
    onResizeEnd?: (position: Position, size: Size) => void
}

interface SnapResult {
    x: number
    y: number
    snapLines: Array<{ type: 'h' | 'v'; position: number }>
}

/**
 * 拖拽和缩放 Hook
 * 统一处理组件的拖拽和缩放逻辑，避免代码重复
 */
export function useDragResize(options: DragResizeOptions) {
    const { scale, onDragStart, onDrag, onDragEnd, onResizeStart, onResize, onResizeEnd } = options
    
    const isDraggingRef = useRef(false)
    const isResizingRef = useRef(false)

    /**
     * 处理拖拽开始
     */
    const handleDragMouseDown = useCallback((
        e: React.MouseEvent,
        initialPosition: Position,
        calculateSnap?: (x: number, y: number) => SnapResult
    ) => {
        e.stopPropagation()
        
        const startX = e.clientX
        const startY = e.clientY
        const startPosX = initialPosition.x
        const startPosY = initialPosition.y

        isDraggingRef.current = true
        onDragStart?.()

        let lastPosition = initialPosition

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = (moveEvent.clientX - startX) / scale
            const deltaY = (moveEvent.clientY - startY) / scale

            let newX = startPosX + deltaX
            let newY = startPosY + deltaY

            // 如果提供了吸附计算函数，应用吸附
            if (calculateSnap) {
                const snapResult = calculateSnap(newX, newY)
                newX = snapResult.x
                newY = snapResult.y
            }

            lastPosition = { x: newX, y: newY }
            onDrag?.(lastPosition)
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            isDraggingRef.current = false
            onDragEnd?.(lastPosition)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }, [scale, onDragStart, onDrag, onDragEnd])

    /**
     * 处理缩放开始
     */
    const handleResizeMouseDown = useCallback((
        e: React.MouseEvent,
        direction: string,
        initialPosition: Position,
        initialSize: Size
    ) => {
        e.stopPropagation()
        
        const startX = e.clientX
        const startY = e.clientY
        const startItemX = initialPosition.x
        const startItemY = initialPosition.y
        const startWidth = initialSize.width
        const startHeight = initialSize.height

        isResizingRef.current = true
        onResizeStart?.()

        let currentPosition = initialPosition
        let currentSize = initialSize

        const handleMouseMove = (moveEvent: MouseEvent) => {
            moveEvent.preventDefault()
            
            const deltaX = (moveEvent.clientX - startX) / scale
            const deltaY = (moveEvent.clientY - startY) / scale

            let newX = startItemX
            let newY = startItemY
            let newWidth = startWidth
            let newHeight = startHeight

            // 根据方向计算新的位置和尺寸
            if (direction.includes('top')) {
                const h = startHeight - deltaY
                if (h > MIN_COMPONENT_HEIGHT) {
                    newHeight = h
                    newY = startItemY + deltaY
                }
            }
            if (direction.includes('bottom')) {
                newHeight = Math.max(MIN_COMPONENT_HEIGHT, startHeight + deltaY)
            }
            if (direction.includes('left')) {
                const w = startWidth - deltaX
                if (w > MIN_COMPONENT_WIDTH) {
                    newWidth = w
                    newX = startItemX + deltaX
                }
            }
            if (direction.includes('right')) {
                newWidth = Math.max(MIN_COMPONENT_WIDTH, startWidth + deltaX)
            }

            currentPosition = { x: newX, y: newY }
            currentSize = { width: newWidth, height: newHeight }
            
            onResize?.(currentPosition, currentSize)
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            isResizingRef.current = false
            onResizeEnd?.(currentPosition, currentSize)
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }, [scale, onResizeStart, onResize, onResizeEnd])

    return {
        handleDragMouseDown,
        handleResizeMouseDown,
        isDragging: isDraggingRef.current,
        isResizing: isResizingRef.current,
    }
}

export default useDragResize
