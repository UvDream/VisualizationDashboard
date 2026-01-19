import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Select, Collapse, Tabs, ColorPicker, Switch, Radio } from 'antd'
import { useEditor } from '../../context/EditorContext'
import { getMapRegionOptions } from '../../utils/mapData'
import { dataRefreshManager } from '../../utils/dataSource'
import JsonEditor from './JsonEditor'
import ImageListEditor from './ImageListEditor'
import DataSourceEditor from './DataSourceEditor'
import './index.less'

export default function PropertyPanel() {
    const { getSelectedComponent, updateComponent } = useEditor()
    const selectedComponent = getSelectedComponent()
    const [selectedSeriesIndex, setSelectedSeriesIndex] = useState(0)

    // 处理数据源变化和自动刷新
    useEffect(() => {
        if (!selectedComponent || !selectedComponent.props.dataSource) return

        const handleDataRefresh = async (data: any) => {
            // 根据图表类型更新对应的数据
            const updates: any = {}
            
            if (['singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart', 'horizontalBarChart', 'scatterChart'].includes(selectedComponent.type)) {
                if (data.xAxisData) updates.xAxisData = data.xAxisData
                if (data.seriesData) updates.seriesData = data.seriesData
            } else if (['pieChart', 'halfPieChart'].includes(selectedComponent.type)) {
                if (data.pieData || Array.isArray(data)) {
                    updates.pieData = data.pieData || data
                }
            } else if (selectedComponent.type === 'funnelChart') {
                if (data.funnelData || Array.isArray(data)) {
                    updates.funnelData = data.funnelData || data
                }
            } else if (selectedComponent.type === 'mapChart') {
                if (data.mapData || Array.isArray(data)) {
                    updates.mapData = data.mapData || data
                }
            } else if (selectedComponent.type === 'treeChart') {
                if (data.treeData || (data.name && data.children)) {
                    updates.treeData = data.treeData || data
                }
            } else if (selectedComponent.type === 'sankeyChart') {
                if (data.sankeyData || (data.nodes && data.links)) {
                    updates.sankeyData = data.sankeyData || data
                }
            }

            if (Object.keys(updates).length > 0) {
                updateComponent(selectedComponent.id, {
                    props: {
                        ...selectedComponent.props,
                        ...updates
                    }
                })
            }
        }

        // 设置自动刷新
        dataRefreshManager.setAutoRefresh(
            selectedComponent.id,
            selectedComponent.props.dataSource,
            handleDataRefresh
        )

        return () => {
            // 清理定时器
            dataRefreshManager.clearAutoRefresh(selectedComponent.id)
        }
    }, [selectedComponent?.id, selectedComponent?.props.dataSource])

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
        ...(['singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart', 'horizontalBarChart', 'scatterChart'].includes(selectedComponent.type) ? [
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
        ...(['singleLineChart', 'doubleLineChart', 'scatterChart'].includes(selectedComponent.type) ? [{
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
                                                value={selectedComponent.props.seriesData[selectedSeriesIndex].symbolConfig?.size || (['singleLineChart', 'doubleLineChart'].includes(selectedComponent.type) ? 4 : 10)}
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
                                                value={selectedComponent.props.seriesData[selectedSeriesIndex].symbolConfig?.borderWidth || (['singleLineChart', 'doubleLineChart'].includes(selectedComponent.type) ? 1 : 0)}
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
        ...(['pieChart', 'halfPieChart'].includes(selectedComponent.type) ? [{
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
        // 词云配置
        ...(selectedComponent.type === 'wordCloudChart' ? [{
            key: 'wordCloudConfig',
            label: '词云配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="形状">
                        <Select
                            value={selectedComponent.props.wordCloudConfig?.shape || 'circle'}
                            onChange={(v) => handleChange('props.wordCloudConfig', {
                                ...selectedComponent.props.wordCloudConfig,
                                shape: v
                            })}
                            options={[
                                { value: 'circle', label: '圆形' },
                                { value: 'rect', label: '矩形' },
                                { value: 'diamond', label: '菱形' },
                                { value: 'triangle', label: '三角形' }
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="颜色方案">
                        <Select
                            value={selectedComponent.props.wordCloudConfig?.colorScheme || 'default'}
                            onChange={(v) => handleChange('props.wordCloudConfig', {
                                ...selectedComponent.props.wordCloudConfig,
                                colorScheme: v
                            })}
                            options={[
                                { value: 'default', label: '默认' },
                                { value: 'blue', label: '蓝色系' },
                                { value: 'green', label: '绿色系' },
                                { value: 'warm', label: '暖色系' },
                                { value: 'cool', label: '冷色系' },
                                { value: 'rainbow', label: '彩虹' }
                            ]}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="最小字号">
                            <InputNumber
                                value={selectedComponent.props.wordCloudConfig?.minFontSize || 12}
                                onChange={(v) => handleChange('props.wordCloudConfig', {
                                    ...selectedComponent.props.wordCloudConfig,
                                    minFontSize: v
                                })}
                                min={8}
                                max={24}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="最大字号">
                            <InputNumber
                                value={selectedComponent.props.wordCloudConfig?.maxFontSize || 48}
                                onChange={(v) => handleChange('props.wordCloudConfig', {
                                    ...selectedComponent.props.wordCloudConfig,
                                    maxFontSize: v
                                })}
                                min={24}
                                max={100}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="字体">
                        <Select
                            value={selectedComponent.props.wordCloudConfig?.fontFamily || 'Arial, sans-serif'}
                            onChange={(v) => handleChange('props.wordCloudConfig', {
                                ...selectedComponent.props.wordCloudConfig,
                                fontFamily: v
                            })}
                            options={[
                                { value: 'Arial, sans-serif', label: 'Arial' },
                                { value: 'Microsoft YaHei, sans-serif', label: '微软雅黑' },
                                { value: 'SimHei, sans-serif', label: '黑体' },
                                { value: 'KaiTi, serif', label: '楷体' },
                                { value: 'Courier New, monospace', label: 'Courier' }
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label="字体粗细">
                        <Radio.Group
                            value={selectedComponent.props.wordCloudConfig?.fontWeight || 'bold'}
                            onChange={(e) => handleChange('props.wordCloudConfig', {
                                ...selectedComponent.props.wordCloudConfig,
                                fontWeight: e.target.value
                            })}
                            optionType="button"
                            size="small"
                        >
                            <Radio value="normal">正常</Radio>
                            <Radio value="bold">加粗</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="文字旋转" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.wordCloudConfig?.rotation || false}
                            onChange={(v) => handleChange('props.wordCloudConfig', {
                                ...selectedComponent.props.wordCloudConfig,
                                rotation: v
                            })}
                        />
                    </Form.Item>
                    <Form.Item label="网格大小">
                        <InputNumber
                            value={selectedComponent.props.wordCloudConfig?.gridSize || 8}
                            onChange={(v) => handleChange('props.wordCloudConfig', {
                                ...selectedComponent.props.wordCloudConfig,
                                gridSize: v
                            })}
                            min={4}
                            max={20}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            )
        }] : []),
        // 图例配置 - 仅对图表有效
        ...(['singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart', 'horizontalBarChart', 'pieChart', 'halfPieChart', 'funnelChart', 'radarChart', 'scatterChart'].includes(selectedComponent.type) ? [{
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
        // 树形图配置
        ...(selectedComponent.type === 'treeChart' ? [{
            key: 'treeLayout',
            label: '布局配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="布局方向">
                        <Select
                            value={selectedComponent.props.treeConfig?.orient || 'LR'}
                            onChange={(v) => handleChange('props.treeConfig', {
                                ...selectedComponent.props.treeConfig,
                                orient: v
                            })}
                            options={[
                                { value: 'LR', label: '左右 (LR)' },
                                { value: 'TB', label: '上下 (TB)' },
                                { value: 'RL', label: '右左 (RL)' },
                                { value: 'BT', label: '下上 (BT)' },
                            ]}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="节点大小">
                            <InputNumber
                                value={selectedComponent.props.treeConfig?.symbolSize || 7}
                                onChange={(v) => handleChange('props.treeConfig', {
                                    ...selectedComponent.props.treeConfig,
                                    symbolSize: v
                                })}
                                min={3}
                                max={20}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="初始展开层级">
                            <InputNumber
                                value={selectedComponent.props.treeConfig?.initialTreeDepth ?? -1}
                                onChange={(v) => handleChange('props.treeConfig', {
                                    ...selectedComponent.props.treeConfig,
                                    initialTreeDepth: v
                                })}
                                min={-1}
                                max={10}
                                style={{ width: '100%' }}
                                placeholder="-1表示全部展开"
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="支持展开收起" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.treeConfig?.expandAndCollapse !== false}
                            onChange={(v) => handleChange('props.treeConfig', {
                                ...selectedComponent.props.treeConfig,
                                expandAndCollapse: v
                            })}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="动画时长(ms)">
                            <InputNumber
                                value={selectedComponent.props.treeConfig?.animationDuration || 550}
                                onChange={(v) => handleChange('props.treeConfig', {
                                    ...selectedComponent.props.treeConfig,
                                    animationDuration: v
                                })}
                                min={0}
                                max={2000}
                                step={50}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="更新动画时长(ms)">
                            <InputNumber
                                value={selectedComponent.props.treeConfig?.animationDurationUpdate || 750}
                                onChange={(v) => handleChange('props.treeConfig', {
                                    ...selectedComponent.props.treeConfig,
                                    animationDurationUpdate: v
                                })}
                                min={0}
                                max={2000}
                                step={50}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                </Form>
            )
        },
        {
            key: 'treeStyle',
            label: '样式配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="节点颜色">
                        <ColorPicker
                            value={selectedComponent.props.treeConfig?.itemStyle?.color || '#1890ff'}
                            onChange={(color) => handleChange('props.treeConfig', {
                                ...selectedComponent.props.treeConfig,
                                itemStyle: {
                                    ...selectedComponent.props.treeConfig?.itemStyle,
                                    color: color.toHexString()
                                }
                            })}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="节点边框颜色">
                            <ColorPicker
                                value={selectedComponent.props.treeConfig?.itemStyle?.borderColor || '#fff'}
                                onChange={(color) => handleChange('props.treeConfig', {
                                    ...selectedComponent.props.treeConfig,
                                    itemStyle: {
                                        ...selectedComponent.props.treeConfig?.itemStyle,
                                        borderColor: color.toHexString()
                                    }
                                })}
                            />
                        </Form.Item>
                        <Form.Item label="节点边框宽度">
                            <InputNumber
                                value={selectedComponent.props.treeConfig?.itemStyle?.borderWidth || 1}
                                onChange={(v) => handleChange('props.treeConfig', {
                                    ...selectedComponent.props.treeConfig,
                                    itemStyle: {
                                        ...selectedComponent.props.treeConfig?.itemStyle,
                                        borderWidth: v
                                    }
                                })}
                                min={0}
                                max={5}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="连线颜色">
                        <ColorPicker
                            value={selectedComponent.props.treeConfig?.lineStyle?.color || '#ccc'}
                            onChange={(color) => handleChange('props.treeConfig', {
                                ...selectedComponent.props.treeConfig,
                                lineStyle: {
                                    ...selectedComponent.props.treeConfig?.lineStyle,
                                    color: color.toHexString()
                                }
                            })}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="连线宽度">
                            <InputNumber
                                value={selectedComponent.props.treeConfig?.lineStyle?.width || 1}
                                onChange={(v) => handleChange('props.treeConfig', {
                                    ...selectedComponent.props.treeConfig,
                                    lineStyle: {
                                        ...selectedComponent.props.treeConfig?.lineStyle,
                                        width: v
                                    }
                                })}
                                min={1}
                                max={5}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="连线弯曲度">
                            <InputNumber
                                value={selectedComponent.props.treeConfig?.lineStyle?.curveness || 0.5}
                                onChange={(v) => handleChange('props.treeConfig', {
                                    ...selectedComponent.props.treeConfig,
                                    lineStyle: {
                                        ...selectedComponent.props.treeConfig?.lineStyle,
                                        curveness: v
                                    }
                                })}
                                min={0}
                                max={1}
                                step={0.1}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                </Form>
            )
        },
        {
            key: 'treeLabel',
            label: '标签配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="显示标签" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.treeConfig?.label?.show !== false}
                            onChange={(v) => handleChange('props.treeConfig', {
                                ...selectedComponent.props.treeConfig,
                                label: {
                                    ...selectedComponent.props.treeConfig?.label,
                                    show: v
                                }
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.treeConfig?.label?.show !== false && (
                        <>
                            <Form.Item label="标签位置">
                                <Select
                                    value={selectedComponent.props.treeConfig?.label?.position || 'left'}
                                    onChange={(v) => handleChange('props.treeConfig', {
                                        ...selectedComponent.props.treeConfig,
                                        label: {
                                            ...selectedComponent.props.treeConfig?.label,
                                            position: v
                                        }
                                    })}
                                    options={[
                                        { value: 'left', label: '左侧' },
                                        { value: 'right', label: '右侧' },
                                        { value: 'top', label: '上方' },
                                        { value: 'bottom', label: '下方' },
                                        { value: 'inside', label: '内部' },
                                        { value: 'insideLeft', label: '内部左' },
                                        { value: 'insideRight', label: '内部右' },
                                        { value: 'insideTop', label: '内部上' },
                                        { value: 'insideBottom', label: '内部下' },
                                    ]}
                                />
                            </Form.Item>
                            <div className="form-row">
                                <Form.Item label="垂直对齐">
                                    <Select
                                        value={selectedComponent.props.treeConfig?.label?.verticalAlign || 'middle'}
                                        onChange={(v) => handleChange('props.treeConfig', {
                                            ...selectedComponent.props.treeConfig,
                                            label: {
                                                ...selectedComponent.props.treeConfig?.label,
                                                verticalAlign: v
                                            }
                                        })}
                                        options={[
                                            { value: 'top', label: '顶部' },
                                            { value: 'middle', label: '中间' },
                                            { value: 'bottom', label: '底部' },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item label="水平对齐">
                                    <Select
                                        value={selectedComponent.props.treeConfig?.label?.align || 'right'}
                                        onChange={(v) => handleChange('props.treeConfig', {
                                            ...selectedComponent.props.treeConfig,
                                            label: {
                                                ...selectedComponent.props.treeConfig?.label,
                                                align: v
                                            }
                                        })}
                                        options={[
                                            { value: 'left', label: '左对齐' },
                                            { value: 'center', label: '居中' },
                                            { value: 'right', label: '右对齐' },
                                        ]}
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item label="字体颜色">
                                <ColorPicker
                                    value={selectedComponent.props.treeConfig?.label?.color || '#fff'}
                                    onChange={(color) => handleChange('props.treeConfig', {
                                        ...selectedComponent.props.treeConfig,
                                        label: {
                                            ...selectedComponent.props.treeConfig?.label,
                                            color: color.toHexString()
                                        }
                                    })}
                                />
                            </Form.Item>
                            <div className="form-row">
                                <Form.Item label="字体大小">
                                    <InputNumber
                                        value={selectedComponent.props.treeConfig?.label?.fontSize || 12}
                                        onChange={(v) => handleChange('props.treeConfig', {
                                            ...selectedComponent.props.treeConfig,
                                            label: {
                                                ...selectedComponent.props.treeConfig?.label,
                                                fontSize: v
                                            }
                                        })}
                                        min={8}
                                        max={24}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                                <Form.Item label="字体粗细">
                                    <Select
                                        value={selectedComponent.props.treeConfig?.label?.fontWeight || 'normal'}
                                        onChange={(v) => handleChange('props.treeConfig', {
                                            ...selectedComponent.props.treeConfig,
                                            label: {
                                                ...selectedComponent.props.treeConfig?.label,
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
                            <Form.Item label="背景颜色">
                                <ColorPicker
                                    value={selectedComponent.props.treeConfig?.label?.backgroundColor || 'transparent'}
                                    onChange={(color) => handleChange('props.treeConfig', {
                                        ...selectedComponent.props.treeConfig,
                                        label: {
                                            ...selectedComponent.props.treeConfig?.label,
                                            backgroundColor: color.toHexString()
                                        }
                                    })}
                                />
                            </Form.Item>
                            <div className="form-row">
                                <Form.Item label="边框颜色">
                                    <ColorPicker
                                        value={selectedComponent.props.treeConfig?.label?.borderColor || 'transparent'}
                                        onChange={(color) => handleChange('props.treeConfig', {
                                            ...selectedComponent.props.treeConfig,
                                            label: {
                                                ...selectedComponent.props.treeConfig?.label,
                                                borderColor: color.toHexString()
                                            }
                                        })}
                                    />
                                </Form.Item>
                                <Form.Item label="边框宽度">
                                    <InputNumber
                                        value={selectedComponent.props.treeConfig?.label?.borderWidth || 0}
                                        onChange={(v) => handleChange('props.treeConfig', {
                                            ...selectedComponent.props.treeConfig,
                                            label: {
                                                ...selectedComponent.props.treeConfig?.label,
                                                borderWidth: v
                                            }
                                        })}
                                        min={0}
                                        max={5}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item label="边框圆角">
                                <InputNumber
                                    value={selectedComponent.props.treeConfig?.label?.borderRadius || 0}
                                    onChange={(v) => handleChange('props.treeConfig', {
                                        ...selectedComponent.props.treeConfig,
                                        label: {
                                            ...selectedComponent.props.treeConfig?.label,
                                            borderRadius: v
                                        }
                                    })}
                                    min={0}
                                    max={20}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </>
                    )}
                </Form>
            )
        },
        {
            key: 'treeLeaves',
            label: '叶子节点配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="显示叶子标签" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.treeConfig?.leaves?.label?.show !== false}
                            onChange={(v) => handleChange('props.treeConfig', {
                                ...selectedComponent.props.treeConfig,
                                leaves: {
                                    ...selectedComponent.props.treeConfig?.leaves,
                                    label: {
                                        ...selectedComponent.props.treeConfig?.leaves?.label,
                                        show: v
                                    }
                                }
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.treeConfig?.leaves?.label?.show !== false && (
                        <>
                            <Form.Item label="叶子标签位置">
                                <Select
                                    value={selectedComponent.props.treeConfig?.leaves?.label?.position || 'right'}
                                    onChange={(v) => handleChange('props.treeConfig', {
                                        ...selectedComponent.props.treeConfig,
                                        leaves: {
                                            ...selectedComponent.props.treeConfig?.leaves,
                                            label: {
                                                ...selectedComponent.props.treeConfig?.leaves?.label,
                                                position: v
                                            }
                                        }
                                    })}
                                    options={[
                                        { value: 'left', label: '左侧' },
                                        { value: 'right', label: '右侧' },
                                        { value: 'top', label: '上方' },
                                        { value: 'bottom', label: '下方' },
                                        { value: 'inside', label: '内部' },
                                    ]}
                                />
                            </Form.Item>
                            <div className="form-row">
                                <Form.Item label="垂直对齐">
                                    <Select
                                        value={selectedComponent.props.treeConfig?.leaves?.label?.verticalAlign || 'middle'}
                                        onChange={(v) => handleChange('props.treeConfig', {
                                            ...selectedComponent.props.treeConfig,
                                            leaves: {
                                                ...selectedComponent.props.treeConfig?.leaves,
                                                label: {
                                                    ...selectedComponent.props.treeConfig?.leaves?.label,
                                                    verticalAlign: v
                                                }
                                            }
                                        })}
                                        options={[
                                            { value: 'top', label: '顶部' },
                                            { value: 'middle', label: '中间' },
                                            { value: 'bottom', label: '底部' },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item label="水平对齐">
                                    <Select
                                        value={selectedComponent.props.treeConfig?.leaves?.label?.align || 'left'}
                                        onChange={(v) => handleChange('props.treeConfig', {
                                            ...selectedComponent.props.treeConfig,
                                            leaves: {
                                                ...selectedComponent.props.treeConfig?.leaves,
                                                label: {
                                                    ...selectedComponent.props.treeConfig?.leaves?.label,
                                                    align: v
                                                }
                                            }
                                        })}
                                        options={[
                                            { value: 'left', label: '左对齐' },
                                            { value: 'center', label: '居中' },
                                            { value: 'right', label: '右对齐' },
                                        ]}
                                    />
                                </Form.Item>
                            </div>
                            <Form.Item label="叶子字体颜色">
                                <ColorPicker
                                    value={selectedComponent.props.treeConfig?.leaves?.label?.color || '#fff'}
                                    onChange={(color) => handleChange('props.treeConfig', {
                                        ...selectedComponent.props.treeConfig,
                                        leaves: {
                                            ...selectedComponent.props.treeConfig?.leaves,
                                            label: {
                                                ...selectedComponent.props.treeConfig?.leaves?.label,
                                                color: color.toHexString()
                                            }
                                        }
                                    })}
                                />
                            </Form.Item>
                            <div className="form-row">
                                <Form.Item label="叶子字体大小">
                                    <InputNumber
                                        value={selectedComponent.props.treeConfig?.leaves?.label?.fontSize || 12}
                                        onChange={(v) => handleChange('props.treeConfig', {
                                            ...selectedComponent.props.treeConfig,
                                            leaves: {
                                                ...selectedComponent.props.treeConfig?.leaves,
                                                label: {
                                                    ...selectedComponent.props.treeConfig?.leaves?.label,
                                                    fontSize: v
                                                }
                                            }
                                        })}
                                        min={8}
                                        max={24}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                                <Form.Item label="叶子字体粗细">
                                    <Select
                                        value={selectedComponent.props.treeConfig?.leaves?.label?.fontWeight || 'normal'}
                                        onChange={(v) => handleChange('props.treeConfig', {
                                            ...selectedComponent.props.treeConfig,
                                            leaves: {
                                                ...selectedComponent.props.treeConfig?.leaves,
                                                label: {
                                                    ...selectedComponent.props.treeConfig?.leaves?.label,
                                                    fontWeight: v
                                                }
                                            }
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
        },
        {
            key: 'treeEmphasis',
            label: '高亮配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="高亮节点颜色">
                        <ColorPicker
                            value={selectedComponent.props.treeConfig?.emphasis?.itemStyle?.color || '#ff7875'}
                            onChange={(color) => handleChange('props.treeConfig', {
                                ...selectedComponent.props.treeConfig,
                                emphasis: {
                                    ...selectedComponent.props.treeConfig?.emphasis,
                                    itemStyle: {
                                        ...selectedComponent.props.treeConfig?.emphasis?.itemStyle,
                                        color: color.toHexString()
                                    }
                                }
                            })}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="高亮边框颜色">
                            <ColorPicker
                                value={selectedComponent.props.treeConfig?.emphasis?.itemStyle?.borderColor || '#fff'}
                                onChange={(color) => handleChange('props.treeConfig', {
                                    ...selectedComponent.props.treeConfig,
                                    emphasis: {
                                        ...selectedComponent.props.treeConfig?.emphasis,
                                        itemStyle: {
                                            ...selectedComponent.props.treeConfig?.emphasis?.itemStyle,
                                            borderColor: color.toHexString()
                                        }
                                    }
                                })}
                            />
                        </Form.Item>
                        <Form.Item label="高亮边框宽度">
                            <InputNumber
                                value={selectedComponent.props.treeConfig?.emphasis?.itemStyle?.borderWidth || 2}
                                onChange={(v) => handleChange('props.treeConfig', {
                                    ...selectedComponent.props.treeConfig,
                                    emphasis: {
                                        ...selectedComponent.props.treeConfig?.emphasis,
                                        itemStyle: {
                                            ...selectedComponent.props.treeConfig?.emphasis?.itemStyle,
                                            borderWidth: v
                                        }
                                    }
                                })}
                                min={0}
                                max={5}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="高亮连线颜色">
                        <ColorPicker
                            value={selectedComponent.props.treeConfig?.emphasis?.lineStyle?.color || '#ff7875'}
                            onChange={(color) => handleChange('props.treeConfig', {
                                ...selectedComponent.props.treeConfig,
                                emphasis: {
                                    ...selectedComponent.props.treeConfig?.emphasis,
                                    lineStyle: {
                                        ...selectedComponent.props.treeConfig?.emphasis?.lineStyle,
                                        color: color.toHexString()
                                    }
                                }
                            })}
                        />
                    </Form.Item>
                    <Form.Item label="高亮连线宽度">
                        <InputNumber
                            value={selectedComponent.props.treeConfig?.emphasis?.lineStyle?.width || 2}
                            onChange={(v) => handleChange('props.treeConfig', {
                                ...selectedComponent.props.treeConfig,
                                emphasis: {
                                    ...selectedComponent.props.treeConfig?.emphasis,
                                    lineStyle: {
                                        ...selectedComponent.props.treeConfig?.emphasis?.lineStyle,
                                        width: v
                                    }
                                }
                            })}
                            min={1}
                            max={5}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            )
        }] : []),
        // 桑基图配置
        ...(selectedComponent.type === 'sankeyChart' ? [{
            key: 'sankeyLayout',
            label: '布局配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="布局方向">
                        <Select
                            value={selectedComponent.props.sankeyConfig?.orient || 'horizontal'}
                            onChange={(v) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                orient: v
                            })}
                            options={[
                                { value: 'horizontal', label: '水平' },
                                { value: 'vertical', label: '垂直' },
                            ]}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="节点宽度">
                            <InputNumber
                                value={selectedComponent.props.sankeyConfig?.nodeWidth || 20}
                                onChange={(v) => handleChange('props.sankeyConfig', {
                                    ...selectedComponent.props.sankeyConfig,
                                    nodeWidth: v
                                })}
                                min={10}
                                max={50}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="节点间距">
                            <InputNumber
                                value={selectedComponent.props.sankeyConfig?.nodeGap || 8}
                                onChange={(v) => handleChange('props.sankeyConfig', {
                                    ...selectedComponent.props.sankeyConfig,
                                    nodeGap: v
                                })}
                                min={4}
                                max={30}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="节点对齐">
                        <Select
                            value={selectedComponent.props.sankeyConfig?.nodeAlign || 'justify'}
                            onChange={(v) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                nodeAlign: v
                            })}
                            options={[
                                { value: 'justify', label: '两端对齐' },
                                { value: 'left', label: '左对齐' },
                                { value: 'right', label: '右对齐' },
                                { value: 'center', label: '居中' },
                            ]}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="布局迭代次数">
                            <InputNumber
                                value={selectedComponent.props.sankeyConfig?.layoutIterations || 32}
                                onChange={(v) => handleChange('props.sankeyConfig', {
                                    ...selectedComponent.props.sankeyConfig,
                                    layoutIterations: v
                                })}
                                min={1}
                                max={100}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="可拖拽" style={{ marginBottom: 8 }}>
                            <Switch
                                checked={selectedComponent.props.sankeyConfig?.draggable !== false}
                                onChange={(v) => handleChange('props.sankeyConfig', {
                                    ...selectedComponent.props.sankeyConfig,
                                    draggable: v
                                })}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="高亮相邻节点">
                        <Select
                            value={selectedComponent.props.sankeyConfig?.focusNodeAdjacency || 'allEdges'}
                            onChange={(v) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                focusNodeAdjacency: v
                            })}
                            options={[
                                { value: false, label: '不高亮' },
                                { value: 'inEdges', label: '入边' },
                                { value: 'outEdges', label: '出边' },
                                { value: 'allEdges', label: '所有边' },
                            ]}
                        />
                    </Form.Item>
                </Form>
            )
        },
        {
            key: 'sankeyStyle',
            label: '样式配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="节点边框颜色">
                        <ColorPicker
                            value={selectedComponent.props.sankeyConfig?.itemStyle?.borderColor || '#fff'}
                            onChange={(color) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                itemStyle: {
                                    ...selectedComponent.props.sankeyConfig?.itemStyle,
                                    borderColor: color.toHexString()
                                }
                            })}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="节点边框宽度">
                            <InputNumber
                                value={selectedComponent.props.sankeyConfig?.itemStyle?.borderWidth || 1}
                                onChange={(v) => handleChange('props.sankeyConfig', {
                                    ...selectedComponent.props.sankeyConfig,
                                    itemStyle: {
                                        ...selectedComponent.props.sankeyConfig?.itemStyle,
                                        borderWidth: v
                                    }
                                })}
                                min={0}
                                max={5}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="节点圆角">
                            <InputNumber
                                value={selectedComponent.props.sankeyConfig?.itemStyle?.borderRadius || 0}
                                onChange={(v) => handleChange('props.sankeyConfig', {
                                    ...selectedComponent.props.sankeyConfig,
                                    itemStyle: {
                                        ...selectedComponent.props.sankeyConfig?.itemStyle,
                                        borderRadius: v
                                    }
                                })}
                                min={0}
                                max={20}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="节点透明度">
                        <InputNumber
                            value={selectedComponent.props.sankeyConfig?.itemStyle?.opacity || 0.7}
                            onChange={(v) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                itemStyle: {
                                    ...selectedComponent.props.sankeyConfig?.itemStyle,
                                    opacity: v
                                }
                            })}
                            min={0}
                            max={1}
                            step={0.1}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <div className="form-row">
                        <Form.Item label="连线透明度">
                            <InputNumber
                                value={selectedComponent.props.sankeyConfig?.lineStyle?.opacity || 0.2}
                                onChange={(v) => handleChange('props.sankeyConfig', {
                                    ...selectedComponent.props.sankeyConfig,
                                    lineStyle: {
                                        ...selectedComponent.props.sankeyConfig?.lineStyle,
                                        opacity: v
                                    }
                                })}
                                min={0}
                                max={1}
                                step={0.1}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="连线弯曲度">
                            <InputNumber
                                value={selectedComponent.props.sankeyConfig?.lineStyle?.curveness || 0.5}
                                onChange={(v) => handleChange('props.sankeyConfig', {
                                    ...selectedComponent.props.sankeyConfig,
                                    lineStyle: {
                                        ...selectedComponent.props.sankeyConfig?.lineStyle,
                                        curveness: v
                                    }
                                })}
                                min={0}
                                max={1}
                                step={0.1}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </div>
                </Form>
            )
        },
        {
            key: 'sankeyLabel',
            label: '标签配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="显示标签" style={{ marginBottom: 8 }}>
                        <Switch
                            checked={selectedComponent.props.sankeyConfig?.label?.show !== false}
                            onChange={(v) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                label: {
                                    ...selectedComponent.props.sankeyConfig?.label,
                                    show: v
                                }
                            })}
                        />
                    </Form.Item>
                    {selectedComponent.props.sankeyConfig?.label?.show !== false && (
                        <>
                            <Form.Item label="标签位置">
                                <Select
                                    value={selectedComponent.props.sankeyConfig?.label?.position || 'right'}
                                    onChange={(v) => handleChange('props.sankeyConfig', {
                                        ...selectedComponent.props.sankeyConfig,
                                        label: {
                                            ...selectedComponent.props.sankeyConfig?.label,
                                            position: v
                                        }
                                    })}
                                    options={[
                                        { value: 'inside', label: '内部' },
                                        { value: 'outside', label: '外部' },
                                        { value: 'left', label: '左侧' },
                                        { value: 'right', label: '右侧' },
                                        { value: 'top', label: '上方' },
                                        { value: 'bottom', label: '下方' },
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item label="字体颜色">
                                <ColorPicker
                                    value={selectedComponent.props.sankeyConfig?.label?.color || '#fff'}
                                    onChange={(color) => handleChange('props.sankeyConfig', {
                                        ...selectedComponent.props.sankeyConfig,
                                        label: {
                                            ...selectedComponent.props.sankeyConfig?.label,
                                            color: color.toHexString()
                                        }
                                    })}
                                />
                            </Form.Item>
                            <div className="form-row">
                                <Form.Item label="字体大小">
                                    <InputNumber
                                        value={selectedComponent.props.sankeyConfig?.label?.fontSize || 12}
                                        onChange={(v) => handleChange('props.sankeyConfig', {
                                            ...selectedComponent.props.sankeyConfig,
                                            label: {
                                                ...selectedComponent.props.sankeyConfig?.label,
                                                fontSize: v
                                            }
                                        })}
                                        min={8}
                                        max={24}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Item>
                                <Form.Item label="字体粗细">
                                    <Select
                                        value={selectedComponent.props.sankeyConfig?.label?.fontWeight || 'normal'}
                                        onChange={(v) => handleChange('props.sankeyConfig', {
                                            ...selectedComponent.props.sankeyConfig,
                                            label: {
                                                ...selectedComponent.props.sankeyConfig?.label,
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
                            <Form.Item label="格式化字符串">
                                <Input
                                    value={selectedComponent.props.sankeyConfig?.label?.formatter || '{b}'}
                                    onChange={(e) => handleChange('props.sankeyConfig', {
                                        ...selectedComponent.props.sankeyConfig,
                                        label: {
                                            ...selectedComponent.props.sankeyConfig?.label,
                                            formatter: e.target.value
                                        }
                                    })}
                                    placeholder="{b}: 节点名称, {c}: 节点值"
                                />
                            </Form.Item>
                        </>
                    )}
                </Form>
            )
        },
        {
            key: 'sankeyEmphasis',
            label: '高亮配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="高亮节点边框颜色">
                        <ColorPicker
                            value={selectedComponent.props.sankeyConfig?.emphasis?.itemStyle?.borderColor || '#fff'}
                            onChange={(color) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                emphasis: {
                                    ...selectedComponent.props.sankeyConfig?.emphasis,
                                    itemStyle: {
                                        ...selectedComponent.props.sankeyConfig?.emphasis?.itemStyle,
                                        borderColor: color.toHexString()
                                    }
                                }
                            })}
                        />
                    </Form.Item>
                    <Form.Item label="高亮边框宽度">
                        <InputNumber
                            value={selectedComponent.props.sankeyConfig?.emphasis?.itemStyle?.borderWidth || 2}
                            onChange={(v) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                emphasis: {
                                    ...selectedComponent.props.sankeyConfig?.emphasis,
                                    itemStyle: {
                                        ...selectedComponent.props.sankeyConfig?.emphasis?.itemStyle,
                                        borderWidth: v
                                    }
                                }
                            })}
                            min={0}
                            max={5}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="高亮连线透明度">
                        <InputNumber
                            value={selectedComponent.props.sankeyConfig?.emphasis?.lineStyle?.opacity || 0.6}
                            onChange={(v) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                emphasis: {
                                    ...selectedComponent.props.sankeyConfig?.emphasis,
                                    lineStyle: {
                                        ...selectedComponent.props.sankeyConfig?.emphasis?.lineStyle,
                                        opacity: v
                                    }
                                }
                            })}
                            min={0}
                            max={1}
                            step={0.1}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="高亮标签颜色">
                        <ColorPicker
                            value={selectedComponent.props.sankeyConfig?.emphasis?.label?.color || '#fff'}
                            onChange={(color) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                emphasis: {
                                    ...selectedComponent.props.sankeyConfig?.emphasis,
                                    label: {
                                        ...selectedComponent.props.sankeyConfig?.emphasis?.label,
                                        color: color.toHexString()
                                    }
                                }
                            })}
                        />
                    </Form.Item>
                    <Form.Item label="高亮标签大小">
                        <InputNumber
                            value={selectedComponent.props.sankeyConfig?.emphasis?.label?.fontSize || 12}
                            onChange={(v) => handleChange('props.sankeyConfig', {
                                ...selectedComponent.props.sankeyConfig,
                                emphasis: {
                                    ...selectedComponent.props.sankeyConfig?.emphasis,
                                    label: {
                                        ...selectedComponent.props.sankeyConfig?.emphasis?.label,
                                        fontSize: v
                                    }
                                }
                            })}
                            min={8}
                            max={24}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            )
        }] : []),
        // 布局组件配置
        ...(['layoutTwoColumn', 'layoutThreeColumn', 'layoutHeader', 'layoutSidebar'].includes(selectedComponent.type) ? [{
            key: 'layoutConfig',
            label: '布局配置',
            children: (
                <Form layout="vertical" size="small">
                    <Form.Item label="布局方向">
                        <Radio.Group
                            value={selectedComponent.props.layoutConfig?.direction || (
                                ['layoutTwoRow', 'layoutHeader'].includes(selectedComponent.type) ? 'vertical' : 'horizontal'
                            )}
                            onChange={(e) => handleChange('props.layoutConfig', {
                                ...selectedComponent.props.layoutConfig,
                                direction: e.target.value
                            })}
                        >
                            <Radio.Button value="horizontal">左右</Radio.Button>
                            <Radio.Button value="vertical">上下</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="栏间距">
                        <InputNumber
                            value={selectedComponent.props.layoutConfig?.gap ?? 8}
                            onChange={(v) => handleChange('props.layoutConfig', {
                                ...selectedComponent.props.layoutConfig,
                                gap: v ?? 8
                            })}
                            min={0}
                            max={50}
                            style={{ width: '100%' }}
                            addonAfter="px"
                        />
                    </Form.Item>
                    {/* 各栏配置 */}
                    {(() => {
                        const cellCount = ['layoutThreeColumn'].includes(selectedComponent.type) ? 3 : 2
                        const cellLabels = selectedComponent.props.layoutConfig?.direction === 'vertical'
                            ? ['上方', '中间', '下方']
                            : ['左栏', '中栏', '右栏']
                        return Array.from({ length: cellCount }, (_, i) => (
                            <div key={i} style={{ marginBottom: 16, padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                                <div style={{ marginBottom: 8, color: '#fff', fontSize: 12 }}>{cellLabels[i] || `栏${i + 1}`}</div>
                                <div className="form-row">
                                    <Form.Item label="比例">
                                        <InputNumber
                                            value={selectedComponent.props.layoutConfig?.cells?.[i]?.flex ?? 1}
                                            onChange={(v) => {
                                                const cells = [...(selectedComponent.props.layoutConfig?.cells || [])]
                                                cells[i] = { ...cells[i], flex: v ?? 1 }
                                                handleChange('props.layoutConfig', {
                                                    ...selectedComponent.props.layoutConfig,
                                                    cells
                                                })
                                            }}
                                            min={0.1}
                                            max={10}
                                            step={0.1}
                                            style={{ width: '100%' }}
                                        />
                                    </Form.Item>
                                    <Form.Item label="背景色">
                                        <ColorPicker
                                            value={selectedComponent.props.layoutConfig?.cells?.[i]?.backgroundColor || 'transparent'}
                                            onChange={(c) => {
                                                const cells = [...(selectedComponent.props.layoutConfig?.cells || [])]
                                                cells[i] = { ...cells[i], backgroundColor: c.toHexString() }
                                                handleChange('props.layoutConfig', {
                                                    ...selectedComponent.props.layoutConfig,
                                                    cells
                                                })
                                            }}
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                        ))
                    })()}
                </Form>
            )
        }] : []),
    ]

    const dataContent = (
        <Form layout="vertical" size="small" style={{ padding: '0 12px' }}>
            {/* 数据源配置 - 支持数据源的组件类型 */}
            {['singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart', 'horizontalBarChart', 'scatterChart', 'pieChart', 'halfPieChart', 'funnelChart', 'mapChart', 'wordCloudChart', 'scrollRankList', 'carouselList', 'table', 'treeChart', 'sankeyChart'].includes(selectedComponent.type) && (
                <div style={{ marginBottom: 16, padding: 12, background: 'rgba(24, 144, 255, 0.1)', borderRadius: 6, border: '1px solid rgba(24, 144, 255, 0.3)' }}>
                    <div style={{ marginBottom: 8, color: '#1890ff', fontSize: 14, fontWeight: 500 }}>数据源配置</div>
                    <DataSourceEditor
                        value={selectedComponent.props.dataSource}
                        componentType={selectedComponent.type}
                        onChange={(dataSource) => handleChange('props.dataSource', dataSource)}
                        onDataFetch={async (data) => {
                            // 根据图表类型更新对应的数据
                            const updates: any = {}
                            
                            if (['singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart', 'horizontalBarChart', 'scatterChart'].includes(selectedComponent.type)) {
                                if (data.xAxisData) updates.xAxisData = data.xAxisData
                                if (data.seriesData) updates.seriesData = data.seriesData
                            } else if (['pieChart', 'halfPieChart'].includes(selectedComponent.type)) {
                                if (data.pieData || Array.isArray(data)) {
                                    updates.pieData = data.pieData || data
                                }
                            } else if (selectedComponent.type === 'funnelChart') {
                                if (data.funnelData || Array.isArray(data)) {
                                    updates.funnelData = data.funnelData || data
                                }
                            } else if (selectedComponent.type === 'mapChart') {
                                if (data.mapData || Array.isArray(data)) {
                                    updates.mapData = data.mapData || data
                                }
                            } else if (selectedComponent.type === 'wordCloudChart') {
                                if (data.wordCloudData || Array.isArray(data)) {
                                    updates.wordCloudData = data.wordCloudData || data
                                }
                            } else if (selectedComponent.type === 'scrollRankList') {
                                if (data.rankListData || Array.isArray(data)) {
                                    updates.rankListData = data.rankListData || data
                                }
                            } else if (selectedComponent.type === 'carouselList') {
                                if (data.carouselListData || Array.isArray(data)) {
                                    updates.carouselListData = data.carouselListData || data
                                }
                            } else if (selectedComponent.type === 'table') {
                                if (data.tableData || Array.isArray(data)) {
                                    updates.tableData = data.tableData || data
                                }
                                if (data.tableColumns) {
                                    updates.tableColumns = data.tableColumns
                                }
                            } else if (selectedComponent.type === 'treeChart') {
                                if (data.treeData || (data.name && data.children)) {
                                    updates.treeData = data.treeData || data
                                }
                            } else if (selectedComponent.type === 'sankeyChart') {
                                if (data.sankeyData || (data.nodes && data.links)) {
                                    updates.sankeyData = data.sankeyData || data
                                }
                            }

                            if (Object.keys(updates).length > 0) {
                                Object.entries(updates).forEach(([key, value]) => {
                                    handleChange(`props.${key}`, value)
                                })
                            }
                        }}
                    />
                </div>
            )}
            
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
            {selectedComponent.type === 'carousel' && (
                <>
                    <Form.Item label="轮播图片">
                        <ImageListEditor
                            value={selectedComponent.props.carouselImages || []}
                            onChange={(v) => handleChange('props.carouselImages', v)}
                        />
                    </Form.Item>
                    <Form.Item label="自动播放">
                        <Switch
                            checked={selectedComponent.props.carouselConfig?.autoplay !== false}
                            onChange={(v) => handleChange('props.carouselConfig', {
                                ...selectedComponent.props.carouselConfig,
                                autoplay: v
                            })}
                        />
                    </Form.Item>
                    <Form.Item label="切换间隔(ms)">
                        <InputNumber
                            value={selectedComponent.props.carouselConfig?.interval || 3000}
                            onChange={(v) => handleChange('props.carouselConfig', {
                                ...selectedComponent.props.carouselConfig,
                                interval: v
                            })}
                            min={1000}
                            max={10000}
                            step={500}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="显示指示点">
                        <Switch
                            checked={selectedComponent.props.carouselConfig?.showDots !== false}
                            onChange={(v) => handleChange('props.carouselConfig', {
                                ...selectedComponent.props.carouselConfig,
                                showDots: v
                            })}
                        />
                    </Form.Item>
                    <Form.Item label="切换效果">
                        <Select
                            value={selectedComponent.props.carouselConfig?.effect || 'fade'}
                            onChange={(v) => handleChange('props.carouselConfig', {
                                ...selectedComponent.props.carouselConfig,
                                effect: v
                            })}
                            style={{ width: '100%' }}
                        >
                            <Select.Option value="fade">淡入淡出</Select.Option>
                            <Select.Option value="slide">滑动（开发中）</Select.Option>
                        </Select>
                    </Form.Item>
                </>
            )}
            {selectedComponent.type === 'table' && (
                <>
                    {selectedComponent.props.dataSource?.type !== 'api' && (
                        <Form.Item label="表头配置">
                            <JsonEditor
                                value={selectedComponent.props.tableColumns || []}
                                onChange={(v) => handleChange('props.tableColumns', v)}
                                placeholder='[{"title":"Name","dataIndex":"name","key":"name"}]'
                            />
                        </Form.Item>
                    )}
                    {selectedComponent.props.dataSource?.type !== 'api' && (
                        <Form.Item label="表格数据">
                            <JsonEditor
                                value={selectedComponent.props.tableData || []}
                                onChange={(v) => handleChange('props.tableData', v)}
                                placeholder='[{"key":"1","name":"John Brown"}]'
                            />
                        </Form.Item>
                    )}
                </>
            )}
            {/* 图表数据配置 - 只在模拟数据模式下显示 */}
            {['singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart', 'horizontalBarChart', 'scatterChart'].includes(selectedComponent.type) && selectedComponent.props.dataSource?.type !== 'api' && (
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
            {selectedComponent.type === 'radarChart' && selectedComponent.props.dataSource?.type !== 'api' && (
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
            {['pieChart', 'halfPieChart'].includes(selectedComponent.type) && selectedComponent.props.dataSource?.type !== 'api' && (
                <Form.Item label="饼图数据">
                    <JsonEditor
                        value={selectedComponent.props.pieData || []}
                        onChange={(v) => handleChange('props.pieData', v)}
                        placeholder='[{"value":1048,"name":"Search Engine"}]'
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'funnelChart' && selectedComponent.props.dataSource?.type !== 'api' && (
                <Form.Item label="漏斗图数据">
                    <JsonEditor
                        value={selectedComponent.props.funnelData || []}
                        onChange={(v) => handleChange('props.funnelData', v)}
                        placeholder='[{"value":100,"name":"展示"},{"value":80,"name":"点击"}]'
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'wordCloudChart' && selectedComponent.props.dataSource?.type !== 'api' && (
                <Form.Item label="词云数据">
                    <JsonEditor
                        value={selectedComponent.props.wordCloudData || []}
                        onChange={(v) => handleChange('props.wordCloudData', v)}
                        placeholder='[{"name":"数据可视化","value":100},{"name":"大数据","value":80}]'
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
                    {selectedComponent.props.dataSource?.type !== 'api' && (
                        <Form.Item label="地图数据">
                            <JsonEditor
                                value={selectedComponent.props.mapData || []}
                                onChange={(v) => handleChange('props.mapData', v)}
                                placeholder='[{"name":"北京","value":100}]'
                            />
                        </Form.Item>
                    )}
                </>
            )}
            {selectedComponent.type === 'calendarChart' && selectedComponent.props.dataSource?.type !== 'api' && (
                <Form.Item label="热力数据">
                    <JsonEditor
                        value={selectedComponent.props.calendarData || []}
                        onChange={(v) => handleChange('props.calendarData', v)}
                        placeholder='[["2025-01-01", 50], ["2025-01-02", 80]]'
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'scrollRankList' && selectedComponent.props.dataSource?.type !== 'api' && (
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
                    {selectedComponent.props.dataSource?.type !== 'api' && (
                        <Form.Item label="列表数据">
                            <JsonEditor
                                value={selectedComponent.props.carouselListData || []}
                                onChange={(v) => handleChange('props.carouselListData', v)}
                                placeholder='[{"name":"张三","dept":"技术部"}]'
                            />
                        </Form.Item>
                    )}
                </>
            )}
            {selectedComponent.type === 'treeChart' && selectedComponent.props.dataSource?.type !== 'api' && (
                <Form.Item label="树形数据">
                    <JsonEditor
                        value={selectedComponent.props.treeData || {}}
                        onChange={(v) => handleChange('props.treeData', v)}
                        placeholder='{"name":"根节点","children":[{"name":"子节点1","value":10,"children":[{"name":"叶子节点","value":5}]},{"name":"子节点2","value":20}]}'
                    />
                </Form.Item>
            )}
            {selectedComponent.type === 'sankeyChart' && selectedComponent.props.dataSource?.type !== 'api' && (
                <Form.Item label="桑基图数据">
                    <JsonEditor
                        value={selectedComponent.props.sankeyData || {}}
                        onChange={(v) => handleChange('props.sankeyData', v)}
                        placeholder='{"nodes":[{"name":"源节点"},{"name":"目标节点"}],"links":[{"source":"源节点","target":"目标节点","value":100}]}'
                    />
                </Form.Item>
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
