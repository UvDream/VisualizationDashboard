import { useEffect, useState, useRef } from 'react'

interface RankItem {
    name: string
    value: number
}

interface ScrollRankListProps {
    data: RankItem[]
    config?: {
        rowHeight?: number
        barHeight?: number
        barColor?: string
        barBgColor?: string
        textColor?: string
        valueColor?: string
        fontSize?: number
        showIndex?: boolean
        indexColor?: string
        scrollSpeed?: number
        showBar?: boolean
    }
}

export default function ScrollRankList({ data = [], config = {} }: ScrollRankListProps) {
    const {
        rowHeight = 36,
        barHeight = 12,
        barColor = '#1890ff',
        barBgColor = 'rgba(255,255,255,0.1)',
        textColor = '#fff',
        valueColor = '#1890ff',
        fontSize = 14,
        showIndex = true,
        indexColor = '#1890ff',
        scrollSpeed = 3000,
        showBar = true,
    } = config

    const containerRef = useRef<HTMLDivElement>(null)
    const [scrollTop, setScrollTop] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    // 计算最大值用于进度条
    const maxValue = Math.max(...data.map(item => item.value), 1)

    // 复制数据实现无缝滚动
    const displayData = data.length > 0 ? [...data, ...data] : []

    useEffect(() => {
        if (data.length === 0 || isHovered) return

        const totalHeight = data.length * rowHeight
        const interval = setInterval(() => {
            setScrollTop(prev => {
                const next = prev + 1
                // 当滚动到第一组数据末尾时，重置到开始
                if (next >= totalHeight) {
                    return 0
                }
                return next
            })
        }, scrollSpeed / rowHeight)

        return () => clearInterval(interval)
    }, [data.length, rowHeight, scrollSpeed, isHovered])

    if (data.length === 0) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999'
            }}>
                暂无数据
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className="scroll-rank-list"
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                padding: '8px 12px',
                boxSizing: 'border-box',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                style={{
                    transform: `translateY(-${scrollTop}px)`,
                    transition: 'transform 0.1s linear',
                }}
            >
                {displayData.map((item, index) => {
                    const realIndex = index % data.length
                    const percent = (item.value / maxValue) * 100

                    return (
                        <div
                            key={`${item.name}-${index}`}
                            style={{
                                height: rowHeight,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: 4,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {showIndex && (
                                        <span
                                            style={{
                                                color: realIndex < 3 ? '#fff' : indexColor,
                                                backgroundColor: realIndex < 3 
                                                    ? realIndex === 0 ? '#f5222d' 
                                                    : realIndex === 1 ? '#fa8c16' 
                                                    : '#faad14'
                                                    : 'transparent',
                                                width: 20,
                                                height: 20,
                                                borderRadius: realIndex < 3 ? 4 : 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: realIndex < 3 ? 'bold' : 'normal',
                                                fontSize: fontSize - 2,
                                            }}
                                        >
                                            {realIndex + 1}
                                        </span>
                                    )}
                                    <span style={{ color: textColor }}>{item.name}</span>
                                </div>
                                <span style={{ color: valueColor, fontWeight: 'bold' }}>
                                    {item.value.toLocaleString()}
                                </span>
                            </div>
                            {showBar && (
                                <div
                                    style={{
                                        height: barHeight,
                                        backgroundColor: barBgColor,
                                        borderRadius: barHeight / 2,
                                        overflow: 'hidden',
                                        marginLeft: showIndex ? 28 : 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: `${percent}%`,
                                            height: '100%',
                                            backgroundColor: barColor,
                                            borderRadius: barHeight / 2,
                                            transition: 'width 0.3s ease',
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
