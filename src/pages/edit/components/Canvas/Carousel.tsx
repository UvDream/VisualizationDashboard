import { useState, useEffect, useRef } from 'react'

interface CarouselProps {
    images: string[]
    config?: {
        autoplay?: boolean
        interval?: number
        showDots?: boolean
        effect?: 'slide' | 'fade'
    }
    isDragging?: boolean  // 新增：是否正在拖拽
}

export default function Carousel({ images = [], config = {}, isDragging = false }: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const timerRef = useRef<number | null>(null)
    const {
        autoplay = true,
        interval = 3000,
        showDots = true,
        effect = 'fade'
    } = config

    useEffect(() => {
        // 如果正在拖拽，停止自动播放
        if (isDragging || !autoplay || images.length <= 1) {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            return
        }

        timerRef.current = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, interval) as unknown as number

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [autoplay, interval, images.length, isDragging])

    if (images.length === 0) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '14px',
                border: '1px dashed #444',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                pointerEvents: 'none'  // 占位符不响应鼠标事件
            }}>
                <span>轮播图（请添加图片）</span>
            </div>
        )
    }

    return (
        <div style={{ 
            width: '100%', 
            height: '100%', 
            position: 'relative', 
            overflow: 'hidden',
            backgroundColor: '#000',
            pointerEvents: isDragging ? 'none' : 'auto'  // 拖拽时禁用鼠标事件
        }}>
            {/* 图片容器 */}
            {images.map((img, index) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: index === currentIndex ? 1 : 0,
                        transition: isDragging ? 'none' : (effect === 'fade' ? 'opacity 0.5s ease-in-out' : 'none'),
                        zIndex: index === currentIndex ? 1 : 0,
                        pointerEvents: 'none'  // 图片不响应鼠标事件
                    }}
                >
                    <img
                        src={img}
                        alt={`轮播图${index + 1}`}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            pointerEvents: 'none',  // 图片不响应鼠标事件
                            userSelect: 'none'  // 禁止选择
                        }}
                        draggable={false}  // 禁止拖拽图片本身
                        onError={(e) => {
                            // 图片加载失败时显示占位符
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                                parent.innerHTML = `
                                    <div style="
                                        width: 100%;
                                        height: 100%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        background: #2a2a2a;
                                        color: #999;
                                        font-size: 14px;
                                        pointer-events: none;
                                    ">
                                        图片加载失败
                                    </div>
                                `
                            }
                        }}
                    />
                </div>
            ))}

            {/* 指示点 */}
            {showDots && images.length > 1 && !isDragging && (
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10,
                    padding: '5px 10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: '20px',
                    pointerEvents: 'none'  // 拖拽时不响应鼠标事件
                }}>
                    {images.map((_, index) => (
                        <div
                            key={index}
                            onClick={() => !isDragging && setCurrentIndex(index)}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: index === currentIndex ? '#1890ff' : 'rgba(255,255,255,0.5)',
                                cursor: isDragging ? 'default' : 'pointer',
                                transition: isDragging ? 'none' : 'all 0.3s ease',
                                transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
                                pointerEvents: isDragging ? 'none' : 'auto'
                            }}
                        />
                    ))}
                </div>
            )}

            {/* 图片计数 */}
            {!isDragging && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '4px 8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    fontSize: '12px',
                    borderRadius: '4px',
                    zIndex: 10,
                    pointerEvents: 'none'
                }}>
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    )
}
