import type { ComponentItem, SnapLine } from '../types'

interface Rect {
    l: number
    r: number
    t: number
    b: number
    cx: number
    cy: number
}

// 获取组件的矩形坐标和中心点
const getRect = (item: ComponentItem, x?: number, y?: number): Rect => {
    const currentX = x ?? item.style.x
    const currentY = y ?? item.style.y
    return {
        l: currentX,
        r: currentX + item.style.width,
        t: currentY,
        b: currentY + item.style.height,
        cx: currentX + item.style.width / 2,
        cy: currentY + item.style.height / 2,
    }
}

// 吸附阈值
const S_T = 5

export const calculateSnap = (
    activeId: string,
    currentX: number,
    currentY: number,
    components: ComponentItem[]
) => {
    const activeItem = components.find((c) => c.id === activeId)
    if (!activeItem) return { x: currentX, y: currentY, snapLines: [] }

    const activeRect = getRect(activeItem, currentX, currentY)
    const snapLines: SnapLine[] = []
    let newX = currentX
    let newY = currentY

    // 水平方向关键线 (x轴对齐线)
    // 比较: 左对左, 左对中, 左对右, 中对左, 中对中...
    /*
    const xTargets = [
        { value: activeRect.l, type: 'l' },
        { value: activeRect.cx, type: 'c' },
        { value: activeRect.r, type: 'r' },
    ]

    const yTargets = [
        { value: activeRect.t, type: 't' },
        { value: activeRect.cy, type: 'c' },
        { value: activeRect.b, type: 'b' },
    ]
    */

    let isXSnapped = false
    let isYSnapped = false

    for (const item of components) {
        if (item.id === activeId) continue

        const targetRect = getRect(item)

        // 检查 X 轴吸附 (Vertical Line)
        if (!isXSnapped) {
            const targetXLines = [targetRect.l, targetRect.cx, targetRect.r]

            for (const tVal of targetXLines) {
                // Left
                if (Math.abs(tVal - activeRect.l) < S_T) {
                    newX = tVal
                    snapLines.push({ type: 'v', position: tVal })
                    isXSnapped = true
                }
                // Center
                else if (Math.abs(tVal - activeRect.cx) < S_T) {
                    newX = tVal - activeItem.style.width / 2
                    snapLines.push({ type: 'v', position: tVal })
                    isXSnapped = true
                }
                // Right
                else if (Math.abs(tVal - activeRect.r) < S_T) {
                    newX = tVal - activeItem.style.width
                    snapLines.push({ type: 'v', position: tVal })
                    isXSnapped = true
                }
                if (isXSnapped) break
            }
        }

        // 检查 Y 轴吸附 (Horizontal Line)
        if (!isYSnapped) {
            const targetYLines = [targetRect.t, targetRect.cy, targetRect.b]

            for (const tVal of targetYLines) {
                // Top
                if (Math.abs(tVal - activeRect.t) < S_T) {
                    newY = tVal
                    snapLines.push({ type: 'h', position: tVal })
                    isYSnapped = true
                }
                // Center
                else if (Math.abs(tVal - activeRect.cy) < S_T) {
                    newY = tVal - activeItem.style.height / 2
                    snapLines.push({ type: 'h', position: tVal })
                    isYSnapped = true
                }
                // Bottom
                else if (Math.abs(tVal - activeRect.b) < S_T) {
                    newY = tVal - activeItem.style.height
                    snapLines.push({ type: 'h', position: tVal })
                    isYSnapped = true
                }
                if (isYSnapped) break
            }
        }
    }

    // 画布中心吸附
    // 假设画布大小我们先定为 1920x1080
    const canvasW = 1920
    const canvasH = 1080
    const canvasCx = canvasW / 2
    const canvasCy = canvasH / 2

    if (!isXSnapped && Math.abs(activeRect.cx - canvasCx) < S_T) {
        newX = canvasCx - activeItem.style.width / 2
        snapLines.push({ type: 'v', position: canvasCx })
    }

    if (!isYSnapped && Math.abs(activeRect.cy - canvasCy) < S_T) {
        newY = canvasCy - activeItem.style.height / 2
        snapLines.push({ type: 'h', position: canvasCy })
    }

    return { x: newX, y: newY, snapLines }
}
