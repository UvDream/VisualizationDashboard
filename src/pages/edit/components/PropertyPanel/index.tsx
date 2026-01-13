import { useState } from 'react'
import { Form, Input, InputNumber, Select, Collapse, Tabs, ColorPicker, Switch, Radio } from 'antd'
import { useEditor } from '../../context/EditorContext'
import { getMapRegionOptions } from '../../utils/mapData'
import JsonEditor from './JsonEditor'
import './index.less'

export default function PropertyPanel() {
    const { getSelectedComponent, updateComponent } = useEditor()
    const selectedComponent = getSelectedComponent()
    const [selectedSeriesIndex, setSelectedSeriesIndex] = useState(0)

    if (!selectedComponent) {
        return (
            <div className="property-panel">
                <div className="property-panel-header">属性</div>
                <div className="property-panel-empty">
                    请选择一个组件
                </div>
            </div>
        )
    }

    const handleChange = (field: string, value: unknown) => {
        if (field.startsWith('style.')) {
            const styleField = field.replace('style.', '')
            updateComponent(selectedComponent.id, {
                style: {
                    ...selectedComponent.style,
                    [styleField]: value,
                },
            })
        } else if (field.startsWith('props.')) {
            const propsField = field.replace('props.', '')
            updateComponent(selectedComponent.id, {
                props: {
                    ...selectedComponent.props,
                    [propsField]: value,
                },
            })
        } else {
            updateComponent(selectedComponent.id, { [field]: value })
        }
    }

    const basicCollapseItems = [
        {
            key: 'basic',
            label: '基础属性',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="名称">
                        <Input
                            value={selectedComponent.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </Form.Item>
                    <Form.Item label="类型">
                        <Input value={selectedComponent.type} disabled />
                    </Form.Item>
                </Form>
            ),
        },
        {
            key: 'position',
            label: '位置尺寸',
            children: (
                <Form layout="vertical" size="small">
                    <div className="form-row">
                        <Form.Item label="X">
                            <InputNumber
                                value={selectedComponent.style.x}
                                onChange={(v) => handleChange('style.x', v ?? 0)}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="Y">
                            <InputNumber
                                value={selectedComponent.style.y}
                                onChange={(v) => handleChange('style.y', v ?? 0)}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                    <div className="form-row">
                        <Form.Item label="宽度">
                            <InputNumber
                                value={selectedComponent.style.width}
                                onChange={(v) => handleChange('style.width', v ?? 100)}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="高度">
                            <InputNumber
                                value={selectedComponent.style.height}
                                onChange={(v) => handleChange('style.height', v ?? 100)}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                </Form>
            ),
        },
        // 轴配置 - 仅对需要轴的图表有效
        ...(['lineChart', 'barChart', 'scatterChart'].includes(selectedComponent.type) ? [
            {
                key: 'xAxis',
                label: 'X轴配置',
                children: (
                    <Form layout="vertical" size="small">
                        <Form.Item label="显示轴" style={{ marginBottom: 8 }}>
                            <Switch
                                checked={selectedComponent.props.xAxisConfig?.show !== false}
                                onChange={(v) => handleChange('props.xAxisConfig', { ...selectedComponent.props.xAxisConfig, show: v })}
                            />
                        </Form.Item>
                        {selectedComponent.props.xAxisConfig?.show !== false && (
                            <>
                                <Form.Item label="轴类型">
                                    <Select
                                        value={selectedComponent.props.xAxisConfig?.type || 'category'}
                                        onChange={(v) => handleChange('props.xAxisConfig', { ...selectedComponent.props.xAxisConfig, type: v })}
                                        options={[
                                            { value: 'category', label: '类目轴' },
                                            { value: 'value', label: '数值轴' },
                                            { value: 'time', label: '时间轴' },
                                            { value: 'log', label: '对数轴' },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item label="轴名称">
                                    <Input
                                        value={selectedComponent.props.xAxisConfig?.name || ''}
                                        onChange={(e) => handleChange('props.xAxisConfig', { ...selectedComponent.props.xAxisConfig, name: e.target.value })}
                                        placeholder="请输入轴名称"
                                    />
                                </Form.Item>
                                <Form.Item label="名称位置">
                                    <Select
                                        value={selectedComponent.props.xAxisConfig?.nameLocation || 'end'}
                                        onChange={(v) => handleChange('props.xAxisConfig', { ...selectedComponent.props.xAxisConfig, nameLocation: v })}
                                        options={[
                                            { value: 'start', label: '开始' },
                                            { value: 'middle', label: '中间' },
                                            { value: 'end', label: '结束' },
                                        ]}
                                    />
                                </Form.Item>
                                <div className="form-row">
                                    <Form.Item label="名称间隔">
                                        <InputNumber
                                            value={selectedComponent.props.xAxisConfig?.nameGap || 15}
                                            onChange={(v) => handleChange('props.xAxisConfig', { ...selectedComponent.props.xAxisConfig, nameGap: v })}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="轴位置">
                                        <Select
                                            value={selectedComponent.props.xAxisConfig?.position || 'bottom'}
                                            onChange={(v) => handleChange('props.xAxisConfig', { ...selectedComponent.props.xAxisConfig, position: v })}
                                            options={[
                                                { value: 'top', label: '顶部' },
                                                { value: 'bottom', label: '底部' },
                                            ]}
                                        />
                                    </Form.Item>
                                </div>
                                
                                {/* 轴线配置 */}
                                <Form.Item label="轴线颜色">
                                    <ColorPicker
                                        value={selectedComponent.props.xAxisConfig?.axisLine?.lineStyle?.color || '#ccc'}
                                        onChange={(color) => handleChange('props.xAxisConfig', {
                                            ...selectedComponent.props.xAxisConfig,
                                            axisLine: {
                                                ...selectedComponent.props.xAxisConfig?.axisLine,
                                                lineStyle: {
                                                    ...selectedComponent.props.xAxisConfig?.axisLine?.lineStyle,
                                                    color: color.toHexString()
                                                }
                                            }
                                        })}
                                    />
                                </Form.Item>
                                <div className="form-row">
                                    <Form.Item label="轴线宽度">
                                        <InputNumber
                                            value={selectedComponent.props.xAxisConfig?.axisLine?.lineStyle?.width || 1}
                                            onChange={(v) => handleChange('props.xAxisConfig', {
                                                ...selectedComponent.props.xAxisConfig,
                                                axisLine: {
                                                    ...selectedComponent.props.xAxisConfig?.axisLine,
                                                    lineStyle: {
                                                        ...selectedComponent.props.xAxisConfig?.axisLine?.lineStyle,
                                                        width: v
                                                    }
                                                }
                                            })}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="轴线类型">
                                        <Select
                                            value={selectedComponent.props.xAxisConfig?.axisLine?.lineStyle?.type || 'solid'}
                                            onChange={(v) => handleChange('props.xAxisConfig', {
                                                ...selectedComponent.props.xAxisConfig,
                                                axisLine: {
                                                    ...selectedComponent.props.xAxisConfig?.axisLine,
                                                    lineStyle: {
                                                        ...selectedComponent.props.xAxisConfig?.axisLine?.lineStyle,
                                                        type: v
                                                    }
                                                }
                                            })}
                                            options={[
                                                { value: 'solid', label: '实线' },
                                                { value: 'dashed', label: '虚线' },
                                                { value: 'dotted', label: '点线' },
                                            ]}
                                        />
                                    </Form.Item>
                                </div>

                                {/* 轴标签配置 */}
                                <Form.Item label="标签颜色">
                                    <ColorPicker
                                        value={selectedComponent.props.xAxisConfig?.axisLabel?.color || '#fff'}
                                        onChange={(color) => handleChange('props.xAxisConfig', {
                                            ...selectedComponent.props.xAxisConfig,
                                            axisLabel: {
                                                ...selectedComponent.props.xAxisConfig?.axisLabel,
                                                color: color.toHexString()
                                            }
                                        })}
                                    />
                                </Form.Item>
                                <div className="form-row">
                                    <Form.Item label="标签大小">
                                        <InputNumber
                                            value={selectedComponent.props.xAxisConfig?.axisLabel?.fontSize || 12}
                                            onChange={(v) => handleChange('props.xAxisConfig', {
                                                ...selectedComponent.props.xAxisConfig,
                                                axisLabel: {
                                                    ...selectedComponent.props.xAxisConfig?.axisLabel,
                                                    fontSize: v
                                                }
                                            })}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="旋转角度">
                                        <InputNumber
                                            value={selectedComponent.props.xAxisConfig?.axisLabel?.rotate || 0}
                                            onChange={(v) => handleChange('props.xAxisConfig', {
                                                ...selectedComponent.props.xAxisConfig,
                                                axisLabel: {
                                                    ...selectedComponent.props.xAxisConfig?.axisLabel,
                                                    rotate: v
                                                }
                                            })}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </div>
                            </>
                        )}
                    </Form>
                )
            },
            {
                key: 'yAxis',
                label: 'Y轴配置',
                children: (
                    <Form layout="vertical" size="small">
                        <Form.Item label="显示轴" style={{ marginBottom: 8 }}>
                            <Switch
                                checked={selectedComponent.props.yAxisConfig?.show !== false}
                                onChange={(v) => handleChange('props.yAxisConfig', { ...selectedComponent.props.yAxisConfig, show: v })}
                            />
                        </Form.Item>
                        {selectedComponent.props.yAxisConfig?.show !== false && (
                            <>
                                <Form.Item label="轴类型">
                                    <Select
                                        value={selectedComponent.props.yAxisConfig?.type || 'value'}
                                        onChange={(v) => handleChange('props.yAxisConfig', { ...selectedComponent.props.yAxisConfig, type: v })}
                                        options={[
                                            { value: 'value', label: '数值轴' },
                                            { value: 'category', label: '类目轴' },
                                            { value: 'time', label: '时间轴' },
                                            { value: 'log', label: '对数轴' },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item label="轴名称">
                                    <Input
                                        value={selectedComponent.props.yAxisConfig?.name || ''}
                                        onChange={(e) => handleChange('props.yAxisConfig', { ...selectedComponent.props.yAxisConfig, name: e.target.value })}
                                        placeholder="请输入轴名称"
                                    />
                                </Form.Item>
                                <Form.Item label="名称位置">
                                    <Select
                                        value={selectedComponent.props.yAxisConfig?.nameLocation || 'end'}
                                        onChange={(v) => handleChange('props.yAxisConfig', { ...selectedComponent.props.yAxisConfig, nameLocation: v })}
                                        options={[
                                            { value: 'start', label: '开始' },
                                            { value: 'middle', label: '中间' },
                                            { value: 'end', label: '结束' },
                                        ]}
                                    />
                                </Form.Item>
                                <div className="form-row">
                                    <Form.Item label="名称间隔">
                                        <InputNumber
                                            value={selectedComponent.props.yAxisConfig?.nameGap || 15}
                                            onChange={(v) => handleChange('props.yAxisConfig', { ...selectedComponent.props.yAxisConfig, nameGap: v })}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="轴位置">
                                        <Select
                                            value={selectedComponent.props.yAxisConfig?.position || 'left'}
                                            onChange={(v) => handleChange('props.yAxisConfig', { ...selectedComponent.props.yAxisConfig, position: v })}
                                            options={[
                                                { value: 'left', label: '左侧' },
                                                { value: 'right', label: '右侧' },
                                            ]}
                                        />
                                    </Form.Item>
                                </div>
                                
                                {/* 轴线配置 */}
                                <Form.Item label="轴线颜色">
                                    <ColorPicker
                                        value={selectedComponent.props.yAxisConfig?.axisLine?.lineStyle?.color || '#ccc'}
                                        onChange={(color) => handleChange('props.yAxisConfig', {
                                            ...selectedComponent.props.yAxisConfig,
                                            axisLine: {
                                                ...selectedComponent.props.yAxisConfig?.axisLine,
                                                lineStyle: {
                                                    ...selectedComponent.props.yAxisConfig?.axisLine?.lineStyle,
                                                    color: color.toHexString()
                                                }
                                            }
                                        })}
                                    />
                                </Form.Item>
                                <div className="form-row">
                                    <Form.Item label="轴线宽度">
                                        <InputNumber
                                            value={selectedComponent.props.yAxisConfig?.axisLine?.lineStyle?.width || 1}
                                            onChange={(v) => handleChange('props.yAxisConfig', {
                                                ...selectedComponent.props.yAxisConfig,
                                                axisLine: {
                                                    ...selectedComponent.props.yAxisConfig?.axisLine,
                                                    lineStyle: {
                                                        ...selectedComponent.props.yAxisConfig?.axisLine?.lineStyle,
                                                        width: v
                                                    }
                                                }
                                            })}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="轴线类型">
                                        <Select
                                            value={selectedComponent.props.yAxisConfig?.axisLine?.lineStyle?.type || 'solid'}
                                            onChange={(v) => handleChange('props.yAxisConfig', {
                                                ...selectedComponent.props.yAxisConfig,
                                                axisLine: {
                                                    ...selectedComponent.props.yAxisConfig?.axisLine,
                                                    lineStyle: {
                                                        ...selectedComponent.props.yAxisConfig?.axisLine?.lineStyle,
                                                        type: v
                                                    }
                                                }
                                            })}
                                            options={[
                                                { value: 'solid', label: '实线' },
                                                { value: 'dashed', label: '虚线' },
                                                { value: 'dotted', label: '点线' },
                                            ]}
                                        />
                                    </Form.Item>
                                </div>

                                {/* 轴标签配置 */}
                                <Form.Item label="标签颜色">
                                    <ColorPicker
                                        value={selectedComponent.props.yAxisConfig?.axisLabel?.color || '#fff'}
                                        onChange={(color) => handleChange('props.yAxisConfig', {
                                            ...selectedComponent.props.yAxisConfig,
                                            axisLabel: {
                                                ...selectedComponent.props.yAxisConfig?.axisLabel,
                                                color: color.toHexString()
                                            }
                                        })}
                                    />
                                </Form.Item>
                                <div className="form-row">
                                    <Form.Item label="标签大小">
                                        <InputNumber
                                            value={selectedComponent.props.yAxisConfig?.axisLabel?.fontSize || 12}
                                            onChange={(v) => handleChange('props.yAxisConfig', {
                                                ...selectedComponent.props.yAxisConfig,
                                                axisLabel: {
                                                    ...selectedComponent.props.yAxisConfig?.axisLabel,
                                                    fontSize: v
                                                }
                                            })}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="标签边距">
                                        <InputNumber
                                            value={selectedComponent.props.yAxisConfig?.axisLabel?.margin || 8}
                                            onChange={(v) => handleChange('props.yAxisConfig', {
                                                ...selectedComponent.props.yAxisConfig,
                                                axisLabel: {
                                                    ...selectedComponent.props.yAxisConfig?.axisLabel,
                                                    margin: v
                                                }
                                            })}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                </div>

                                {/* 分割线配置 */}
                                <Form.Item label="显示分割线" style={{ marginBottom: 8 }}>
                                    <Switch
                                        checked={selectedComponent.props.yAxisConfig?.splitLine?.show !== false}
                                        onChange={(v) => handleChange('props.yAxisConfig', {
                                            ...selectedComponent.props.yAxisConfig,
                                            splitLine: {
                                                ...selectedComponent.props.yAxisConfig?.splitLine,
                                                show: v
                                            }
                                        })}
                                    />
                                </Form.Item>
                                {selectedComponent.props.yAxisConfig?.splitLine?.show !== false && (
                                    <>
                                        <Form.Item label="分割线颜色">
                                            <ColorPicker
                                                value={selectedComponent.props.yAxisConfig?.splitLine?.lineStyle?.color || '#333'}
                                                onChange={(color) => handleChange('props.yAxisConfig', {
                                                    ...selectedComponent.props.yAxisConfig,
                                                    splitLine: {
                                                        ...selectedComponent.props.yAxisConfig?.splitLine,
                                                        lineStyle: {
                                                            ...selectedComponent.props.yAxisConfig?.splitLine?.lineStyle,
                                                            color: color.toHexString()
                                                        }
                                                    }
                                                })}
                                            />
                                        </Form.Item>
                                        <div className="form-row">
                                            <Form.Item label="分割线宽度">
                                                <InputNumber
                                                    value={selectedComponent.props.yAxisConfig?.splitLine?.lineStyle?.width || 1}
                                                    onChange={(v) => handleChange('props.yAxisConfig', {
                                                        ...selectedComponent.props.yAxisConfig,
                                                        splitLine: {
                                                            ...selectedComponent.props.yAxisConfig?.splitLine,
                                                            lineStyle: {
                                                                ...selectedComponent.props.yAxisConfig?.splitLine?.lineStyle,
                                                                width: v
                                                            }
                                                        }
                                                    })}
                                                    style={{ width: '100%' }}
                                                />
                                            </Form.Item>
                                            <Form.Item label="透明度">
                                                <InputNumber
                                                    value={selectedComponent.props.yAxisConfig?.splitLine?.lineStyle?.opacity || 1}
                                                    onChange={(v) => handleChange('props.yAxisConfig', {
                                                        ...selectedComponent.props.yAxisConfig,
                                                        splitLine: {
                                                            ...selectedComponent.props.yAxisConfig?.splitLine,
                                                            lineStyle: {
                                                                ...selectedComponent.props.yAxisConfig?.splitLine?.lineStyle,
                                                                opacity: v
                                                            }
                                                        }
                                                    })}
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    max={1}
                                                    step={0.1}
                                                />
                                            </Form.Item>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </Form>
                )
            }
        ] : []),
        // 符号配置 - 仅对折线图和散点图有效
        ...(['lineChart', 'scatterChart'].includes(selectedComponent.type) ? [{
            key: 'symbol',
            label: '符号配置',
            children: (
                <Form layout="vertical" size="small">
                    {/* 系列选择器 */}
                    <Form.Item label="选择数据系列">
                        <Select
                            value={selectedSeriesIndex}
                            onChange={(v) => setSelectedSeriesIndex(v)}
                            options={selectedComponent.props.seriesData?.map((series, index) => ({
                                value: index,
                                label: series.name || `系列${index + 1}`
                            })) || [{ value: 0, label: '系列1' }]}
                        />
                    </Form.Item>

                    {/* 当前系列的符号配置 */}
                    {selectedComponent.props.seriesData && selectedComponent.props.seriesData[selectedSeriesIndex] && (
                        <>
                            <Form.Item label="显示符号" style={{ marginBottom: 8 }}>
                                <Switch
                                    checked={selectedComponent.props.seriesData[selectedSeriesIndex].symbolConfig?.show !== false}
                                    onChange={(v) => {
                                        const newData = [...selectedComponent.props.seriesData!];
                                        newData[selectedSeriesIndex] = {
                                            ...newData[selectedSeriesIndex],
                                            symbolConfig: {
                                                ...newData[selectedSeriesIndex].symbolConfig,
                                                show: v
                                            }
                                        };
                                        handleChange('props.seriesData', newData);
                                    }}
                                />
                            </Form.Item>
                            
                            {selectedComponent.props.seriesData[selectedSeriesIndex].symbolConfig?.show !== false && (
                                <>
                                    <Form.Item label="符号类型">
                                        <Select
                                            value={selectedComponent.props.seriesData[selectedSeriesIndex].symbolConfig?.type || 'circle'}
                                            onChange={(v) => {
                                                const newData = [...selectedComponent.props.seriesData!];
                                                newData[selectedSeriesIndex] = {
                                                    ...newData[selectedSeriesIndex],
                                                    symbolConfig: {
                                                        ...newData[selectedSeriesIndex].symbolConfig,
                                                        type: v
                                                    }
                                                };
                                                handleChange('props.seriesData', newData);
                                            }}
                                            options={[
                                                { value: 'circle', label: '圆形' },
                                                { value: 'rect', label: '矩形' },
                                                { value: 'roundRect', label: '圆角矩形' },
                                                { value: 'triangle', label: '三角形' },
                                                { value: 'diamond', label: '菱形' },
                                                { value: 'pin', label: '气泡' },
                                                { value: 'arrow', label: '箭头' },
                                                { value: 'none', label: '无' },
                                            ]}
                                        />
                                    </Form.Item>
                                    <div className="form-row">
                                        <Form.Item label="符号大小">
                                            <InputNumber
                                                value={selectedComponent.props.seriesData[selectedSeriesIndex].symbolConfig?.size || (selectedComponent.type === 'lineChart' ? 4 : 10)}
                                                onChange={(v) => {
                                                    const newData = [...selectedComponent.props.seriesData!];
                                                    newData[selectedSeriesIndex] = {
                                                        ...newData[selectedSeriesIndex],
                                                        symbolConfig: {
                                                            ...newData[selectedSeriesIndex].symbolConfig,
                                                            size: v ?? 0
                                                        }
                                                    };
                                                    handleChange('props.seriesData', newData);
                                                }}
                                                style={{ width: '100%' }}
                                                min={0}
                                                max={50}
                                            />
                                        </Form.Item>
                                        <Form.Item label="透明度">
                                            <InputNumber
                                                value={selectedComponent.props.seriesData[selectedSeriesIndex].symbolConfig?.opacity || 1}
                                                onChange={(v) => {
                                                    const newData = [...selectedComponent.props.seriesData!];
                                                    newData[selectedSeriesIndex] = {
                                                        ...newData[selectedSeriesIndex],
                                                        symbolConfig: {
                                                            ...newData[selectedSeriesIndex].symbolConfig,
                                                            opacity: v ?? 1
                                                        }
                                                    };
                                                    handleChange('props.seriesData', newData);
                                                }}
                                                style={{ width: '100%' }}
                                                min={0}
                                                max={1}
                                                step={0.1}
                                            />
                                        </Form.Item>
                                    </div>
                                    <Form.Item label="符号颜色">
                                        <ColorPicker
                                            value={selectedComponent.props.seriesData[selectedSeriesIndex].symbolConfig?.color || '#c23531'}
                                            onChange={(color) => {
                                                const newData = [...selectedComponent.props.seriesData!];
                                                newData[selectedSeriesIndex] = {
                                                    ...newData[selectedSeriesIndex],
                                                    symbolConfig: {
                                                        ...newData[selectedSeriesIndex].symbolConfig,
                                                        color: color.toHexString()
                                                    }
                                                };
                                                handleChange('props.seriesData', newData);
                                            }}
                                        />
                                    </Form.Item>
                                    <div className="form-row">
                                        <Form.Item label="边框颜色">
                                            <ColorPicker
                                                value={selectedComponent.props.seriesData[selectedSeriesIndex].symbolConfig?.borderColor || '#fff'}
                                                onChange={(color) => {
                                                    const newData = [...selectedComponent.props.seriesData!];
                                                    newData[selectedSeriesIndex] = {
                                                        ...newData[selectedSeriesIndex],
                                                        symbolConfig: {
                                                            ...newData[selectedSeriesIndex].symbolConfig,
                                                            borderColor: color.toHexString()
                                                        }
                                                    };
                                                    handleChange('props.seriesData', newData);
                                                }}
                                            />
                                        </Form.Item>
                                        <Form.Item label="边框宽度">
                                            <InputNumber
                                                value={selectedComponent.props.seriesData[selectedSeriesIndex].symbolConfig?.borderWidth || (selectedComponent.type === 'lineChart' ? 1 : 0)}
                                                onChange={(v) => {
                                                    const newData = [...selectedComponent.props.seriesData!];
                                                    newData[selectedSeriesIndex] = {
                                                        ...newData[selectedSeriesIndex],
                                                        symbolConfig: {
                                                            ...newData[selectedSeriesIndex].symbolConfig,
                                                            borderWidth: v ?? 0
                                                        }
                                                    };
                                                    handleChange('props.seriesData', newData);
                                                }}
                                                style={{ width: '100%' }}
                                                min={0}
                                                max={10}
                                            />
                                        </Form.Item>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </Form>
            )
        }] : []),
        // 图例配置 - 仅对图表有效
        ...(['lineChart', 'barChart', 'pieChart', 'radarChart', 'scatterChart'].includes(selectedComponent.type) ? [{
            key: 'legend',
            label: '图例配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="显示图例" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.legend?.show}
                            onChange={(v) => handleChange('props.legend', { ...selectedComponent.props.legend, show: v })}
                        />
                    </Form.Item>
                    {selectedComponent.props.legend?.show && (
                        <>
                            <Form.Item label="布局方向">
                                <Radio.Group
                                    value={selectedComponent.props.legend?.orient || 'horizontal'}
                                    onChange={(e) => handleChange('props.legend', { ...selectedComponent.props.legend, orient: e.target.value })}
                                    optionType="button"
                                    size="small"
                                >
                                    <Radio value="horizontal">水平</Radio>
                                    <Radio value="vertical">垂直</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <div className="form-row">
                                <Form.Item label="水平位置">
                                    <Select
                                        value={selectedComponent.props.legend?.left || 'center'}
                                        onChange={(v) => handleChange('props.legend', { ...selectedComponent.props.legend, left: v })}
                                        options={[
                                            { value: 'left', label: '左' },
                                            { value: 'center', label: '中' },
                                            { value: 'right', label: '右' },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item label="垂直位置">
                                    <Select
                                        value={selectedComponent.props.legend?.top || 'top'}
                                        onChange={(v) => handleChange('props.legend', { ...selectedComponent.props.legend, top: v })}
                                        options={[
                                            { value: 'top', label: '上' },
                                            { value: 'middle', label: '中' },
                                            { value: 'bottom', label: '下' },
                                        ]}
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item label="文字颜色">
                                <ColorPicker
                                    value={selectedComponent.props.legend?.textStyle?.color || '#fff'}
                                    onChange={(color) => handleChange('props.legend', {
                                        ...selectedComponent.props.legend,
                                        textStyle: { ...selectedComponent.props.legend?.textStyle, color: color.toHexString() }
                                    })}
                                />
                            </Form.Item>
                            <div className="form-row">
                                <Form.Item label="字体大小">
                                    <InputNumber
                                        value={selectedComponent.props.legend?.textStyle?.fontSize || 12}
                                        onChange={(v) => handleChange('props.legend', {
                                            ...selectedComponent.props.legend,
                                            textStyle: { ...selectedComponent.props.legend?.textStyle, fontSize: v }
                                        })}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                                <Form.Item label="字体粗细">
                                    <Select
                                        value={selectedComponent.props.legend?.textStyle?.fontWeight || 'normal'}
                                        onChange={(v) => handleChange('props.legend', {
                                            ...selectedComponent.props.legend,
                                            textStyle: { ...selectedComponent.props.legend?.textStyle, fontWeight: v }
                                        })}
                                        options={[
                                            { value: 'normal', label: '正常' },
                                            { value: 'bold', label: '加粗' },
                                        ]}
                                    />
                                </Form.Item>
                            </div>
                        </>
                    )}
                </Form>
            )
        }] : []),
        {
            key: 'style',
            label: '样式',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="背景色">
                        <ColorPicker
                            value={selectedComponent.style.backgroundColor}
                            onChange={(color) => handleChange('style.backgroundColor', color.toHexString())}
                        />
                    </Form.Item>
                    <Form.Item label="圆角">
                        <InputNumber
                            value={selectedComponent.style.borderRadius ?? 0}
                            onChange={(v) => handleChange('style.borderRadius', v ?? 0)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="透明度">
                        <InputNumber
                            value={selectedComponent.style.opacity ?? 1}
                            min={0}
                            max={1}
                            step={0.1}
                            onChange={(v) => handleChange('style.opacity', v ?? 1)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            ),
        },
    ]

    const dataContent = (
        <Form layout="vertical" size="small" style={{ padding: '0 12px' }}>
            {['text', 'button', 'tag', 'card'].includes(selectedComponent.type) && (
                <Form.Item label="内容">
                    <Input
                        value={selectedComponent.props.content}
                        onChange={(e) => handleChange('props.content', e.target.value)}
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'tag' && (
                <Form.Item label="标签颜色">
                    <Select
                        value={selectedComponent.props.tagColor || 'blue'}
                        onChange={(v) => handleChange('props.tagColor', v)}
                        options={[
                            { value: 'blue', label: '蓝色' },
                            { value: 'green', label: '绿色' },
                            { value: 'red', label: '红色' },
                            { value: 'orange', label: '橙色' },
                            { value: 'purple', label: '紫色' },
                            { value: 'cyan', label: '青色' },
                            { value: 'gold', label: '金色' },
                            { value: 'magenta', label: '品红' },
                            { value: 'volcano', label: '火山' },
                            { value: 'geekblue', label: '极客蓝' },
                            { value: 'lime', label: '酸橙' },
                        ]}
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'card' && (
                <Form.Item label="卡片标题">
                    <Input
                        value={selectedComponent.props.chartTitle}
                        onChange={(e) => handleChange('props.chartTitle', e.target.value)}
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'avatar' && (
                <Form.Item label="头像地址">
                    <Input
                        value={selectedComponent.props.src}
                        onChange={(e) => handleChange('props.src', e.target.value)}
                        placeholder="输入图片URL"
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'text' && (
                <>
                    <Form.Item label="字体颜色">
                        <ColorPicker
                            value={selectedComponent.style.color || '#ffffff'}
                            onChange={(color) => handleChange('style.color', color.toHexString())}
                        />
                    </Form.Item>
                    <Form.Item label="字体大小">
                        <InputNumber
                            value={selectedComponent.style.fontSize ?? 14}
                            onChange={(v) => handleChange('style.fontSize', v ?? 14)}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </>
            )}
            {selectedComponent.type === 'button' && (
                <Form.Item label="按钮类型">
                    <Select
                        value={selectedComponent.props.buttonType || 'primary'}
                        onChange={(v) => handleChange('props.buttonType', v)}
                        options={[
                            { value: 'primary', label: '主要' },
                            { value: 'default', label: '默认' },
                            { value: 'dashed', label: '虚线' },
                            { value: 'link', label: '链接' },
                        ]}
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'image' && (
                <>
                    <Form.Item label="图片地址">
                        <Input
                            value={selectedComponent.props.src}
                            onChange={(e) => handleChange('props.src', e.target.value)}
                            placeholder="输入图片URL"
                        />
                    </Form.Item>
                    <Form.Item label="替代文本">
                        <Input
                            value={selectedComponent.props.alt}
                            onChange={(e) => handleChange('props.alt', e.target.value)}
                        />
                    </Form.Item>
                </>
            )}
            {selectedComponent.type === 'table' && (
                <>
                    <Form.Item label="表头配置">
                        <JsonEditor
                            value={selectedComponent.props.tableColumns || []}
                            onChange={(v) => handleChange('props.tableColumns', v)}
                            placeholder='[{"title":"Name","dataIndex":"name","key":"name"}]'
                        />
                    </Form.Item>
                    <Form.Item label="表格数据">
                        <JsonEditor
                            value={selectedComponent.props.tableData || []}
                            onChange={(v) => handleChange('props.tableData', v)}
                            placeholder='[{"key":"1","name":"John Brown"}]'
                        />
                    </Form.Item>
                </>
            )}
            {['lineChart', 'barChart'].includes(selectedComponent.type) && (
                <>
                    <Form.Item label="X轴数据">
                        <JsonEditor
                            value={selectedComponent.props.xAxisData || []}
                            onChange={(v) => handleChange('props.xAxisData', v)}
                            placeholder='["Mon", "Tue", "Wed"]'
                        />
                    </Form.Item>
                    <Form.Item label="系列数据">
                        <JsonEditor
                            value={selectedComponent.props.seriesData || []}
                            onChange={(v) => handleChange('props.seriesData', v)}
                            placeholder='[{"name":"Series A","data":[120, 132, 101]}]'
                        />
                    </Form.Item>
                </>
            )}
            {selectedComponent.type === 'select' && (
                <>
                    <Form.Item label="选项配置">
                        <JsonEditor
                            value={selectedComponent.props.selectOptions || []}
                            onChange={(v) => handleChange('props.selectOptions', v)}
                            placeholder='[{"label":"Option 1","value":"1"}]'
                        />
                    </Form.Item>
                    <Form.Item label="默认选中">
                        <Select
                            value={selectedComponent.props.content}
                            onChange={(v) => handleChange('props.content', v)}
                            options={selectedComponent.props.selectOptions}
                            allowClear
                        />
                    </Form.Item>
                </>
            )}
            {selectedComponent.type === 'pieChart' && (
                <Form.Item label="饼图数据">
                    <JsonEditor
                        value={selectedComponent.props.pieData || []}
                        onChange={(v) => handleChange('props.pieData', v)}
                        placeholder='[{"value":1048,"name":"Search Engine"}]'
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'mapChart' && (
                <>
                    <Form.Item label="地图区域">
                        <Select
                            value={selectedComponent.props.mapRegion || 'china'}
                            onChange={(v) => handleChange('props.mapRegion', v)}
                            options={getMapRegionOptions()}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        />
                    </Form.Item>
                    <Form.Item label="地图数据">
                        <JsonEditor
                            value={selectedComponent.props.mapData || []}
                            onChange={(v) => handleChange('props.mapData', v)}
                            placeholder='[{"name":"北京","value":100}]'
                        />
                    </Form.Item>
                </>
            )}
            {['gaugeChart', 'progress'].includes(selectedComponent.type) && (
                <Form.Item label="数值">
                    <InputNumber
                        value={selectedComponent.props.singleData ?? selectedComponent.props.percent ?? 0}
                        onChange={(v) => {
                            handleChange('props.singleData', v)
                            handleChange('props.percent', v)
                        }}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            )}
        </Form>
    )

    const items = [
        {
            key: 'props',
            label: '基础',
            children: (
                <Collapse
                    defaultActiveKey={['basic', 'position', 'style']}
                    items={basicCollapseItems}
                    bordered={false}
                    size="small"
                />
            ),
        },
        {
            key: 'data',
            label: '数据',
            children: dataContent,
        },
    ]

    return (
        <div className="property-panel">
            <div className="property-panel-header">属性</div>
            <div className="property-panel-content">
                <Tabs
                    defaultActiveKey="props"
                    items={items}
                    size="small"
                    tabBarStyle={{ color: '#fff', padding: '0 12px' }}
                />
            </div>
        </div>
    )
}
