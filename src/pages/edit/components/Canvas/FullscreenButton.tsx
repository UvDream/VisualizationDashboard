import { useState, useEffect, useRef } from 'react'
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons'
import * as AntdIcons from '@ant-design/icons'
import { useDrop } from 'react-dnd'
import './FullscreenButton.less'

interface FullscreenButtonProps {
    width?: number
    height?: number
    buttonSize?: number
    iconSize?: number
    buttonColor?: string
    hoverColor?: string
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
    customIcon?: string // 自定义图标名称
    showText?: boolean // 是否显示文字
    children?: React.ReactNode
    onIconChange?: (iconType: string) => void // 图标改变回调
}

export default function FullscreenButton({
    width = 60,
    height = 60,
    buttonSize = 40,
    iconSize = 20,
    buttonColor = '#1890ff',
    hoverColor = '#40a9ff',
    position = 'center',
    customIcon,
    showText = false,
    children,
    onIconChange
}: FullscreenButtonProps) {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // 拖拽接收功能
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'NEW_COMPONENT',
        drop: (item: { componentType: string; data?: any }) => {
            // 如果拖拽的是图标组件，提取图标类型
            if (item.componentType === 'icon' && item.data?.iconType) {
                onIconChange?.(item.data.iconType)
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), [onIconChange])

    // 合并refs
    const setRefs = (el: HTMLDivElement | null) => {
        containerRef.current = el
        if (drop && el) {
            drop(el)
        }
    }

    // 检查全屏状态
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
        document.addEventListener('mozfullscreenchange', handleFullscreenChange)
        document.addEventListener('MSFullscreenChange', handleFullscreenChange)

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
        }
    }, [])

    // 进入全屏
    const enterFullscreen = async () => {
        try {
            const element = document.documentElement
            if (element.requestFullscreen) {
                await element.requestFullscreen()
            } else if ((element as any).webkitRequestFullscreen) {
                await (element as any).webkitRequestFullscreen()
            } else if ((element as any).mozRequestFullScreen) {
                await (element as any).mozRequestFullScreen()
            } else if ((element as any).msRequestFullscreen) {
                await (element as any).msRequestFullscreen()
            }
        } catch (error) {
            console.error('进入全屏失败:', error)
        }
    }

    // 退出全屏
    const exitFullscreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen()
            } else if ((document as any).webkitExitFullscreen) {
                await (document as any).webkitExitFullscreen()
            } else if ((document as any).mozCancelFullScreen) {
                await (document as any).mozCancelFullScreen()
            } else if ((document as any).msExitFullscreen) {
                await (document as any).msExitFullscreen()
            }
        } catch (error) {
            console.error('退出全屏失败:', error)
        }
    }

    // 切换全屏状态
    const toggleFullscreen = () => {
        if (isFullscreen) {
            exitFullscreen()
        } else {
            enterFullscreen()
        }
    }

    // 获取按钮位置样式
    const getPositionStyle = () => {
        const baseStyle = {
            position: 'absolute' as const,
            zIndex: 10
        }

        switch (position) {
            case 'top-left':
                return { ...baseStyle, top: 10, left: 10 }
            case 'top-right':
                return { ...baseStyle, top: 10, right: 10 }
            case 'bottom-left':
                return { ...baseStyle, bottom: 10, left: 10 }
            case 'bottom-right':
                return { ...baseStyle, bottom: 10, right: 10 }
            case 'center':
            default:
                return {
                    ...baseStyle,
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)'
                }
        }
    }

    // 获取自定义图标组件
    const getCustomIcon = () => {
        if (customIcon && (AntdIcons as any)[customIcon]) {
            const IconComponent = (AntdIcons as any)[customIcon]
            return <IconComponent style={{ fontSize: iconSize }} />
        }
        return null
    }

    // 获取显示的图标
    const getDisplayIcon = () => {
        const customIconComponent = getCustomIcon()
        if (customIconComponent) {
            return customIconComponent
        }
        
        // 默认全屏图标
        return isFullscreen ? (
            <FullscreenExitOutlined style={{ fontSize: iconSize }} />
        ) : (
            <FullscreenOutlined style={{ fontSize: iconSize }} />
        )
    }

    return (
        <div
            ref={setRefs}
            className={`fullscreen-button-container ${isOver ? 'drag-over' : ''}`}
            style={{ width, height }}
        >
            {showText && children && (
                <div className="fullscreen-content">
                    {children}
                </div>
            )}
            
            <button
                className="fullscreen-button"
                style={{
                    ...getPositionStyle(),
                    width: buttonSize,
                    height: buttonSize,
                    backgroundColor: buttonColor,
                    // @ts-ignore - CSS custom properties
                    '--hover-color': hoverColor,
                    '--icon-size': `${iconSize}px`
                }}
                onClick={toggleFullscreen}
                title={isFullscreen ? '退出全屏' : '进入全屏'}
            >
                {getDisplayIcon()}
            </button>
            
            {/* 拖拽提示 */}
            {isOver && (
                <div className="drag-overlay">
                    <div className="drag-hint">
                        拖拽图标到此处设置自定义图标
                    </div>
                </div>
            )}
        </div>
    )
}