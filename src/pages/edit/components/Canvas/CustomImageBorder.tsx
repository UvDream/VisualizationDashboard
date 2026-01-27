import { useState, useRef } from 'react'
import { Button, Input, Select, Slider, message } from 'antd'
import { UploadOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons'
import './CustomImageBorder.less'

interface CustomImageBorderProps {
    width: number
    height: number
    customBorderImage?: string
    borderImageSlice?: number
    borderImageWidth?: number
    borderImageRepeat?: 'stretch' | 'repeat' | 'round' | 'space'
    borderImageOutset?: number
    borderImageOpacity?: number
    borderImageMode?: 'border' | 'background' | 'frame'
    children?: React.ReactNode
    onImageChange?: (imageUrl: string) => void
    onConfigChange?: (config: any) => void
    previewMode?: boolean
}

export default function CustomImageBorder({
    width,
    height,
    customBorderImage = '',
    borderImageSlice = 30,
    borderImageWidth = 30,
    borderImageRepeat = 'stretch',
    borderImageOutset = 0,
    borderImageOpacity = 1,
    borderImageMode = 'border',
    children,
    onImageChange,
    onConfigChange,
    previewMode = false
}: CustomImageBorderProps) {
    const [showControls, setShowControls] = useState(false)
    const [imageUrl, setImageUrl] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    // 处理图片上传
    const handleImageUpload = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const base64 = e.target?.result as string
            onImageChange?.(base64)
            message.success('图片上传成功')
        }
        reader.readAsDataURL(file)
        return false // 阻止默认上传行为
    }

    // 处理URL输入
    const handleUrlSubmit = () => {
        if (imageUrl.trim()) {
            onImageChange?.(imageUrl.trim())
            setImageUrl('')
            message.success('图片链接设置成功')
        }
    }

    // 清除图片
    const handleClearImage = () => {
        onImageChange?.('')
        message.success('已清除边框图片')
    }

    // 生成边框样式
    const getBorderStyle = (): React.CSSProperties => {
        if (!customBorderImage) {
            return {
                border: '2px dashed #666',
                borderRadius: '8px'
            }
        }

        const baseStyle: React.CSSProperties = {
            opacity: borderImageOpacity,
            borderImageOutset: `${borderImageOutset}px`,
        }

        switch (borderImageMode) {
            case 'border':
                return {
                    ...baseStyle,
                    borderImageSource: `url(${customBorderImage})`,
                    borderImageSlice: borderImageSlice,
                    borderImageWidth: `${borderImageWidth}px`,
                    borderImageRepeat: borderImageRepeat,
                    borderStyle: 'solid',
                }
            case 'background':
                return {
                    ...baseStyle,
                    backgroundImage: `url(${customBorderImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    border: '1px solid rgba(255,255,255,0.1)',
                }
            case 'frame':
                return {
                    ...baseStyle,
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.1)',
                }
            default:
                return baseStyle
        }
    }

    const containerStyle: React.CSSProperties = {
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...getBorderStyle(),
    }

    // 相框模式需要特殊处理
    if (borderImageMode === 'frame' && customBorderImage) {
        return (
            <div 
                className="custom-image-border frame-mode"
                style={containerStyle}
                onMouseEnter={() => !previewMode && setShowControls(true)}
                onMouseLeave={() => !previewMode && setShowControls(false)}
            >
                <div 
                    className="frame-background"
                    style={{
                        position: 'absolute',
                        top: `-${borderImageWidth}px`,
                        left: `-${borderImageWidth}px`,
                        right: `-${borderImageWidth}px`,
                        bottom: `-${borderImageWidth}px`,
                        backgroundImage: `url(${customBorderImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: borderImageOpacity,
                        zIndex: -1,
                    }}
                />
                <div className="frame-content">
                    {children}
                </div>
                
                {/* 控制面板 */}
                {!previewMode && showControls && (
                    <div className="border-controls">
                        <div className="control-section">
                            <div className="control-row">
                                <Input
                                    placeholder="输入图片链接"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    onPressEnter={handleUrlSubmit}
                                    prefix={<LinkOutlined />}
                                    size="small"
                                />
                                <Button size="small" onClick={handleUrlSubmit}>
                                    设置
                                </Button>
                            </div>
                            
                            <div className="control-row">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) handleImageUpload(file)
                                    }}
                                />
                                <Button 
                                    size="small" 
                                    icon={<UploadOutlined />}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    上传图片
                                </Button>
                                <Button 
                                    size="small" 
                                    danger 
                                    icon={<DeleteOutlined />}
                                    onClick={handleClearImage}
                                    disabled={!customBorderImage}
                                >
                                    清除
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div 
            className="custom-image-border"
            style={containerStyle}
            onMouseEnter={() => !previewMode && setShowControls(true)}
            onMouseLeave={() => !previewMode && setShowControls(false)}
        >
            {children || (
                <div className="placeholder-content">
                    {customBorderImage ? null : (
                        <div className="upload-placeholder">
                            <UploadOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                            <div>点击上传边框图片</div>
                            <div style={{ fontSize: '12px', opacity: 0.6 }}>
                                或输入图片链接
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            {/* 控制面板 */}
            {!previewMode && showControls && (
                <div className="border-controls">
                    <div className="control-section">
                        <div className="control-row">
                            <Input
                                placeholder="输入图片链接"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                onPressEnter={handleUrlSubmit}
                                prefix={<LinkOutlined />}
                                size="small"
                            />
                            <Button size="small" onClick={handleUrlSubmit}>
                                设置
                            </Button>
                        </div>
                        
                        <div className="control-row">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(file)
                                }}
                            />
                            <Button 
                                size="small" 
                                icon={<UploadOutlined />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                上传图片
                            </Button>
                            <Button 
                                size="small" 
                                danger 
                                icon={<DeleteOutlined />}
                                onClick={handleClearImage}
                                disabled={!customBorderImage}
                            >
                                清除
                            </Button>
                        </div>

                        {customBorderImage && (
                            <>
                                <div className="control-row">
                                    <span className="control-label">模式:</span>
                                    <Select
                                        size="small"
                                        value={borderImageMode}
                                        onChange={(value) => onConfigChange?.({ borderImageMode: value })}
                                        options={[
                                            { value: 'border', label: '边框模式' },
                                            { value: 'background', label: '背景模式' },
                                            { value: 'frame', label: '相框模式' },
                                        ]}
                                    />
                                </div>

                                {borderImageMode === 'border' && (
                                    <>
                                        <div className="control-row">
                                            <span className="control-label">切片:</span>
                                            <Slider
                                                min={1}
                                                max={100}
                                                value={borderImageSlice}
                                                onChange={(value) => onConfigChange?.({ borderImageSlice: value })}
                                                style={{ flex: 1 }}
                                            />
                                            <span className="control-value">{borderImageSlice}</span>
                                        </div>

                                        <div className="control-row">
                                            <span className="control-label">宽度:</span>
                                            <Slider
                                                min={1}
                                                max={100}
                                                value={borderImageWidth}
                                                onChange={(value) => onConfigChange?.({ borderImageWidth: value })}
                                                style={{ flex: 1 }}
                                            />
                                            <span className="control-value">{borderImageWidth}px</span>
                                        </div>

                                        <div className="control-row">
                                            <span className="control-label">重复:</span>
                                            <Select
                                                size="small"
                                                value={borderImageRepeat}
                                                onChange={(value) => onConfigChange?.({ borderImageRepeat: value })}
                                                options={[
                                                    { value: 'stretch', label: '拉伸' },
                                                    { value: 'repeat', label: '重复' },
                                                    { value: 'round', label: '环绕' },
                                                    { value: 'space', label: '间隔' },
                                                ]}
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="control-row">
                                    <span className="control-label">透明度:</span>
                                    <Slider
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        value={borderImageOpacity}
                                        onChange={(value) => onConfigChange?.({ borderImageOpacity: value })}
                                        style={{ flex: 1 }}
                                    />
                                    <span className="control-value">{Math.round(borderImageOpacity * 100)}%</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}