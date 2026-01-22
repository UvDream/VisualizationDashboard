import { useState } from 'react'
import { Button, Modal, Input, ColorPicker, Tabs, message } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
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

export default function ChartThemeEditor({ value, onChange }: ChartThemeEditorProps) {
    const [modalVisible, setModalVisible] = useState(false)
    const [tempColors, setTempColors] = useState<string[]>(
        value?.customColors || ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272']
    )
    const [themeName, setThemeName] = useState('未命名')

    const themeType = value?.type || 'preset'
    const presetName = value?.presetName || 'default'
    const customColors = value?.customColors || []

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
    }

    const handleModalCancel = () => {
        setModalVisible(false)
    }

    const handleColorChange = (index: number, color: string) => {
        const newColors = [...tempColors]
        newColors[index] = color
        setTempColors(newColors)
    }

    const handleAddColor = () => {
        setTempColors([...tempColors, '#5470c6'])
    }

    const handleRemoveColor = (index: number) => {
        if (tempColors.length <= 1) {
            message.warning('至少需要保留一个颜色')
            return
        }
        setTempColors(tempColors.filter((_, i) => i !== index))
    }

    // 生成预览图表配置
    const getPreviewOption = () => {
        return {
            color: tempColors,
            backgroundColor: 'transparent',
            legend: {
                data: tempColors.map((_, i) => `data${i + 1}`),
                textStyle: { color: '#fff' },
                top: 10
            },
            xAxis: {
                type: 'category',
                data: ['data1', 'data2', 'data3', 'data4', 'data5', 'data6'],
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999' }
            },
            yAxis: {
                type: 'value',
                axisLine: { lineStyle: { color: '#666' } },
                axisLabel: { color: '#999' },
                splitLine: { lineStyle: { color: '#333' } }
            },
            series: tempColors.map((_, i) => ({
                name: `data${i + 1}`,
                type: 'bar',
                data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 500) + 100)
            })),
            grid: { left: 50, right: 20, top: 50, bottom: 30 }
        }
    }

    const isCustomSelected = themeType === 'custom'

    return (
        <div className="chart-theme-selector">
            {/* 自定义颜色卡片 */}
            <div
                className={`theme-card ${isCustomSelected ? 'active' : ''}`}
                onClick={() => handleThemeSelect('custom')}
            >
                <div className="theme-card-header">
                    <span className="theme-name">自定义颜色</span>
                    <PlusOutlined className="add-icon" />
                </div>
                {isCustomSelected && customColors.length > 0 && (
                    <div className="theme-colors">
                        {customColors.slice(0, 6).map((color, index) => (
                            <div
                                key={index}
                                className="color-dot"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
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
                        </div>
                        <div className="theme-colors">
                            {theme.colors.slice(0, 6).map((color, index) => (
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
                title="自定义颜色"
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                width={800}
                okText="应用"
                cancelText="取消"
                className="chart-theme-modal"
            >
                <div className="theme-modal-content">
                    <div className="theme-editor-section">
                        <div className="theme-name-input">
                            <span>名称：</span>
                            <Input
                                value={themeName}
                                onChange={(e) => setThemeName(e.target.value)}
                                placeholder="未命名"
                                style={{ width: 200 }}
                            />
                            <span className="color-count">{tempColors.length} / 8</span>
                        </div>

                        <div className="color-list">
                            {tempColors.map((color, index) => (
                                <div key={index} className="color-item-box">
                                    <ColorPicker
                                        value={color}
                                        onChange={(c) => handleColorChange(index, c.toHexString())}
                                        showText
                                    />
                                    {tempColors.length > 1 && (
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveColor(index)}
                                        />
                                    )}
                                </div>
                            ))}
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={handleAddColor}
                                className="add-color-btn"
                            >
                                添加
                            </Button>
                        </div>

                        <div className="color-palette-section">
                            <div className="palette-column">
                                <div className="palette-title">默认扩展色：</div>
                                <div className="palette-grid">
                                    {[
                                        '#6ae5bb', '#7ce5d3', '#8ee5eb', '#a0e5ff', '#b2d5ff', '#c4c5ff', '#d6b5ff', '#e8a5ff', '#ffa5eb',
                                        '#6ae5bb', '#7ce5d3', '#8ee5eb', '#a0e5ff', '#b2d5ff', '#c4c5ff', '#d6b5ff', '#e8a5ff', '#ffa5eb',
                                        '#6ae5bb', '#7ce5d3', '#8ee5eb', '#a0e5ff', '#b2d5ff', '#c4c5ff', '#d6b5ff', '#e8a5ff', '#ffa5eb'
                                    ].map((color, i) => (
                                        <div
                                            key={i}
                                            className="palette-color"
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleAddColor()}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="palette-column">
                                <div className="palette-title">透明扩展色：</div>
                                <div className="palette-grid">
                                    {[
                                        '#6ae5bb', '#7ce5d3', '#8ee5eb', '#a0e5ff', '#b2d5ff', '#c4c5ff', '#d6b5ff', '#e8a5ff', '#ffa5eb',
                                        '#6ae5bb88', '#7ce5d388', '#8ee5eb88', '#a0e5ff88', '#b2d5ff88', '#c4c5ff88', '#d6b5ff88', '#e8a5ff88', '#ffa5eb88',
                                        '#6ae5bb44', '#7ce5d344', '#8ee5eb44', '#a0e5ff44', '#b2d5ff44', '#c4c5ff44', '#d6b5ff44', '#e8a5ff44', '#ffa5eb44'
                                    ].map((color, i) => (
                                        <div
                                            key={i}
                                            className="palette-color"
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleAddColor()}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="theme-preview-section">
                        <Tabs
                            items={[
                                {
                                    key: 'bar',
                                    label: '柱状图',
                                    children: (
                                        <ReactECharts
                                            option={getPreviewOption()}
                                            style={{ height: 300 }}
                                            theme="dark"
                                        />
                                    )
                                },
                                {
                                    key: 'line',
                                    label: '折线图',
                                    children: (
                                        <ReactECharts
                                            option={{
                                                ...getPreviewOption(),
                                                series: tempColors.map((_, i) => ({
                                                    name: `data${i + 1}`,
                                                    type: 'line',
                                                    smooth: true,
                                                    data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 500) + 100)
                                                }))
                                            }}
                                            style={{ height: 300 }}
                                            theme="dark"
                                        />
                                    )
                                }
                            ]}
                            size="small"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    )
}
