import { useEffect, useState } from 'react'

interface ColumnConfig {
    title: string
    key: string
    width?: number
}

interface CarouselListProps {
    data: Array<Record<string, any>>
    config?: {
        columns?: ColumnConfig[]
        rowHeight?: number
        headerHeight?: number
        headerBgColor?: string
        headerTextColor?: string
        rowBgColor?: string
        rowAltBgColor?: string
        textColor?: string
        fontSize?: number
        scrollSpeed?: number
        showHeader?: boolean
        pageSize?: number
    }
}

export default function CarouselList({ data = [], config = {} }: CarouselListProps) {
    const {
        columns = [{ title: '名称', key: 'name' }],
        rowHeight = 36,
        headerHeight = 40,
        headerBgColor = 'rgba(24, 144, 255, 0.3)',
        headerTextColor = '#1890ff',
        rowBgColor = 'rgba(255,255,255,0.02)',
        rowAltBgColor = 'rgba(255,255,255,0.05)',
        textColor = '#fff',
        fontSize = 14,
        scrollSpeed = 3000,
        showHeader = true,
        pageSize = 5,
    } = config

    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    // 计算显示的数据
    const totalRows = data.length
    const displayData = totalRows > pageSize 
        ? [...data, ...data.slice(0, pageSize)] // 复制前几条用于无缝滚动
        : data

    useEffect(() => {
        if (totalRows <= pageSize || isHovered) return

        const interval = setInterval(() => {
            setIsAnimating(true)
            setCurrentIndex(prev => {
                const next = prev + 1
                if (next >= totalRows) {
                    // 滚动到末尾后，短暂延迟后重置
                    setTimeout(() => {
                        setIsAnimating(false)
                        setCurrentIndex(0)
                    }, 300)
                    return next
                }
                return next
            })
        }, scrollSpeed)

        return () => clearInterval(interval)
    }, [totalRows, pageSize, scrollSpeed, isHovered])

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

    const translateY = currentIndex * rowHeight

    return (
        <div
            className="carousel-list"
            style={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 表头 */}
            {showHeader && (
                <div
                    style={{
                        height: headerHeight,
                        backgroundColor: headerBgColor,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 12px',
                        flexShrink: 0,
                    }}
                >
                    {columns.map((col, index) => (
                        <div
                            key={col.key}
                            style={{
                                flex: col.width ? `0 0 ${col.width}px` : 1,
                                color: headerTextColor,
                                fontSize,
                                fontWeight: 'bold',
                                textAlign: index === 0 ? 'left' : 'center',
                            }}
                        >
                            {col.title}
                        </div>
                    ))}
                </div>
            )}

            {/* 列表内容 */}
            <div
                style={{
                    flex: 1,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        transform: `translateY(-${translateY}px)`,
                        transition: isAnimating ? 'transform 0.3s ease' : 'none',
                    }}
                >
                    {displayData.map((item, rowIndex) => {
                        const realIndex = rowIndex % totalRows
                        const isAlt = realIndex % 2 === 1

                        return (
                            <div
                                key={`${rowIndex}-${item.id || realIndex}`}
                                style={{
                                    height: rowHeight,
                                    backgroundColor: isAlt ? rowAltBgColor : rowBgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 12px',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                }}
                            >
                                {columns.map((col, colIndex) => (
                                    <div
                                        key={col.key}
                                        style={{
                                            flex: col.width ? `0 0 ${col.width}px` : 1,
                                            color: textColor,
                                            fontSize,
                                            textAlign: colIndex === 0 ? 'left' : 'center',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {item[col.key] ?? '-'}
                                    </div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
