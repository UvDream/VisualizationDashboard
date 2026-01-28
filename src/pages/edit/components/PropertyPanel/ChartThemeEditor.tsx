import { useState, useEffect } from 'react'
import { Button, Modal, Input, ColorPicker, Tabs, message, Tooltip, Space, Divider } from 'antd'
import { PlusOutlined, DeleteOutlined, EyeOutlined, BgColorsOutlined, CheckOutlined, ReloadOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { PRESET_THEMES } from '../../config/chartThemes'
import './ChartThemeEditor.less'

interface ChartThemeEditorProps {
    value?: {
        type: 'preset' | 'custom'
        presetName?: string
        customColors?: string[]
    }
    onChange?: (value: {
        type: 'preset' | 'custom'
        presetName?: string
        customColors?: string[]
    }) => void
}

// 预设颜色调色板
const COLOR_PALETTES = {
    basic: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ],
    professional: [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b',
        '#e377c2', '#7f7f7f', '#bcbd22', '#17becf', '#aec7e8', '#ffbb78'
    ],
    vibrant: [
        '#FF3366', '#33CCFF', '#66FF33', '#FFCC33', '#CC33FF', '#FF6633',
        '#33FF66', '#6633FF', '#FFFF33', '#FF33CC', '#33FFCC', '#CC66FF'
    ],
    pastel: [
        '#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFD3BA', '#E0BBE4',
        '#C7CEEA', '#FFDFD3', '#B5EAD7', '#F0E68C', '#DDA0DD', '#F5DEB3'
    ]
}

export default function ChartThemeEditor({ value, onChange }: ChartThemeEditorProps) {
    const [modalVisible, setModalVisible] = useState(false)
    const [tempColors, setTempColors] = useState<string[]>(
        value?.customColors || ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272']
    )
    const [themeName, setThemeName] = useState('自定义主题')
    const [, setSelectedPalette] = useState<keyof typeof COLOR_PALETTES>('basic')

    const themeType = value?.type || 'preset'
    const presetName = value?.presetName || 'professional'
    const customColors = value?.customColors || []

    // 同步外部值到内部状态
    useEffect(() => {
        if (value?.customColors) {
            setTempColors(value.customColors)
        }
    }, [value?.customColors])

    const handleThemeSelect = (type: 'preset' | 'custom', name?: string) => {
        if (type === 'custom') {
            setModalVisible(true)
        } else {
            onChange?.({
                type: 'preset',
                presetName: name,
                customColors: undefined
            })
        }
    }

    const handleModalOk = () => {
        if (tempColors.length === 0) {
            message.warning('至少需要一个颜色')
            return
        }
        onChange?.({
            type: 'custom',
            presetName: undefined,
            customColors: tempColors
        })
        setModalVisible(false)
        message.success('自定义主题已应用')
    }

    const handleModalCancel = () => {
        // 恢复到原始状态
        setTempColors(value?.customColors || ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'])
        setModalVisible(false)
    }

    const handleColorChange = (index: number, color: string) => {
        const newColors = [...tempColors]
        newColors[index] = color
        setTempColors(newColors)
    }

    const handleAddColor = (color?: string) => {
        if (tempColors.length >= 12) {
            message.warning('最多支持12种颜色')
            return
        }
        const newColor = color || '#5470c6'
        setTempColors([...tempColors, newColor])
    }

    const handleRemoveColor = (index: number) => {
        if (tempColors.length <= 1) {
            message.warning('至少需要保留一个颜色')
            return
        }
        setTempColors(tempColors.filter((_, i) => i !== index))
    }

    const handleApplyPalette = (paletteKey: keyof typeof COLOR_PALETTES) => {
        const palette = COLOR_PALETTES[paletteKey]
        setTempColors(palette.slice(0, 8)) // 取前8个颜色
        setSelectedPalette(paletteKey)
        message.success(`已应用${paletteKey}调色板`)
    }

    const handleRandomColors = () => {
        const randomColors = Array.from({ length: 6 }, () => {
            const hue = Math.floor(Math.random() * 360)
            const saturation = 60 + Math.floor(Math.random() * 30) // 60-90%
            const lightness = 50 + Math.floor(Math.random() * 20) // 50-70%
            return `hsl(${hue}, ${saturation}%, ${lightness}%)`
        })
        setTempColors(randomColors)
        message.success('已生成随机配色')
    }

    // 生成预览图表配置
    const getPreviewOption = (chartType: 'bar' | 'line' | 'pie' = 'bar') => {
        const baseOption = {
            color: tempColors,
            backgroundColor: 'transparent',
            legend: {
                data: tempColors.slice(0, 6).map((_, i) => `系列${i + 1}`),
                textStyle: { color: '#fff', fontSize: 12 },
                top: 10,
                itemWidth: 12,
                itemHeight: 8
            },
            grid: { left: 40, right: 20, top: 50, bottom: 30 },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#333',
                textStyle: { color: '#fff' }
            }
        }

        if (chartType === 'pie') {
            return {
                ...baseOption,
                series: [{
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['50%', '60%'],
                    data: tempColors.slice(0, 6).map((_, i) => ({
                        name: `系列${i + 1}`,
                        value: Math.floor(Math.random() * 100) + 20
                    })),
                    label: {
                        color: '#fff',
                        fontSize: 10
                    },
                    labelLine: {
                        lineStyle: { color: '#666' }
                    }
                }]
            }
        }

        return {
            ...baseOption,
            xAxis: {
                type: 'category',
                data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999', fontSize: 10 },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'value',
                axisLine: { show: false },
                axisLabel: { color: '#999', fontSize: 10 },
                splitLine: { lineStyle: { color: '#333', type: 'dashed' } },
                axisTick: { show: false }
            },
            series: tempColors.slice(0, 6).map((_, i) => ({
                name: `系列${i + 1}`,
                type: chartType,
                smooth: chartType === 'line',
                data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100) + 20),
                ...(chartType === 'line' ? {
                    lineStyle: { width: 2 },
                    symbol: 'circle',
                    symbolSize: 4
                } : {})
            }))
        }
    }

    const isCustomSelected = themeType === 'custom'

    return (
        <div className="chart-theme-selector">
            {/* 自定义颜色卡片 */}
            <div
                className={`theme-card custom-theme ${isCustomSelected ? 'active' : ''}`}
                onClick={() => handleThemeSelect('custom')}
            >
                <div className="theme-card-header">
                    <BgColorsOutlined className="theme-icon" />
                    <span className="theme-name">自定义主题</span>
                    {isCustomSelected && <CheckOutlined className="check-icon" />}
                </div>
                {isCustomSelected && customColors.length > 0 && (
                    <div className="theme-colors">
                        {customColors.slice(0, 8).map((color, index) => (
                            <div
                                key={index}
                                className="color-dot"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
                <div className="theme-card-overlay">
                    <EyeOutlined />
                    <span>编辑</span>
                </div>
            </div>

            {/* 预设主题列表 */}
            {Object.entries(PRESET_THEMES).map(([key, theme]) => {
                const isActive = themeType === 'preset' && presetName === key
                return (
                    <div
                        key={key}
                        className={`theme-card ${isActive ? 'active' : ''}`}
                        onClick={() => handleThemeSelect('preset', key)}
                    >
                        <div className="theme-card-header">
                            <span className="theme-name">{theme.name}</span>
                            {isActive && <CheckOutlined className="check-icon" />}
                        </div>
                        <div className="theme-colors">
                            {theme.colors.slice(0, 8).map((color, index) => (
                                <div
                                    key={index}
                                    className="color-dot"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                )
            })}

            {/* 自定义颜色弹窗 */}
            <Modal
                title={
                    <div className="modal-title">
                        <BgColorsOutlined />
                        <span>自定义图表主题</span>
                    </div>
                }
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                width={900}
                okText="应用主题"
                cancelText="取消"
                className="chart-theme-modal"
            >
                <div className="theme-modal-content">
                    <div className="theme-editor-section">
                        <div className="editor-header">
                            <div className="theme-name-input">
                                <span>主题名称：</span>
                                <Input
                                    value={themeName}
                                    onChange={(e) => setThemeName(e.target.value)}
                                    placeholder="自定义主题"
                                    style={{ width: 150 }}
                                />
                            </div>
                            <div className="color-count">
                                <span>颜色数量：{tempColors.length} / 12</span>
                            </div>
                            <Space>
                                <Tooltip title="生成随机配色">
                                    <Button 
                                        icon={<ReloadOutlined />} 
                                        onClick={handleRandomColors}
                                        size="small"
                                    >
                                        随机
                                    </Button>
                                </Tooltip>
                            </Space>
                        </div>

                        <Divider orientationMargin="0">当前颜色</Divider>
                        <div className="color-list">
                            {tempColors.map((color, index) => (
                                <div key={index} className="color-item-box">
                                    <ColorPicker
                                        value={color}
                                        onChange={(c) => handleColorChange(index, c.toHexString())}
                                        showText
                                        size="small"
                                    />
                                    {tempColors.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveColor(index)}
                                            className="remove-btn"
                                        />
                                    )}
                                </div>
                            ))}
                            {tempColors.length < 12 && (
                                <Button
                                    type="dashed"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleAddColor()}
                                    className="add-color-btn"
                                    size="small"
                                >
                                    添加颜色
                                </Button>
                            )}
                        </div>

                        <Divider orientationMargin="0">预设调色板</Divider>
                        <div className="palette-section">
                            {Object.entries(COLOR_PALETTES).map(([key, colors]) => (
                                <div key={key} className="palette-group">
                                    <div className="palette-header">
                                        <span className="palette-name">
                                            {key === 'basic' ? '基础色' : 
                                             key === 'professional' ? '专业色' :
                                             key === 'vibrant' ? '鲜艳色' : '柔和色'}
                                        </span>
                                        <Button 
                                            size="small" 
                                            type="link"
                                            onClick={() => handleApplyPalette(key as keyof typeof COLOR_PALETTES)}
                                        >
                                            应用
                                        </Button>
                                    </div>
                                    <div className="palette-colors">
                                        {colors.map((color, i) => (
                                            <Tooltip key={i} title={`点击添加 ${color}`}>
                                                <div
                                                    className="palette-color"
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => handleAddColor(color)}
                                                />
                                            </Tooltip>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="theme-preview-section">
                        <Divider orientationMargin="0">预览效果</Divider>
                        <Tabs
                            items={[
                                {
                                    key: 'bar',
                                    label: '柱状图',
                                    children: (
                                        <ReactECharts
                                            option={getPreviewOption('bar')}
                                            style={{ height: 200 }}
                                            theme="dark"
                                        />
                                    )
                                },
                                {
                                    key: 'line',
                                    label: '折线图',
                                    children: (
                                        <ReactECharts
                                            option={getPreviewOption('line')}
                                            style={{ height: 200 }}
                                            theme="dark"
                                        />
                                    )
                                },
                                {
                                    key: 'pie',
                                    label: '饼图',
                                    children: (
                                        <ReactECharts
                                            option={getPreviewOption('pie')}
                                            style={{ height: 200 }}
                                            theme="dark"
                                        />
                                    )
                                }
                            ]}
                            size="small"
                            tabBarStyle={{ marginBottom: 16 }}
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}
