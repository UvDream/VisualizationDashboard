import { useState } from 'react'
import { Button, Input, Space, Upload, message } from 'antd'
import { PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons'

interface ImageListEditorProps {
    value?: string[]
    onChange?: (value: string[]) => void
}

export default function ImageListEditor({ value = [], onChange }: ImageListEditorProps) {
    const [images, setImages] = useState<string[]>(value)
    const [newImageUrl, setNewImageUrl] = useState('')

    const handleAdd = () => {
        if (!newImageUrl.trim()) {
            message.warning('请输入图片URL')
            return
        }
        const newImages = [...images, newImageUrl.trim()]
        setImages(newImages)
        onChange?.(newImages)
        setNewImageUrl('')
    }

    const handleDelete = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        setImages(newImages)
        onChange?.(newImages)
    }

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newImages = [...images]
        const targetIndex = direction === 'up' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newImages.length) return
        
        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]]
        setImages(newImages)
        onChange?.(newImages)
    }

    const handleFileUpload = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const base64 = e.target?.result as string
            const newImages = [...images, base64]
            setImages(newImages)
            onChange?.(newImages)
            message.success('图片已添加')
        }
        reader.onerror = () => {
            message.error('图片读取失败')
        }
        reader.readAsDataURL(file)
        return false // 阻止默认上传行为
    }

    return (
        <div style={{ width: '100%' }}>
            {/* 图片列表 */}
            <div style={{ marginBottom: 12 }}>
                {images.map((img, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                            padding: 8,
                            border: '1px solid #303030',
                            borderRadius: 4,
                            backgroundColor: '#1f1f1f'
                        }}
                    >
                        {/* 缩略图 */}
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 4,
                                overflow: 'hidden',
                                flexShrink: 0,
                                backgroundColor: '#2a2a2a'
                            }}
                        >
                            <img
                                src={img}
                                alt={`图片${index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                }}
                            />
                        </div>

                        {/* URL显示 */}
                        <div
                            style={{
                                flex: 1,
                                fontSize: 12,
                                color: '#999',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                            title={img}
                        >
                            {img.length > 50 ? img.substring(0, 50) + '...' : img}
                        </div>

                        {/* 操作按钮 */}
                        <Space size={4}>
                            <Button
                                type="text"
                                size="small"
                                disabled={index === 0}
                                onClick={() => handleMove(index, 'up')}
                                style={{ color: '#999' }}
                            >
                                ↑
                            </Button>
                            <Button
                                type="text"
                                size="small"
                                disabled={index === images.length - 1}
                                onClick={() => handleMove(index, 'down')}
                                style={{ color: '#999' }}
                            >
                                ↓
                            </Button>
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(index)}
                            />
                        </Space>
                    </div>
                ))}
            </div>

            {/* 添加图片 */}
            <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
                <Input
                    placeholder="输入图片URL"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onPressEnter={handleAdd}
                    style={{ flex: 1 }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    添加
                </Button>
            </Space.Compact>

            {/* 上传本地图片 */}
            <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleFileUpload}
                style={{ width: '100%' }}
            >
                <Button
                    icon={<UploadOutlined />}
                    style={{ width: '100%' }}
                    size="small"
                >
                    上传本地图片（转为Base64）
                </Button>
            </Upload>

            {/* 提示信息 */}
            <div style={{ 
                marginTop: 8, 
                fontSize: 12, 
                color: '#666',
                lineHeight: '1.5'
            }}>
                <div>• 支持URL和Base64格式</div>
                <div>• 拖动↑↓调整顺序</div>
                <div>• 建议图片大小小于500KB</div>
            </div>
        </div>
    )
}
