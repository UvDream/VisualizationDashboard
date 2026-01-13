import { Form, Input, InputNumber, Select, Collapse, Tabs, ColorPicker, Switch, Radio } from 'antd'
import { useEditor } from '../../context/EditorContext'
import JsonEditor from './JsonEditor'
import './index.less'

export default function PropertyPanel() {
    const { getSelectedComponent, updateComponent } = useEditor()
    const selectedComponent = getSelectedComponent()

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
                        value={selectedComponent.props.cardTitle}
                        onChange={(e) => handleChange('props.cardTitle', e.target.value)}
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
