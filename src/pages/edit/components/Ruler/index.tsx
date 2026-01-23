import { useEffect, useRef, useState } from 'react'
import { useEditor } from '../../context/EditorContext'
import './index.less'

interface RulerProps {
    type: 'horizontal' | 'vertical'
}

export default function Ruler({ type }: RulerProps) {
    const { state } = useEditor()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { scale, components, selectedIds } = state
    const [offset, setOffset] = useState(0)
    const [cursorPos, setCursorPos] = useState<number | null>(null)

    // 监听滚动与鼠标位置
    useEffect(() => {
        const canvasWrapper = document.querySelector('.canvas-wrapper')
        if (!canvasWrapper) return

        const handleScroll = () => {
            if (type === 'horizontal') {
                setOffset(canvasWrapper.scrollLeft || 0)
            } else {
                setOffset(canvasWrapper.scrollTop || 0)
            }
        }

        const handleMouseMove = (e: Event) => {
            const mouseEvent = e as MouseEvent
            const rect = canvasWrapper.getBoundingClientRect()
            if (type === 'horizontal') {
                setCursorPos(mouseEvent.clientX - rect.left)
            } else {
                setCursorPos(mouseEvent.clientY - rect.top)
            }
        }

        const handleMouseLeave = () => setCursorPos(null)

        canvasWrapper.addEventListener('scroll', handleScroll)
        canvasWrapper.addEventListener('mousemove', handleMouseMove)
        canvasWrapper.addEventListener('mouseleave', handleMouseLeave)

        handleScroll()

        return () => {
            canvasWrapper.removeEventListener('scroll', handleScroll)
            canvasWrapper.removeEventListener('mousemove', handleMouseMove)
            canvasWrapper.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [type])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 设置 canvas 尺寸
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width * window.devicePixelRatio
        canvas.height = rect.height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

        ctx.clearRect(0, 0, rect.width, rect.height)

        // 颜色配置
        const primaryColor = '#3b82f6'
        const textColor = '#a3a3a3'
        const highlightColor = 'rgba(59, 130, 246, 0.15)'

        // 1. 绘制背景区域高亮 (Selected Items)
        const selectedComponents = components.filter(c => selectedIds.includes(c.id))
        if (selectedComponents.length > 0) {
            ctx.fillStyle = highlightColor
            selectedComponents.forEach(comp => {
                const start = type === 'horizontal' ? comp.style.x : comp.style.y
                const size = type === 'horizontal' ? comp.style.width : comp.style.height

                const screenStart = (start * scale) - offset + (type === 'horizontal' ? 0 : 0)
                const screenSize = size * scale

                if (type === 'horizontal') {
                    ctx.fillRect(screenStart, 0, screenSize, rect.height)
                } else {
                    ctx.fillRect(0, screenStart, rect.width, screenSize)
                }
            })
        }

        // 2. 绘制刻度
        ctx.beginPath()
        ctx.strokeStyle = '#444' // 刻度线颜色
        ctx.lineWidth = 1
        ctx.fillStyle = textColor
        ctx.font = '10px "Inter", "San Francisco", Arial'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'

        // 逻辑刻度逻辑
        const stepBase = 10 // 最小逻辑步长
        const startLogical = Math.floor((offset / scale) / stepBase) * stepBase

        for (let logicalVal = startLogical; ; logicalVal += stepBase) {
            const screenPos = (logicalVal * scale) - offset
            if (screenPos > (type === 'horizontal' ? rect.width : rect.height)) break
            if (screenPos < 0) continue

            const is100 = logicalVal % 100 === 0
            const is50 = logicalVal % 50 === 0
            const is10 = logicalVal % 10 === 0

            let tickLen = 0
            if (is100) tickLen = 14
            else if (is50) tickLen = 10
            else if (is10) tickLen = 6

            if (type === 'horizontal') {
                ctx.moveTo(screenPos + 0.5, rect.height - tickLen)
                ctx.lineTo(screenPos + 0.5, rect.height)
                if (is100) {
                    ctx.fillText(logicalVal.toString(), screenPos + 4, 2)
                }
            } else {
                ctx.moveTo(rect.width - tickLen, screenPos + 0.5)
                ctx.lineTo(rect.width, screenPos + 0.5)
                if (is100) {
                    ctx.save()
                    ctx.translate(2, screenPos + 4)
                    ctx.rotate(-Math.PI / 2)
                    ctx.fillText(logicalVal.toString(), -20, 0) // 调整位置
                    ctx.restore()
                }
            }
        }
        ctx.stroke()

        // 3. 绘制当前光标指示 (Cursor Indicator)
        if (cursorPos !== null) {
            ctx.beginPath()
            ctx.strokeStyle = primaryColor
            ctx.lineWidth = 1
            if (type === 'horizontal') {
                ctx.moveTo(cursorPos, 0)
                ctx.lineTo(cursorPos, rect.height)
            } else {
                ctx.moveTo(0, cursorPos)
                ctx.lineTo(rect.width, cursorPos)
            }
            ctx.stroke()
        }

    }, [scale, offset, type, components, selectedIds, cursorPos])

    return (
        <canvas
            ref={canvasRef}
            className={`ruler ruler-${type}`}
            style={{
                width: type === 'horizontal' ? '100%' : '20px',
                height: type === 'horizontal' ? '20px' : '100%',
            }}
        />
    )
}
