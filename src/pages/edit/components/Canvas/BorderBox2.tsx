import { useEffect, useRef, useState } from 'react'
import './BorderBox2.less'

interface BorderBox2Props {
    width?: number
    height?: number
    borderColor?: string
    glowColor?: string
    borderWidth?: number
    children?: React.ReactNode
}

export default function BorderBox2({
    width: propWidth,
    height: propHeight,
    borderColor = '#6586ec',
    glowColor = '#2cf7fe',
    borderWidth = 2,
    children
}: BorderBox2Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: propWidth || 300, height: propHeight || 200 })

    // 监听容器尺寸变化
    useEffect(() => {
        if (!propWidth || !propHeight) {
            const updateDimensions = () => {
                if (containerRef.current) {
                    const { offsetWidth, offsetHeight } = containerRef.current
                    if (offsetWidth > 0 && offsetHeight > 0) {
                        setDimensions({ width: offsetWidth, height: offsetHeight })
                    }
                }
            }

            updateDimensions()

            const resizeObserver = new ResizeObserver(updateDimensions)
            if (containerRef.current) {
                resizeObserver.observe(containerRef.current)
            }

            return () => {
                resizeObserver.disconnect()
            }
        } else {
            setDimensions({ width: propWidth, height: propHeight })
        }
    }, [propWidth, propHeight])

    useEffect(() => {
        if (containerRef.current) {
            const container = containerRef.current
            container.style.setProperty('--border-color', borderColor)
            container.style.setProperty('--glow-color', glowColor)
            container.style.setProperty('--border-width', `${borderWidth}px`)
        }
    }, [borderColor, glowColor, borderWidth])

    const { width, height } = dimensions

    // 根据宽高计算主边框路径
    const getMainBorderPath = () => {
        const w = width
        const h = height
        return `M 5 20 L 5 10 L 12 3 L 60 3 L 68 10 L ${w - 20} 10 L ${w - 5} 25 L ${w - 5} ${h - 5} L 20 ${h - 5} L 5 ${h - 20} L 5 20`
    }

    // 虚线装饰路径
    const getDashedLinePath = () => {
        return "M 16 9 L 61 9"
    }

    // 左上角高亮路径
    const getTopLeftHighlightPath = () => {
        return "M 5 20 L 5 10 L 12 3 L 60 3 L 68 10"
    }

    // 右下角高亮路径
    const getBottomRightHighlightPath = () => {
        const w = width
        const h = height
        return `M ${w - 5} ${h - 30} L ${w - 5} ${h - 5} L ${w - 30} ${h - 5}`
    }

    return (
        <div
            ref={containerRef}
            className="border-box-2"
            style={{ width: propWidth || '100%', height: propHeight || '100%' }}
        >
            <svg width={width} height={height}>
                {/* 主边框 */}
                <path
                    className="main-border"
                    fill="transparent"
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                    d={getMainBorderPath()}
                />
                
                {/* 虚线装饰 */}
                <path
                    className="dashed-decoration"
                    fill="transparent"
                    stroke={borderColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="10, 5"
                    d={getDashedLinePath()}
                />
                
                {/* 左上角高亮 */}
                <path
                    className="top-left-highlight"
                    fill="transparent"
                    stroke={glowColor}
                    strokeWidth={borderWidth + 1}
                    d={getTopLeftHighlightPath()}
                />
                
                {/* 右下角高亮 */}
                <path
                    className="bottom-right-highlight"
                    fill="transparent"
                    stroke={glowColor}
                    strokeWidth={borderWidth + 1}
                    d={getBottomRightHighlightPath()}
                />
            </svg>

            {/* 内容区域 */}
            <div className="border-content">
                {children}
            </div>
        </div>
    )
}