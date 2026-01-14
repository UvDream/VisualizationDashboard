import { useEffect, useRef } from 'react'

interface WordCloudConfig {
    shape?: 'circle' | 'rect' | 'diamond' | 'triangle'
    colorScheme?: 'default' | 'blue' | 'green' | 'warm' | 'cool' | 'rainbow'
    minFontSize?: number
    maxFontSize?: number
    fontFamily?: string
    fontWeight?: 'normal' | 'bold'
    rotation?: boolean
    rotationRange?: [number, number]
    gridSize?: number
}

interface WordCloudChartProps {
    data: Array<{ name: string; value: number }>
    width: number
    height: number
    config?: WordCloudConfig
}

// 颜色方案
const colorSchemes = {
    default: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0'],
    blue: ['#1890ff', '#096dd9', '#0050b3', '#003a8c', '#002766', '#40a9ff', '#69c0ff', '#91d5ff', '#bae7ff', '#d6e4ff'],
    green: ['#52c41a', '#389e0d', '#237804', '#135200', '#092b00', '#73d13d', '#95de64', '#b7eb8f', '#d9f7be', '#f6ffed'],
    warm: ['#ff4d4f', '#ff7a45', '#ffa940', '#ffc53d', '#ffec3d', '#fa541c', '#fa8c16', '#faad14', '#fadb14', '#ffec3d'],
    cool: ['#13c2c2', '#08979c', '#006d75', '#00474f', '#002329', '#36cfc9', '#5cdbd3', '#87e8de', '#b5f5ec', '#e6fffb'],
    rainbow: ['#f5222d', '#fa541c', '#fa8c16', '#faad14', '#fadb14', '#a0d911', '#52c41a', '#13c2c2', '#1890ff', '#2f54eb', '#722ed1', '#eb2f96']
}

// 根据形状判断点是否在范围内
const isInShape = (x: number, y: number, width: number, height: number, shape: string) => {
    const centerX = width / 2
    const centerY = height / 2
    const relX = x - centerX
    const relY = y - centerY

    switch (shape) {
        case 'circle':
            const radius = Math.min(width, height) / 2 - 20
            return (relX * relX + relY * relY) <= radius * radius
        case 'diamond':
            return Math.abs(relX) / (width / 2 - 20) + Math.abs(relY) / (height / 2 - 20) <= 1
        case 'triangle':
            const triangleHeight = height / 2 - 20
            const triangleBase = width / 2 - 20
            return relY >= -triangleHeight / 3 && 
                   relY <= triangleHeight * 2 / 3 &&
                   Math.abs(relX) <= triangleBase * (1 - (relY + triangleHeight / 3) / triangleHeight)
        case 'rect':
        default:
            return Math.abs(relX) <= width / 2 - 20 && Math.abs(relY) <= height / 2 - 20
    }
}

export default function WordCloudChart({ data, width, height, config = {} }: WordCloudChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const {
        shape = 'circle',
        colorScheme = 'default',
        minFontSize = 12,
        maxFontSize = 48,
        fontFamily = 'Arial, sans-serif',
        fontWeight = 'bold',
        rotation = false,
        rotationRange = [-90, 90],
        gridSize = 8
    } = config

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !data || data.length === 0) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 清空画布
        ctx.clearRect(0, 0, width, height)

        // 计算最大最小值
        const maxValue = Math.max(...data.map(d => d.value))
        const minValue = Math.min(...data.map(d => d.value))

        // 获取颜色方案
        const colors = colorSchemes[colorScheme] || colorSchemes.default

        // 存储已放置的词的位置
        const placedWords: Array<{ x: number; y: number; width: number; height: number }> = []

        // 检查是否与已放置的词重叠
        const isOverlapping = (x: number, y: number, w: number, h: number) => {
            for (const word of placedWords) {
                if (!(x + w < word.x - gridSize || x > word.x + word.width + gridSize ||
                      y + h < word.y - gridSize || y > word.y + word.height + gridSize)) {
                    return true
                }
            }
            return false
        }

        // 排序数据，大的先放
        const sortedData = [...data].sort((a, b) => b.value - a.value)

        // 绘制每个词
        sortedData.forEach((item, index) => {
            // 根据值计算字体大小
            const fontSize = Math.max(minFontSize, Math.min(maxFontSize, 
                minFontSize + (item.value - minValue) / (maxValue - minValue || 1) * (maxFontSize - minFontSize)
            ))

            // 随机旋转角度
            const angle = rotation ? 
                (rotationRange[0] + Math.random() * (rotationRange[1] - rotationRange[0])) : 0

            ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
            const metrics = ctx.measureText(item.name)
            const textWidth = metrics.width
            const textHeight = fontSize

            // 尝试找到一个不重叠的位置
            let placed = false
            let attempts = 0
            const maxAttempts = 200

            while (!placed && attempts < maxAttempts) {
                // 螺旋布局
                const spiralAngle = attempts * 0.3
                const radius = 5 + attempts * 3
                const centerX = width / 2
                const centerY = height / 2

                let x = centerX + radius * Math.cos(spiralAngle)
                let y = centerY + radius * Math.sin(spiralAngle)

                // 检查是否在形状范围内
                if (isInShape(x, y, width, height, shape)) {
                    // 调整位置使文字居中
                    x = x - textWidth / 2
                    y = y + textHeight / 2

                    // 确保在画布范围内
                    x = Math.max(5, Math.min(width - textWidth - 5, x))
                    y = Math.max(textHeight + 5, Math.min(height - 5, y))

                    if (!isOverlapping(x, y - textHeight, textWidth, textHeight)) {
                        ctx.save()
                        ctx.translate(x + textWidth / 2, y - textHeight / 2)
                        ctx.rotate(angle * Math.PI / 180)
                        ctx.fillStyle = colors[index % colors.length]
                        ctx.fillText(item.name, -textWidth / 2, textHeight / 2)
                        ctx.restore()
                        
                        placedWords.push({ 
                            x: x - gridSize, 
                            y: y - textHeight - gridSize, 
                            width: textWidth + gridSize * 2, 
                            height: textHeight + gridSize * 2 
                        })
                        placed = true
                    }
                }

                attempts++
            }
        })
    }, [data, width, height, shape, colorScheme, minFontSize, maxFontSize, fontFamily, fontWeight, rotation, rotationRange, gridSize])

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ width: '100%', height: '100%' }}
        />
    )
}
