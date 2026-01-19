import { useEffect, useRef } from 'react'
import './BorderBox1.less'

interface BorderBox1Props {
    width: number
    height: number
    borderColor?: string
    glowColor?: string
    borderWidth?: number
    children?: React.ReactNode
}

export default function BorderBox1({
    width,
    height,
    borderColor = '#4fd2dd',
    glowColor = '#235fa7',
    borderWidth = 2,
    children
}: BorderBox1Props) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (containerRef.current) {
            const container = containerRef.current
            container.style.setProperty('--border-color', borderColor)
            container.style.setProperty('--glow-color', glowColor)
            container.style.setProperty('--border-width', `${borderWidth}px`)
        }
    }, [borderColor, glowColor, borderWidth])

    // 根据宽高计算多边形点位
    const getMainPolygonPoints = () => {
        const w = width
        const h = height
        const offset = 10
        const corner = 24
        
        return `${offset},${corner + 3} ${offset},${h - corner - 3} ${offset + 3},${h - corner} ${offset + 3},${h - corner + 3} ${corner},${h - offset} ${corner + 3},${h - offset} ${w - corner - 3},${h - offset} ${w - corner},${h - corner + 3} ${w - corner},${h - corner} ${w - offset},${h - corner - 3} ${w - offset},${corner + 3} ${w - corner},${corner} ${w - corner},${corner - 3} ${w - corner - 3},${offset} ${corner + 3},${offset} ${corner},${corner - 3} ${corner},${corner} ${offset + 3},${corner + 3} ${offset + 3},${corner}`
    }

    // 左上角装饰多边形点位
    const getCornerPolygonPoints = () => {
        return "6,66 6,18 12,12 18,12 24,6 27,6 30,9 36,9 39,6 84,6 81,9 75,9 73.2,7 40.8,7 37.8,10.2 24,10.2 12,21 12,24 9,27 9,51 7.8,54 7.8,63"
    }

    // 小装饰多边形点位
    const getSmallPolygonPoints = () => {
        return "27.6,4.8 38.4,4.8 35.4,7.8 30.6,7.8"
    }

    // 动画条点位
    const getAnimationBarPoints = () => {
        return "9,54 9,63 7.2,66 7.2,75 7.8,78 7.8,110 8.4,110 8.4,66 9.6,66 9.6,54"
    }

    return (
        <div
            ref={containerRef}
            className="border-box-1"
            style={{ width, height }}
        >
            {/* 主边框 */}
            <svg className="main-border" width={width} height={height}>
                <polygon
                    fill="transparent"
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                    points={getMainPolygonPoints()}
                />
            </svg>

            {/* 左上角装饰 */}
            <svg className="border-item left-top" width={width} height={height}>
                <polygon
                    className="corner-main"
                    fill={borderColor}
                    points={getCornerPolygonPoints()}
                />
                <polygon
                    className="corner-small"
                    fill={glowColor}
                    points={getSmallPolygonPoints()}
                />
                <polygon
                    className="animation-bar"
                    fill={borderColor}
                    points={getAnimationBarPoints()}
                />
            </svg>

            {/* 右上角装饰 */}
            <svg className="border-item right-top" width={width} height={height}>
                <g transform={`translate(${width}, 0) scale(-1, 1)`}>
                    <polygon
                        className="corner-main"
                        fill={borderColor}
                        points={getCornerPolygonPoints()}
                    />
                    <polygon
                        className="corner-small"
                        fill={glowColor}
                        points={getSmallPolygonPoints()}
                    />
                    <polygon
                        className="animation-bar"
                        fill={borderColor}
                        points={getAnimationBarPoints()}
                    />
                </g>
            </svg>

            {/* 左下角装饰 */}
            <svg className="border-item left-bottom" width={width} height={height}>
                <g transform={`translate(0, ${height}) scale(1, -1)`}>
                    <polygon
                        className="corner-main"
                        fill={borderColor}
                        points={getCornerPolygonPoints()}
                    />
                    <polygon
                        className="corner-small"
                        fill={glowColor}
                        points={getSmallPolygonPoints()}
                    />
                    <polygon
                        className="animation-bar"
                        fill={borderColor}
                        points={getAnimationBarPoints()}
                    />
                </g>
            </svg>

            {/* 右下角装饰 */}
            <svg className="border-item right-bottom" width={width} height={height}>
                <g transform={`translate(${width}, ${height}) scale(-1, -1)`}>
                    <polygon
                        className="corner-main"
                        fill={borderColor}
                        points={getCornerPolygonPoints()}
                    />
                    <polygon
                        className="corner-small"
                        fill={glowColor}
                        points={getSmallPolygonPoints()}
                    />
                    <polygon
                        className="animation-bar"
                        fill={borderColor}
                        points={getAnimationBarPoints()}
                    />
                </g>
            </svg>

            {/* 内容区域 */}
            <div className="border-content">
                {children}
            </div>
        </div>
    )
}