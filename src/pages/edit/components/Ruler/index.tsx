import { useEffect, useRef, useState } from 'react'
import { useEditor } from '../../context/EditorContext'
import './index.less'

interface RulerProps {
    type: 'horizontal' | 'vertical'
}

export default function Ruler({ type }: RulerProps) {
    const { state } = useEditor()
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { scale } = state
    const [offset, setOffset] = useState(0)

    // 监听滚动
    useEffect(() => {
        const canvasArea = document.querySelector('.canvas-wrapper')
        const handleScroll = () => {
            if (type === 'horizontal') {
                setOffset(canvasArea?.scrollLeft || 0)
            } else {
                setOffset(canvasArea?.scrollTop || 0)
            }
        }

        if (canvasArea) {
            canvasArea.addEventListener('scroll', handleScroll)
            // 初始化 offset
            handleScroll()
        }
        return () => canvasArea?.removeEventListener('scroll', handleScroll)
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
        ctx.beginPath()
        ctx.fillStyle = '#999'
        ctx.strokeStyle = '#999'
        ctx.lineWidth = 1
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.font = '10px Arial'

        // 刻度间距 (随缩放变化)
        // const gridSize = 50 * scale
        // const start = Math.floor(offset / gridSize) * gridSize
        // const end = start + (type === 'horizontal' ? rect.width : rect.height) + gridSize
        // const end = start + (type === 'horizontal' ? rect.width : rect.height) + gridSize

        // 绘制起始点
        // 我们需要将屏幕坐标转换为画布逻辑坐标来显示
        // 逻辑坐标 = (屏幕坐标 + 偏移) / 缩放

        // 我们遍历屏幕像素位置，然后反算逻辑值
        // 但为了刻度整齐，应该遍历逻辑值，然后算出屏幕位置

        // 逻辑刻度步长
        const step = 50
        const startLogical = Math.floor((offset / scale) / step) * step

        // 画布背景偏移（为了居中显示的偏移）
        // 注意：Canvas 组件里 transform-origin: center center; transform: scale(0.6);
        // 这里的 ruler 是对应 .canvas-area 容器内部的坐标系

        // 简化逻辑：我们假设 Ruler 是跟随 Canvas Area 内容滚动的 
        // 且 Ruler 的 0 点对应 Canvas Area 的左上角

        for (let logicalVal = startLogical; ; logicalVal += step) {
            const screenPos = logicalVal * scale - offset

            if (screenPos > (type === 'horizontal' ? rect.width : rect.height)) break
            if (screenPos < 0) continue

            if (type === 'horizontal') {
                const isMajor = logicalVal % 100 === 0
                const tickHeight = isMajor ? 10 : 5
                ctx.moveTo(screenPos, 0)
                ctx.lineTo(screenPos, tickHeight)

                if (isMajor) {
                    ctx.fillText(logicalVal.toString(), screenPos + 2, 0)
                }
            } else {
                const isMajor = logicalVal % 100 === 0
                const tickWidth = isMajor ? 10 : 5
                ctx.moveTo(0, screenPos)
                ctx.lineTo(tickWidth, screenPos)

                if (isMajor) {
                    ctx.save()
                    ctx.translate(0, screenPos + 2)
                    ctx.rotate(-Math.PI / 2)
                    ctx.fillText(logicalVal.toString(), 0, 0)
                    ctx.restore()
                }
            }
        }

        ctx.stroke()
    }, [scale, offset, type])

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
