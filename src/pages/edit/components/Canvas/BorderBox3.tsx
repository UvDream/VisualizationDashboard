import { useEffect, useRef, useState } from 'react'
import './BorderBox3.less'

interface BorderBox3Props {
    width?: number
    height?: number
    borderColor?: string
    glowColor?: string
    borderWidth?: number
    animationDuration?: number
    children?: React.ReactNode
}

export default function BorderBox3({
    width: propWidth,
    height: propHeight,
    borderColor = '#235fa7',
    glowColor = '#4fd2dd',
    borderWidth = 1,
    animationDuration = 3,
    children
}: BorderBox3Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: propWidth || 300, height: propHeight || 200 })
    const pathId = useRef(`border-box-3-path-${Math.random().toString(36).substr(2, 9)}`)
    const gradientId = useRef(`border-box-3-gradient-${Math.random().toString(36).substr(2, 9)}`)
    const maskId = useRef(`border-box-3-mask-${Math.random().toString(36).substr(2, 9)}`)

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

    // 计算边框路径
    const getBorderPath = () => {
        const offset = 2.5
        return `M${offset}, ${offset} L${width - offset}, ${offset} L${width - offset}, ${height - offset} L${offset}, ${height - offset} L${offset}, ${offset}`
    }

    // 计算多边形填充区域
    const getPolygonPoints = () => {
        const offset = 5
        return `${offset}, ${offset} ${width - offset}, ${offset} ${width - offset} ${height - offset} ${offset}, ${height - offset}`
    }

    // 计算路径总长度（用于动画）
    const getPathLength = () => {
        return 2 * (width + height) - 20 // 近似计算
    }

    return (
        <div
            ref={containerRef}
            className="border-box-3"
            style={{ width, height }}
        >
            <svg width={width} height={height}>
                <defs>
                    {/* 定义边框路径 */}
                    <path
                        id={pathId.current}
                        d={getBorderPath()}
                        fill="transparent"
                    />
                    
                    {/* 定义径向渐变 */}
                    <radialGradient
                        id={gradientId.current}
                        cx="50%"
                        cy="50%"
                        r="50%"
                    >
                        <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                    </radialGradient>
                    
                    {/* 定义遮罩 */}
                    <mask id={maskId.current}>
                        <circle
                            cx="0"
                            cy="0"
                            r="150"
                            fill={`url(#${gradientId.current})`}
                        >
                            <animateMotion
                                dur={`${animationDuration}s`}
                                path={getBorderPath()}
                                rotate="auto"
                                repeatCount="indefinite"
                            />
                        </circle>
                    </mask>
                </defs>
                
                {/* 背景填充 */}
                <polygon
                    fill="#00000000"
                    points={getPolygonPoints()}
                />
                
                {/* 基础边框 */}
                <use
                    stroke={borderColor}
                    strokeWidth={borderWidth}
                    xlinkHref={`#${pathId.current}`}
                />
                
                {/* 动画光效边框 */}
                <use
                    stroke={glowColor}
                    strokeWidth={borderWidth + 2}
                    xlinkHref={`#${pathId.current}`}
                    mask={`url(#${maskId.current})`}
                >
                    <animate
                        attributeName="stroke-dasharray"
                        from={`0, ${getPathLength()}`}
                        to={`${getPathLength()}, 0`}
                        dur={`${animationDuration}s`}
                        repeatCount="indefinite"
                    />
                </use>
            </svg>

            {/* 内容区域 */}
            <div className="border-content">
                {children}
            </div>
        </div>
    )
}