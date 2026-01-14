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
        // 雷达图配置
        ...(selectedComponent.type === 'radarChart' ? [{
            key: 'radarConfig',
            label: '雷达图配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="形状">
                        <Select
                            value={selectedComponent.props.radarConfig?.shape || 'polygon'}
                            onChange={(v) => handleChange('props.radarConfig', {
                                ...selectedComponent.props.radarConfig,
                                shape: v
                            })}
                            options={[
                                { value: 'polygon', label: '多边形' },
                                { value: 'circle', label: '圆形' },
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="半径(%)">
                        <InputNumber
                            value={selectedComponent.props.radarConfig?.radius || 65}
                            onChange={(v) => handleChange('props.radarConfig', {
                                ...selectedComponent.props.radarConfig,
                                radius: v
                            })}
                            min={20}
                            max={90}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="显示轴线" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.radarConfig?.axisLine?.show !== false}
                            onChange={(v) => handleChange('props.radarConfig', {
                                ...selectedComponent.props.radarConfig,
                                axisLine: { ...selectedComponent.props.radarConfig?.axisLine, show: v }
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.radarConfig?.axisLine?.show !== false && (
                        <div className="form-row">
                            <Form.Item label="轴线颜色">
                                <ColorPicker
                                    value={selectedComponent.props.radarConfig?.axisLine?.lineStyle?.color || 'rgba(255,255,255,0.3)'}
                                    onChange={(c) => handleChange('props.radarConfig', {
                                        ...selectedComponent.props.radarConfig,
                                        axisLine: {
                                            ...selectedComponent.props.radarConfig?.axisLine,
                                            lineStyle: {
                                                ...selectedComponent.props.radarConfig?.axisLine?.lineStyle,
                                                color: c.toHexString()
                                            }
                                        }
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label="轴线宽度">
                                <InputNumber
                                    value={selectedComponent.props.radarConfig?.axisLine?.lineStyle?.width || 1}
                                    onChange={(v) => handleChange('props.radarConfig', {
                                        ...selectedComponent.props.radarConfig,
                                        axisLine: {
                                            ...selectedComponent.props.radarConfig?.axisLine,
                                            lineStyle: {
                                                ...selectedComponent.props.radarConfig?.axisLine?.lineStyle,
                                                width: v
                                            }
                                        }
                                    })}
                                    min={1}
                                    max={5}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </div>
                    )}
                    <Form.Item label="显示分割线" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.radarConfig?.splitLine?.show !== false}
                            onChange={(v) => handleChange('props.radarConfig', {
                                ...selectedComponent.props.radarConfig,
                                splitLine: { ...selectedComponent.props.radarConfig?.splitLine, show: v }
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.radarConfig?.splitLine?.show !== false && (
                        <div className="form-row">
                            <Form.Item label="分割线颜色">
                                <ColorPicker
                                    value={selectedComponent.props.radarConfig?.splitLine?.lineStyle?.color || 'rgba(255,255,255,0.3)'}
                                    onChange={(c) => handleChange('props.radarConfig', {
                                        ...selectedComponent.props.radarConfig,
                                        splitLine: {
                                            ...selectedComponent.props.radarConfig?.splitLine,
                                            lineStyle: {
                                                ...selectedComponent.props.radarConfig?.splitLine?.lineStyle,
                                                color: c.toHexString()
                                            }
                                        }
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label="分割线宽度">
                                <InputNumber
                                    value={selectedComponent.props.radarConfig?.splitLine?.lineStyle?.width || 1}
                                    onChange={(v) => handleChange('props.radarConfig', {
                                        ...selectedComponent.props.radarConfig,
                                        splitLine: {
                                            ...selectedComponent.props.radarConfig?.splitLine,
                                            lineStyle: {
                                                ...selectedComponent.props.radarConfig?.splitLine?.lineStyle,
                                                width: v
                                            }
                                        }
                                    })}
                                    min={1}
                                    max={5}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </div>
                    )}
                    <Form.Item label="显示分割区域" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.radarConfig?.splitArea?.show !== false}
                            onChange={(v) => handleChange('props.radarConfig', {
                                ...selectedComponent.props.radarConfig,
                                splitArea: { ...selectedComponent.props.radarConfig?.splitArea, show: v }
                            })}
                        />
                    </Form.Item>
                </Form>
            )
        },
        {
            key: 'radarAxisName',
            label: '指示器文字',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="文字颜色">
                        <ColorPicker
                            value={selectedComponent.props.radarConfig?.axisName?.color || '#fff'}
                            onChange={(c) => handleChange('props.radarConfig', {
                                ...selectedComponent.props.radarConfig,
                                axisName: {
                                    ...selectedComponent.props.radarConfig?.axisName,
                                    color: c.toHexString()
                                }
                            })}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="字体大小">
                            <InputNumber
                                value={selectedComponent.props.radarConfig?.axisName?.fontSize || 12}
                                onChange={(v) => handleChange('props.radarConfig', {
                                    ...selectedComponent.props.radarConfig,
                                    axisName: {
                                        ...selectedComponent.props.radarConfig?.axisName,
                                        fontSize: v
                                    }
                                })}
                                min={10}
                                max={24}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="字体粗细">
                            <Select
                                value={selectedComponent.props.radarConfig?.axisName?.fontWeight || 'normal'}
                                onChange={(v) => handleChange('props.radarConfig', {
                                    ...selectedComponent.props.radarConfig,
                                    axisName: {
                                        ...selectedComponent.props.radarConfig?.axisName,
                                        fontWeight: v
                                    }
                                })}
                                options={[
                                    { value: 'normal', label: '正常' },
                                    { value: 'bold', label: '加粗' },
                                ]}
                            />
                        </Form.Item>
                    </div>
                </Form>
            )
        },
        {
            key: 'radarSeries',
            label: '系列样式',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="显示区域填充" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.radarSeriesConfig?.areaStyle?.show !== false}
                            onChange={(v) => handleChange('props.radarSeriesConfig', {
                                ...selectedComponent.props.radarSeriesConfig,
                                areaStyle: { ...selectedComponent.props.radarSeriesConfig?.areaStyle, show: v }
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.radarSeriesConfig?.areaStyle?.show !== false && (
                        <Form.Item label="填充透明度">
                            <InputNumber
                                value={selectedComponent.props.radarSeriesConfig?.areaStyle?.opacity || 0.3}
                                onChange={(v) => handleChange('props.radarSeriesConfig', {
                                    ...selectedComponent.props.radarSeriesConfig,
                                    areaStyle: {
                                        ...selectedComponent.props.radarSeriesConfig?.areaStyle,
                                        opacity: v
                                    }
                                })}
                                min={0}
                                max={1}
                                step={0.1}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    )}
                    <Form.Item label="线条宽度">
                        <InputNumber
                            value={selectedComponent.props.radarSeriesConfig?.lineStyle?.width || 2}
                            onChange={(v) => handleChange('props.radarSeriesConfig', {
                                ...selectedComponent.props.radarSeriesConfig,
                                lineStyle: {
                                    ...selectedComponent.props.radarSeriesConfig?.lineStyle,
                                    width: v
                                }
                            })}
                            min={1}
                            max={10}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="标记点形状">
                            <Select
                                value={selectedComponent.props.radarSeriesConfig?.symbol || 'circle'}
                                onChange={(v) => handleChange('props.radarSeriesConfig', {
                                    ...selectedComponent.props.radarSeriesConfig,
                                    symbol: v
                                })}
                                options={[
                                    { value: 'circle', label: '圆形' },
                                    { value: 'rect', label: '方形' },
                                    { value: 'roundRect', label: '圆角方形' },
                                    { value: 'triangle', label: '三角形' },
                                    { value: 'diamond', label: '菱形' },
                                    { value: 'none', label: '无' },
                                ]}
                            />
                        </Form.Item>
                        <Form.Item label="标记点大小">
                            <InputNumber
                                value={selectedComponent.props.radarSeriesConfig?.symbolSize || 6}
                                onChange={(v) => handleChange('props.radarSeriesConfig', {
                                    ...selectedComponent.props.radarSeriesConfig,
                                    symbolSize: v
                                })}
                                min={0}
                                max={20}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                </Form>
            )
        }] : []),
        // 饼图配置 - 仅对饼图有效
        ...(selectedComponent.type === 'pieChart' ? [{
            key: 'pieBasic',
            label: '饼图配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="饼图类型">
                        <Radio.Group
                            value={selectedComponent.props.pieConfig?.roseType || false}
                            onChange={(e) => handleChange('props.pieConfig', {
                                ...selectedComponent.props.pieConfig,
                                roseType: e.target.value
                            })}
                            optionType="button"
                            size="small"
                        >
                            <Radio value={false}>普通</Radio>
                            <Radio value="radius">玫瑰图</Radio>
                            <Radio value="area">面积玫瑰</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="内半径">
                            <Input
                                value={selectedComponent.props.pieConfig?.radius?.[0] || '0%'}
                                onChange={(e) => handleChange('props.pieConfig', {
                                    ...selectedComponent.props.pieConfig,
                                    radius: [e.target.value, selectedComponent.props.pieConfig?.radius?.[1] || '70%']
                                })}
                                placeholder="0%"
                            />
                        </Form.Item>
                        <Form.Item label="外半径">
                            <Input
                                value={selectedComponent.props.pieConfig?.radius?.[1] || '70%'}
                                onChange={(e) => handleChange('props.pieConfig', {
                                    ...selectedComponent.props.pieConfig,
                                    radius: [selectedComponent.props.pieConfig?.radius?.[0] || '0%', e.target.value]
                                })}
                                placeholder="70%"
                            />
                        </Form.Item>
                    </div>
                    <div className="form-row">
                        <Form.Item label="圆心X">
                            <Input
                                value={selectedComponent.props.pieConfig?.center?.[0] || '50%'}
                                onChange={(e) => handleChange('props.pieConfig', {
                                    ...selectedComponent.props.pieConfig,
                                    center: [e.target.value, selectedComponent.props.pieConfig?.center?.[1] || '50%']
                                })}
                                placeholder="50%"
                            />
                        </Form.Item>
                        <Form.Item label="圆心Y">
                            <Input
                                value={selectedComponent.props.pieConfig?.center?.[1] || '50%'}
                                onChange={(e) => handleChange('props.pieConfig', {
                                    ...selectedComponent.props.pieConfig,
                                    center: [selectedComponent.props.pieConfig?.center?.[0] || '50%', e.target.value]
                                })}
                                placeholder="50%"
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="扇区圆角">
                        <InputNumber
                            value={selectedComponent.props.pieConfig?.borderRadius || 0}
                            onChange={(v) => handleChange('props.pieConfig', {
                                ...selectedComponent.props.pieConfig,
                                borderRadius: v
                            })}
                            min={0}
                            max={50}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="边框宽度">
                            <InputNumber
                                value={selectedComponent.props.pieConfig?.borderWidth || 0}
                                onChange={(v) => handleChange('props.pieConfig', {
                                    ...selectedComponent.props.pieConfig,
                                    borderWidth: v
                                })}
                                min={0}
                                max={10}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="边框颜色">
                            <ColorPicker
                                value={selectedComponent.props.pieConfig?.borderColor || '#fff'}
                                onChange={(c) => handleChange('props.pieConfig', {
                                    ...selectedComponent.props.pieConfig,
                                    borderColor: c.toHexString()
                                })}
                            />
                        </Form.Item>
                    </div>
                    <div className="form-row">
                        <Form.Item label="阴影模糊">
                            <InputNumber
                                value={selectedComponent.props.pieConfig?.itemStyle?.shadowBlur || 0}
                                onChange={(v) => handleChange('props.pieConfig', {
                                    ...selectedComponent.props.pieConfig,
                                    itemStyle: {
                                        ...selectedComponent.props.pieConfig?.itemStyle,
                                        shadowBlur: v
                                    }
                                })}
                                min={0}
                                max={50}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="阴影颜色">
                            <ColorPicker
                                value={selectedComponent.props.pieConfig?.itemStyle?.shadowColor || 'rgba(0,0,0,0.3)'}
                                onChange={(c) => handleChange('props.pieConfig', {
                                    ...selectedComponent.props.pieConfig,
                                    itemStyle: {
                                        ...selectedComponent.props.pieConfig?.itemStyle,
                                        shadowColor: c.toHexString()
                                    }
                                })}
                            />
                        </Form.Item>
                    </div>
                </Form>
            )
        },
        {
            key: 'pieLabel',
            label: '标签配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="显示标签" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.pieConfig?.label?.show !== false}
                            onChange={(v) => handleChange('props.pieConfig', {
                                ...selectedComponent.props.pieConfig,
                                label: { ...selectedComponent.props.pieConfig?.label, show: v }
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.pieConfig?.label?.show !== false && (
                        <>
                            <Form.Item label="标签位置">
                                <Radio.Group
                                    value={selectedComponent.props.pieConfig?.label?.position || 'outside'}
                                    onChange={(e) => handleChange('props.pieConfig', {
                                        ...selectedComponent.props.pieConfig,
                                        label: { ...selectedComponent.props.pieConfig?.label, position: e.target.value }
                                    })}
                                    optionType="button"
                                    size="small"
                                >
                                    <Radio value="outside">外部</Radio>
                                    <Radio value="inside">内部</Radio>
                                    <Radio value="center">中心</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item label="标签格式">
                                <Select
                                    value={selectedComponent.props.pieConfig?.label?.formatter || '{b}: {d}%'}
                                    onChange={(v) => handleChange('props.pieConfig', {
                                        ...selectedComponent.props.pieConfig,
                                        label: { ...selectedComponent.props.pieConfig?.label, formatter: v }
                                    })}
                                    options={[
                                        { value: '{b}', label: '名称' },
                                        { value: '{c}', label: '数值' },
                                        { value: '{d}%', label: '百分比' },
                                        { value: '{b}: {c}', label: '名称: 数值' },
                                        { value: '{b}: {d}%', label: '名称: 百分比' },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item label="标签颜色">
                                <ColorPicker
                                    value={selectedComponent.props.pieConfig?.label?.color || '#fff'}
                                    onChange={(c) => handleChange('props.pieConfig', {
                                        ...selectedComponent.props.pieConfig,
                                        label: { ...selectedComponent.props.pieConfig?.label, color: c.toHexString() }
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label="字体大小">
                                <InputNumber
                                    value={selectedComponent.props.pieConfig?.label?.fontSize || 12}
                                    onChange={(v) => handleChange('props.pieConfig', {
                                        ...selectedComponent.props.pieConfig,
                                        label: { ...selectedComponent.props.pieConfig?.label, fontSize: v }
                                    })}
                                    min={10}
                                    max={24}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </>
                    )}
                </Form>
            )
        },
        {
            key: 'pieLabelLine',
            label: '引导线配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="显示引导线" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.pieConfig?.labelLine?.show !== false}
                            onChange={(v) => handleChange('props.pieConfig', {
                                ...selectedComponent.props.pieConfig,
                                labelLine: { ...selectedComponent.props.pieConfig?.labelLine, show: v }
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.pieConfig?.labelLine?.show !== false && (
                        <>
                            <div className="form-row">
                                <Form.Item label="第一段长度">
                                    <InputNumber
                                        value={selectedComponent.props.pieConfig?.labelLine?.length || 10}
                                        onChange={(v) => handleChange('props.pieConfig', {
                                            ...selectedComponent.props.pieConfig,
                                            labelLine: { ...selectedComponent.props.pieConfig?.labelLine, length: v }
                                        })}
                                        min={0}
                                        max={50}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                                <Form.Item label="第二段长度">
                                    <InputNumber
                                        value={selectedComponent.props.pieConfig?.labelLine?.length2 || 20}
                                        onChange={(v) => handleChange('props.pieConfig', {
                                            ...selectedComponent.props.pieConfig,
                                            labelLine: { ...selectedComponent.props.pieConfig?.labelLine, length2: v }
                                        })}
                                        min={0}
                                        max={50}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </div>
                            <div className="form-row">
                                <Form.Item label="线条颜色">
                                    <ColorPicker
                                        value={selectedComponent.props.pieConfig?.labelLine?.lineStyle?.color || '#fff'}
                                        onChange={(c) => handleChange('props.pieConfig', {
                                            ...selectedComponent.props.pieConfig,
                                            labelLine: {
                                                ...selectedComponent.props.pieConfig?.labelLine,
                                                lineStyle: {
                                                    ...selectedComponent.props.pieConfig?.labelLine?.lineStyle,
                                                    color: c.toHexString()
                                                }
                                            }
                                        })}
                                    />
                                </Form.Item>
                                <Form.Item label="线条宽度">
                                    <InputNumber
                                        value={selectedComponent.props.pieConfig?.labelLine?.lineStyle?.width || 1}
                                        onChange={(v) => handleChange('props.pieConfig', {
                                            ...selectedComponent.props.pieConfig,
                                            labelLine: {
                                                ...selectedComponent.props.pieConfig?.labelLine,
                                                lineStyle: {
                                                    ...selectedComponent.props.pieConfig?.labelLine?.lineStyle,
                                                    width: v
                                                }
                                            }
                                        })}
                                        min={1}
                                        max={5}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </div>
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
        // 日历热力图配置
        ...(selectedComponent.type === 'calendarChart' ? [{
            key: 'calendar',
            label: '日历配置',
            children: (
                <Form layout="vertical" size="small">
                    <div className="form-row">
                        <Form.Item label="年份">
                            <InputNumber
                                value={selectedComponent.props.calendarYear || new Date().getFullYear()}
                                onChange={(v) => handleChange('props.calendarYear', v)}
                                min={2000}
                                max={2100}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="语言">
                            <Select
                                value={selectedComponent.props.calendarLang || 'zh'}
                                onChange={(v) => handleChange('props.calendarLang', v)}
                                options={[
                                    { value: 'zh', label: '中文' },
                                    { value: 'en', label: 'English' },
                                ]}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="单元格大小">
                        <InputNumber
                            value={selectedComponent.props.calendarCellSize || 15}
                            onChange={(v) => handleChange('props.calendarCellSize', v)}
                            min={8}
                            max={30}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="热力颜色">
                        <JsonEditor
                            value={selectedComponent.props.calendarColors || ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']}
                            onChange={(v) => handleChange('props.calendarColors', v)}
                            placeholder='["#ebedf0", "#c6e48b", "#7bc96f"]'
                        />
                    </Form.Item>
                    <Form.Item label="每周起始日">
                        <Select
                            value={selectedComponent.props.calendarDayLabel?.firstDay ?? 1}
                            onChange={(v) => handleChange('props.calendarDayLabel', {
                                ...selectedComponent.props.calendarDayLabel,
                                firstDay: v
                            })}
                            options={[
                                { value: 0, label: '周日' },
                                { value: 1, label: '周一' },
                            ]}
                        />
                    </Form.Item>
                </Form>
            )
        }] : []),
        // 日历图例配置
        ...(selectedComponent.type === 'calendarChart' ? [{
            key: 'calendarLegend',
            label: '图例配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="显示图例" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.legend?.show !== false}
                            onChange={(v) => handleChange('props.legend', { ...selectedComponent.props.legend, show: v })}
                        />
                    </Form.Item>
                    {selectedComponent.props.legend?.show !== false && (
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
                                        value={selectedComponent.props.legend?.top || 'bottom'}
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
        // 日历标签配置
        ...(selectedComponent.type === 'calendarChart' ? [{
            key: 'calendarLabels',
            label: '标签配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="显示年份" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.calendarYearLabel?.show !== false}
                            onChange={(v) => handleChange('props.calendarYearLabel', { ...selectedComponent.props.calendarYearLabel, show: v })}
                        />
                    </Form.Item>
                    {selectedComponent.props.calendarYearLabel?.show !== false && (
                        <div className="form-row">
                            <Form.Item label="年份颜色">
                                <ColorPicker
                                    value={selectedComponent.props.calendarYearLabel?.color || '#fff'}
                                    onChange={(c) => handleChange('props.calendarYearLabel', {
                                        ...selectedComponent.props.calendarYearLabel,
                                        color: c.toHexString()
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label="年份字号">
                                <InputNumber
                                    value={selectedComponent.props.calendarYearLabel?.fontSize || 14}
                                    onChange={(v) => handleChange('props.calendarYearLabel', {
                                        ...selectedComponent.props.calendarYearLabel,
                                        fontSize: v
                                    })}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </div>
                    )}
                    <Form.Item label="显示月份" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.calendarMonthLabel?.show !== false}
                            onChange={(v) => handleChange('props.calendarMonthLabel', { ...selectedComponent.props.calendarMonthLabel, show: v })}
                        />
                    </Form.Item>
                    {selectedComponent.props.calendarMonthLabel?.show !== false && (
                        <div className="form-row">
                            <Form.Item label="月份颜色">
                                <ColorPicker
                                    value={selectedComponent.props.calendarMonthLabel?.color || '#fff'}
                                    onChange={(c) => handleChange('props.calendarMonthLabel', {
                                        ...selectedComponent.props.calendarMonthLabel,
                                        color: c.toHexString()
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label="月份字号">
                                <InputNumber
                                    value={selectedComponent.props.calendarMonthLabel?.fontSize || 12}
                                    onChange={(v) => handleChange('props.calendarMonthLabel', {
                                        ...selectedComponent.props.calendarMonthLabel,
                                        fontSize: v
                                    })}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </div>
                    )}
                    <Form.Item label="显示星期" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.calendarDayLabel?.show !== false}
                            onChange={(v) => handleChange('props.calendarDayLabel', { ...selectedComponent.props.calendarDayLabel, show: v })}
                        />
                    </Form.Item>
                    {selectedComponent.props.calendarDayLabel?.show !== false && (
                        <div className="form-row">
                            <Form.Item label="星期颜色">
                                <ColorPicker
                                    value={selectedComponent.props.calendarDayLabel?.color || '#fff'}
                                    onChange={(c) => handleChange('props.calendarDayLabel', {
                                        ...selectedComponent.props.calendarDayLabel,
                                        color: c.toHexString()
                                    })}
                                />
                            </Form.Item>
                            <Form.Item label="星期字号">
                                <InputNumber
                                    value={selectedComponent.props.calendarDayLabel?.fontSize || 12}
                                    onChange={(v) => handleChange('props.calendarDayLabel', {
                                        ...selectedComponent.props.calendarDayLabel,
                                        fontSize: v
                                    })}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </div>
                    )}
                </Form>
            )
        }] : []),
        // 滚动排名列表配置
        ...(selectedComponent.type === 'scrollRankList' ? [{
            key: 'rankListConfig',
            label: '列表配置',
            children: (
                <Form layout="vertical" size="small">
                    <div className="form-row">
                        <Form.Item label="行高">
                            <InputNumber
                                value={selectedComponent.props.rankListConfig?.rowHeight || 36}
                                onChange={(v) => handleChange('props.rankListConfig', {
                                    ...selectedComponent.props.rankListConfig,
                                    rowHeight: v
                                })}
                                min={24}
                                max={60}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="字体大小">
                            <InputNumber
                                value={selectedComponent.props.rankListConfig?.fontSize || 14}
                                onChange={(v) => handleChange('props.rankListConfig', {
                                    ...selectedComponent.props.rankListConfig,
                                    fontSize: v
                                })}
                                min={10}
                                max={24}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="滚动速度(ms)">
                        <InputNumber
                            value={selectedComponent.props.rankListConfig?.scrollSpeed || 3000}
                            onChange={(v) => handleChange('props.rankListConfig', {
                                ...selectedComponent.props.rankListConfig,
                                scrollSpeed: v
                            })}
                            min={500}
                            max={10000}
                            step={500}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="文字颜色">
                            <ColorPicker
                                value={selectedComponent.props.rankListConfig?.textColor || '#fff'}
                                onChange={(c) => handleChange('props.rankListConfig', {
                                    ...selectedComponent.props.rankListConfig,
                                    textColor: c.toHexString()
                                })}
                            />
                        </Form.Item>
                        <Form.Item label="数值颜色">
                            <ColorPicker
                                value={selectedComponent.props.rankListConfig?.valueColor || '#1890ff'}
                                onChange={(c) => handleChange('props.rankListConfig', {
                                    ...selectedComponent.props.rankListConfig,
                                    valueColor: c.toHexString()
                                })}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="显示序号" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.rankListConfig?.showIndex !== false}
                            onChange={(v) => handleChange('props.rankListConfig', {
                                ...selectedComponent.props.rankListConfig,
                                showIndex: v
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.rankListConfig?.showIndex !== false && (
                        <Form.Item label="序号颜色">
                            <ColorPicker
                                value={selectedComponent.props.rankListConfig?.indexColor || '#1890ff'}
                                onChange={(c) => handleChange('props.rankListConfig', {
                                    ...selectedComponent.props.rankListConfig,
                                    indexColor: c.toHexString()
                                })}
                            />
                        </Form.Item>
                    )}
                    <Form.Item label="显示进度条" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.rankListConfig?.showBar !== false}
                            onChange={(v) => handleChange('props.rankListConfig', {
                                ...selectedComponent.props.rankListConfig,
                                showBar: v
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.rankListConfig?.showBar !== false && (
                        <>
                            <Form.Item label="进度条高度">
                                <InputNumber
                                    value={selectedComponent.props.rankListConfig?.barHeight || 12}
                                    onChange={(v) => handleChange('props.rankListConfig', {
                                        ...selectedComponent.props.rankListConfig,
                                        barHeight: v
                                    })}
                                    min={4}
                                    max={20}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <div className="form-row">
                                <Form.Item label="进度条颜色">
                                    <ColorPicker
                                        value={selectedComponent.props.rankListConfig?.barColor || '#1890ff'}
                                        onChange={(c) => handleChange('props.rankListConfig', {
                                            ...selectedComponent.props.rankListConfig,
                                            barColor: c.toHexString()
                                        })}
                                    />
                                </Form.Item>
                                <Form.Item label="进度条背景">
                                    <ColorPicker
                                        value={selectedComponent.props.rankListConfig?.barBgColor || 'rgba(255,255,255,0.1)'}
                                        onChange={(c) => handleChange('props.rankListConfig', {
                                            ...selectedComponent.props.rankListConfig,
                                            barBgColor: c.toHexString()
                                        })}
                                    />
                                </Form.Item>
                            </div>
                        </>
                    )}
                </Form>
            )
        }] : []),
        // 轮播列表配置
        ...(selectedComponent.type === 'carouselList' ? [{
            key: 'carouselListConfig',
            label: '列表配置',
            children: (
                <Form layout="vertical" size="small">
                    <div className="form-row">
                        <Form.Item label="行高">
                            <InputNumber
                                value={selectedComponent.props.carouselListConfig?.rowHeight || 36}
                                onChange={(v) => handleChange('props.carouselListConfig', {
                                    ...selectedComponent.props.carouselListConfig,
                                    rowHeight: v
                                })}
                                min={24}
                                max={60}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="字体大小">
                            <InputNumber
                                value={selectedComponent.props.carouselListConfig?.fontSize || 14}
                                onChange={(v) => handleChange('props.carouselListConfig', {
                                    ...selectedComponent.props.carouselListConfig,
                                    fontSize: v
                                })}
                                min={10}
                                max={24}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                    <div className="form-row">
                        <Form.Item label="每页行数">
                            <InputNumber
                                value={selectedComponent.props.carouselListConfig?.pageSize || 5}
                                onChange={(v) => handleChange('props.carouselListConfig', {
                                    ...selectedComponent.props.carouselListConfig,
                                    pageSize: v
                                })}
                                min={1}
                                max={20}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="滚动速度(ms)">
                            <InputNumber
                                value={selectedComponent.props.carouselListConfig?.scrollSpeed || 3000}
                                onChange={(v) => handleChange('props.carouselListConfig', {
                                    ...selectedComponent.props.carouselListConfig,
                                    scrollSpeed: v
                                })}
                                min={500}
                                max={10000}
                                step={500}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="文字颜色">
                        <ColorPicker
                            value={selectedComponent.props.carouselListConfig?.textColor || '#fff'}
                            onChange={(c) => handleChange('props.carouselListConfig', {
                                ...selectedComponent.props.carouselListConfig,
                                textColor: c.toHexString()
                            })}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="行背景色">
                            <ColorPicker
                                value={selectedComponent.props.carouselListConfig?.rowBgColor || 'rgba(255,255,255,0.02)'}
                                onChange={(c) => handleChange('props.carouselListConfig', {
                                    ...selectedComponent.props.carouselListConfig,
                                    rowBgColor: c.toHexString()
                                })}
                            />
                        </Form.Item>
                        <Form.Item label="交替行背景">
                            <ColorPicker
                                value={selectedComponent.props.carouselListConfig?.rowAltBgColor || 'rgba(255,255,255,0.05)'}
                                onChange={(c) => handleChange('props.carouselListConfig', {
                                    ...selectedComponent.props.carouselListConfig,
                                    rowAltBgColor: c.toHexString()
                                })}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="显示表头" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.carouselListConfig?.showHeader !== false}
                            onChange={(v) => handleChange('props.carouselListConfig', {
                                ...selectedComponent.props.carouselListConfig,
                                showHeader: v
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.carouselListConfig?.showHeader !== false && (
                        <>
                            <Form.Item label="表头高度">
                                <InputNumber
                                    value={selectedComponent.props.carouselListConfig?.headerHeight || 40}
                                    onChange={(v) => handleChange('props.carouselListConfig', {
                                        ...selectedComponent.props.carouselListConfig,
                                        headerHeight: v
                                    })}
                                    min={24}
                                    max={60}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <div className="form-row">
                                <Form.Item label="表头背景">
                                    <ColorPicker
                                        value={selectedComponent.props.carouselListConfig?.headerBgColor || 'rgba(24, 144, 255, 0.3)'}
                                        onChange={(c) => handleChange('props.carouselListConfig', {
                                            ...selectedComponent.props.carouselListConfig,
                                            headerBgColor: c.toHexString()
                                        })}
                                    />
                                </Form.Item>
                                <Form.Item label="表头文字">
                                    <ColorPicker
                                        value={selectedComponent.props.carouselListConfig?.headerTextColor || '#1890ff'}
                                        onChange={(c) => handleChange('props.carouselListConfig', {
                                            ...selectedComponent.props.carouselListConfig,
                                            headerTextColor: c.toHexString()
                                        })}
                                    />
                                </Form.Item>
                            </div>
                        </>
                    )}
                </Form>
            )
        }] : []),
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
            {selectedComponent.type === 'radarChart' && (
                <>
                    <Form.Item label="指示器配置">
                        <JsonEditor
                            value={selectedComponent.props.radarConfig?.indicator || []}
                            onChange={(v) => handleChange('props.radarConfig', {
                                ...selectedComponent.props.radarConfig,
                                indicator: v
                            })}
                            placeholder='[{"name":"销售","max":100}]'
                        />
                    </Form.Item>
                    <Form.Item label="系列数据">
                        <JsonEditor
                            value={selectedComponent.props.seriesData || []}
                            onChange={(v) => handleChange('props.seriesData', v)}
                            placeholder='[{"name":"预算","data":[80,50,90,40,60]}]'
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
            {selectedComponent.type === 'calendarChart' && (
                <Form.Item label="热力数据">
                    <JsonEditor
                        value={selectedComponent.props.calendarData || []}
                        onChange={(v) => handleChange('props.calendarData', v)}
                        placeholder='[["2025-01-01", 50], ["2025-01-02", 80]]'
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'scrollRankList' && (
                <Form.Item label="排名数据">
                    <JsonEditor
                        value={selectedComponent.props.rankListData || []}
                        onChange={(v) => handleChange('props.rankListData', v)}
                        placeholder='[{"name":"北京","value":100}]'
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'carouselList' && (
                <>
                    <Form.Item label="列配置">
                        <JsonEditor
                            value={selectedComponent.props.carouselListConfig?.columns || []}
                            onChange={(v) => handleChange('props.carouselListConfig', {
                                ...selectedComponent.props.carouselListConfig,
                                columns: v
                            })}
                            placeholder='[{"title":"名称","key":"name","width":80}]'
                        />
                    </Form.Item>
                    <Form.Item label="列表数据">
                        <JsonEditor
                            value={selectedComponent.props.carouselListData || []}
                            onChange={(v) => handleChange('props.carouselListData', v)}
                            placeholder='[{"name":"张三","dept":"技术部"}]'
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
