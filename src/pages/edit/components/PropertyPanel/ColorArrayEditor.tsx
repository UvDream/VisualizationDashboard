import { Button, ColorPicker, Space, Popconfirm } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import './ColorArrayEditor.less'

interface ColorArrayEditorProps {
    value: string[]
    onChange: (colors: string[]) => void
}

export default function ColorArrayEditor({ value, onChange }: ColorArrayEditorProps) {
    const colors = value || ['#ff0000', '#00ff00', '#0000ff']

    const handleColorChange = (index: number, color: string) => {
        const newColors = [...colors]
        newColors[index] = color
        onChange(newColors)
    }

    const handleAddColor = () => {
        const newColors = [...colors, '#0000ff']
        onChange(newColors)
    }

    const handleRemoveColor = (index: number) => {
        if (colors.length > 2) {
            const newColors = colors.filter((_, i) => i !== index)
            onChange(newColors)
        }
    }

    return (
        <div className="color-array-editor">
            <div className="color-list">
                {colors.map((color, index) => (
                    <div key={index} className="color-item">
                        <ColorPicker
                            value={color}
                            onChange={(colorObj) => handleColorChange(index, colorObj.toHexString())}
                            showText
                        />
                        {colors.length > 2 && (
                            <Popconfirm
                                title="删除颜色"
                                description="确定要删除这个颜色吗？"
                                onConfirm={() => handleRemoveColor(index)}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    style={{ marginLeft: '8px' }}
                                />
                            </Popconfirm>
                        )}
                    </div>
                ))}
            </div>
            <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={handleAddColor}
                style={{ marginTop: '8px' }}
            >
                添加颜色
            </Button>
        </div>
    )
}
