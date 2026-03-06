/**
 * InteractionEditor - 交互联动配置面板
 * 
 * 在属性面板的「交互」Tab 中显示，允许用户可视化配置组件之间的联动关系
 */

import { useState, useEffect } from 'react'
import { Form, Select, Button, Card, Switch, Input, Empty, Tag, Tooltip, Popconfirm } from 'antd'
import {
    PlusOutlined,
    DeleteOutlined,
    ThunderboltOutlined,
    LinkOutlined,
    EyeOutlined,
    FilterOutlined,
    SyncOutlined,
    EditOutlined,
    HighlightOutlined,
    EyeInvisibleOutlined,
} from '@ant-design/icons'
import { v4 as uuidv4 } from 'uuid'
import { useEditor } from '../../context/EditorContext'
import type { InteractionConfig, InteractionTrigger, InteractionAction, ComponentType } from '../../types'
import './InteractionEditor.less'

interface InteractionEditorProps {
    componentId: string
}

// 组件类型中文名映射
const componentTypeNameMap: Record<string, string> = {
    'singleLineChart': '单折线图', 'doubleLineChart': '双折线图',
    'singleBarChart': '单柱状图', 'doubleBarChart': '双柱状图',
    'horizontalBarChart': '横向柱状图', 'pieChart': '饼图',
    'halfPieChart': '半饼图', 'funnelChart': '漏斗图',
    'wordCloudChart': '词云图', 'gaugeChart': '仪表盘',
    'radarChart': '雷达图', 'scatterChart': '散点图',
    'mapChart': '地图', 'cityMapChart': '城市地图',
    'calendarChart': '日历图', 'treeChart': '树图', 'sankeyChart': '桑基图',
    'text': '文本', 'button': '按钮', 'input': '输入框',
    'select': '下拉框', 'switch': '开关', 'progress': '进度条',
    'tag': '标签', 'badge': '徽章', 'avatar': '头像', 'card': '卡片',
    'table': '表格', 'scrollRankList': '滚动排行', 'carouselList': '轮播列表',
    'image': '图片', 'carousel': '轮播图', 'icon': '图标',
    'gradientText': '渐变文字', 'flipCountdown': '倒计时', 'futuristicTitle': '科技标题',
}

// 组件类型图标映射
const componentTypeIconMap: Record<string, string> = {
    'singleLineChart': '📈', 'doubleLineChart': '📈', 'singleBarChart': '📊',
    'doubleBarChart': '📊', 'horizontalBarChart': '📊', 'pieChart': '🥧',
    'halfPieChart': '🥧', 'funnelChart': '🔽', 'wordCloudChart': '☁️',
    'gaugeChart': '⏱️', 'radarChart': '🕸️', 'scatterChart': '⚬',
    'mapChart': '🗺️', 'cityMapChart': '🏙️', 'calendarChart': '📅',
    'treeChart': '🌳', 'sankeyChart': '🔀',
    'text': '📝', 'button': '🔘', 'input': '📥', 'select': '📋',
    'switch': '🔀', 'progress': '📏', 'table': '📑',
    'scrollRankList': '📊', 'carouselList': '📃', 'image': '🖼️',
}

// 根据组件类型，返回可用的触发事件
function getAvailableTriggers(componentType: ComponentType): Array<{
    value: InteractionTrigger
    label: string
    description: string
}> {
    const chartTypes = [
        'singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart',
        'horizontalBarChart', 'pieChart', 'halfPieChart', 'funnelChart',
        'gaugeChart', 'radarChart', 'scatterChart', 'mapChart', 'cityMapChart',
        'calendarChart', 'treeChart', 'sankeyChart', 'wordCloudChart',
    ]

    const triggers: Array<{ value: InteractionTrigger; label: string; description: string }> = []

    if (chartTypes.includes(componentType)) {
        triggers.push(
            { value: 'click', label: '点击图表', description: '用户点击图表中的数据项时触发' },
            { value: 'hover', label: '悬停数据', description: '鼠标悬停在数据项上时触发' },
        )
        // 地图组件特有：轮播高亮触发
        if (componentType === 'mapChart' || componentType === 'cityMapChart') {
            triggers.push(
                { value: 'autoHighlight', label: '轮播高亮', description: '地图轮播高亮切换区域时自动触发（需先开启轮播）' },
            )
        }
    } else if (['select'].includes(componentType)) {
        triggers.push(
            { value: 'change', label: '选择变化', description: '下拉选择值变化时触发' },
        )
    } else if (['input'].includes(componentType)) {
        triggers.push(
            { value: 'change', label: '输入变化', description: '输入框内容变化时触发（防抖300ms）' },
        )
    } else if (['switch'].includes(componentType)) {
        triggers.push(
            { value: 'change', label: '切换状态', description: '开关切换时触发' },
        )
    } else if (['button'].includes(componentType)) {
        triggers.push(
            { value: 'click', label: '点击按钮', description: '用户点击按钮时触发' },
        )
    } else if (['table', 'scrollRankList'].includes(componentType)) {
        triggers.push(
            { value: 'click', label: '点击行', description: '用户点击表格行时触发' },
        )
    } else {
        triggers.push(
            { value: 'click', label: '点击', description: '用户点击组件时触发' },
        )
    }

    triggers.push(
        { value: 'dataLoaded', label: '数据加载', description: '组件数据加载完成时触发' },
    )

    return triggers
}

// 所有可用的执行动作
const availableActions: Array<{
    value: InteractionAction
    label: string
    icon: React.ReactNode
    description: string
}> = [
        { value: 'filterData', label: '过滤数据', icon: <FilterOutlined />, description: '根据触发数据过滤目标组件的数据' },
        { value: 'refreshData', label: '刷新数据', icon: <SyncOutlined />, description: '带参数重新请求目标组件的API数据' },
        { value: 'setValue', label: '设置值', icon: <EditOutlined />, description: '将触发数据的值设置到目标组件的属性上' },
        { value: 'toggleVisible', label: '切换显隐', icon: <EyeInvisibleOutlined />, description: '切换目标组件的显示/隐藏状态' },
        { value: 'highlight', label: '高亮数据', icon: <HighlightOutlined />, description: '高亮目标图表中对应的数据' },
    ]

export default function InteractionEditor({ componentId }: InteractionEditorProps) {
    const { state, updateComponent } = useEditor()
    const component = state.components.find(c => c.id === componentId)
    const [expandedId, setExpandedId] = useState<string | null>(null)

    if (!component) return null

    const interactions = component.interactions || []

    // 获取可作为目标的组件列表（排除自身）
    const targetComponents = state.components
        .filter(c => c.id !== componentId)
        .map(c => ({
            value: c.id,
            label: `${componentTypeIconMap[c.type] || '📦'} ${c.name || componentTypeNameMap[c.type] || c.type}`,
            type: c.type,
        }))

    // 获取指向当前组件的联动关系
    const incomingInteractions = state.components
        .filter(c => c.interactions?.some(i => i.targetId === componentId))
        .flatMap(source =>
            (source.interactions || [])
                .filter(i => i.targetId === componentId)
                .map(config => ({ source, config }))
        )

    // 添加交互规则
    const handleAddInteraction = () => {
        const availableTriggers = getAvailableTriggers(component.type)
        const newInteraction: InteractionConfig = {
            id: uuidv4(),
            trigger: availableTriggers[0]?.value || 'click',
            targetId: '',
            action: 'filterData',
            enabled: true,
        }

        updateComponent(componentId, {
            interactions: [...interactions, newInteraction],
        })

        setExpandedId(newInteraction.id)
    }

    // 删除交互规则
    const handleDeleteInteraction = (interactionId: string) => {
        updateComponent(componentId, {
            interactions: interactions.filter(i => i.id !== interactionId),
        })
    }

    // 更新交互规则
    const handleUpdateInteraction = (interactionId: string, updates: Partial<InteractionConfig>) => {
        updateComponent(componentId, {
            interactions: interactions.map(i =>
                i.id === interactionId ? { ...i, ...updates } : i
            ),
        })
    }

    // 切换启用/禁用
    const handleToggleEnabled = (interactionId: string, enabled: boolean) => {
        handleUpdateInteraction(interactionId, { enabled })
    }

    const availableTriggers = getAvailableTriggers(component.type)

    // 获取动作图标
    const getActionIcon = (action: InteractionAction) => {
        const found = availableActions.find(a => a.value === action)
        return found?.icon || <ThunderboltOutlined />
    }

    // 获取动作名称
    const getActionLabel = (action: InteractionAction) => {
        const found = availableActions.find(a => a.value === action)
        return found?.label || action
    }

    // 获取目标组件名称
    const getTargetName = (targetId: string) => {
        const target = state.components.find(c => c.id === targetId)
        if (!target) return '（已删除）'
        return target.name || componentTypeNameMap[target.type] || target.type
    }

    return (
        <div className="interaction-editor">
            {/* 当前组件联动概览 */}
            <div className="interaction-summary">
                <div className="summary-item">
                    <ThunderboltOutlined style={{ color: '#1E40AF' }} />
                    <span>出站联动: <strong>{interactions.length}</strong></span>
                </div>
                <div className="summary-item">
                    <LinkOutlined style={{ color: '#10B981' }} />
                    <span>入站联动: <strong>{incomingInteractions.length}</strong></span>
                </div>
            </div>

            {/* 入站联动提示 */}
            {incomingInteractions.length > 0 && (
                <div className="incoming-section">
                    <div className="section-title">
                        <EyeOutlined /> 被以下组件联动
                    </div>
                    {incomingInteractions.map(({ source, config }) => (
                        <div key={config.id} className="incoming-item">
                            <Tag color="green" style={{ marginRight: 4 }}>
                                {componentTypeIconMap[source.type] || '📦'} {source.name || componentTypeNameMap[source.type]}
                            </Tag>
                            <span className="incoming-action">
                                {getActionLabel(config.action)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* 出站联动规则列表 */}
            <div className="outgoing-section">
                <div className="section-header">
                    <span className="section-title">
                        <ThunderboltOutlined /> 交互规则
                    </span>
                    <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={handleAddInteraction}
                    >
                        添加交互
                    </Button>
                </div>

                {interactions.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <span style={{ color: '#94A3B8', fontSize: 12 }}>
                                暂无交互规则，点击上方按钮添加
                            </span>
                        }
                        style={{ padding: '24px 0' }}
                    />
                ) : (
                    <div className="interaction-list">
                        {interactions.map((interaction, index) => {
                            const isExpanded = expandedId === interaction.id
                            const targetName = getTargetName(interaction.targetId)
                            const isValid = interaction.targetId && state.components.some(c => c.id === interaction.targetId)

                            return (
                                <Card
                                    key={interaction.id}
                                    size="small"
                                    className={`interaction-card ${!interaction.enabled ? 'disabled' : ''} ${!isValid && interaction.targetId ? 'invalid' : ''}`}
                                    title={
                                        <div
                                            className="card-title"
                                            onClick={() => setExpandedId(isExpanded ? null : interaction.id)}
                                        >
                                            <span className="card-title-icon">
                                                {getActionIcon(interaction.action)}
                                            </span>
                                            <span className="card-title-text">
                                                规则 {index + 1}
                                                {interaction.targetId && (
                                                    <span className="card-subtitle">
                                                        → {targetName}
                                                    </span>
                                                )}
                                            </span>
                                            {!isValid && interaction.targetId && (
                                                <Tag color="error" style={{ marginLeft: 4, fontSize: 10 }}>失效</Tag>
                                            )}
                                        </div>
                                    }
                                    extra={
                                        <div className="card-extra" onClick={e => e.stopPropagation()}>
                                            <Tooltip title={interaction.enabled ? '已启用' : '已禁用'}>
                                                <Switch
                                                    size="small"
                                                    checked={interaction.enabled !== false}
                                                    onChange={(v) => handleToggleEnabled(interaction.id, v)}
                                                />
                                            </Tooltip>
                                            <Popconfirm
                                                title="确定删除此交互规则？"
                                                onConfirm={() => handleDeleteInteraction(interaction.id)}
                                                okText="删除"
                                                cancelText="取消"
                                            >
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                />
                                            </Popconfirm>
                                        </div>
                                    }
                                >
                                    {isExpanded && (
                                        <Form layout="vertical" size="small">
                                            {/* 触发事件 */}
                                            <Form.Item label="触发事件">
                                                <Select
                                                    value={interaction.trigger}
                                                    onChange={(v) => handleUpdateInteraction(interaction.id, { trigger: v as InteractionTrigger })}
                                                    options={availableTriggers.map(t => ({
                                                        value: t.value,
                                                        label: t.label,
                                                    }))}
                                                />
                                            </Form.Item>

                                            {/* 触发字段 */}
                                            {interaction.trigger !== 'dataLoaded' && (
                                                <Form.Item label="触发字段" tooltip="触发时传递给目标组件的数据字段名">
                                                    <Input
                                                        value={interaction.triggerField || ''}
                                                        onChange={(e) => handleUpdateInteraction(interaction.id, { triggerField: e.target.value })}
                                                        placeholder="如: name, value, category"
                                                    />
                                                </Form.Item>
                                            )}

                                            {/* 目标组件 */}
                                            <Form.Item label="目标组件">
                                                <Select
                                                    value={interaction.targetId || undefined}
                                                    onChange={(v) => handleUpdateInteraction(interaction.id, { targetId: v })}
                                                    options={targetComponents}
                                                    placeholder="选择目标组件"
                                                    showSearch
                                                    optionFilterProp="label"
                                                    notFoundContent="画布上没有其他组件"
                                                />
                                            </Form.Item>

                                            {/* 执行动作 */}
                                            <Form.Item label="执行动作">
                                                <Select
                                                    value={interaction.action}
                                                    onChange={(v) => handleUpdateInteraction(interaction.id, { action: v as InteractionAction })}
                                                    options={availableActions.map(a => ({
                                                        value: a.value,
                                                        label: (
                                                            <span>
                                                                {a.icon} {a.label}
                                                            </span>
                                                        ),
                                                    }))}
                                                />
                                            </Form.Item>

                                            {/* 参数映射 - 根据动作类型显示 */}
                                            {(interaction.action === 'filterData' || interaction.action === 'refreshData') && (
                                                <Form.Item label="参数映射" tooltip="源数据字段 → 目标参数字段">
                                                    <ParamMappingEditor
                                                        value={interaction.paramMapping || {}}
                                                        onChange={(mapping) => handleUpdateInteraction(interaction.id, { paramMapping: mapping })}
                                                        action={interaction.action}
                                                    />
                                                </Form.Item>
                                            )}

                                            {interaction.action === 'setValue' && (
                                                <Form.Item label="目标属性" tooltip="设置目标组件的哪个属性">
                                                    <Input
                                                        value={interaction.paramMapping?.['targetProp'] || ''}
                                                        onChange={(e) => handleUpdateInteraction(interaction.id, {
                                                            paramMapping: {
                                                                ...interaction.paramMapping,
                                                                targetProp: e.target.value,
                                                            }
                                                        })}
                                                        placeholder="如: content, percent, singleData"
                                                    />
                                                </Form.Item>
                                            )}
                                        </Form>
                                    )}

                                    {!isExpanded && (
                                        <div
                                            className="interaction-compact"
                                            onClick={() => setExpandedId(interaction.id)}
                                        >
                                            <Tag color="blue">{availableTriggers.find(t => t.value === interaction.trigger)?.label || interaction.trigger}</Tag>
                                            <span className="compact-arrow">→</span>
                                            <Tag color="cyan">{getActionLabel(interaction.action)}</Tag>
                                        </div>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

// 参数映射编辑器子组件
function ParamMappingEditor({
    value,
    onChange,
    action,
}: {
    value: Record<string, string>
    onChange: (mapping: Record<string, string>) => void
    action: InteractionAction
}) {
    // 将 Record<string, string> 转为内部数组结构，方便编辑
    const [entries, setEntries] = useState<Array<{ sourceField: string; targetField: string }>>(() =>
        Object.entries(value || {}).map(([k, v]) => ({ sourceField: k, targetField: v }))
    )

    // 当外部 value 变化时同步（but only if truly different from current entries）
    useEffect(() => {
        const externalEntries = Object.entries(value || {}).map(([k, v]) => ({ sourceField: k, targetField: v }))
        const currentAsRecord: Record<string, string> = {}
        entries.forEach(e => { if (e.sourceField) currentAsRecord[e.sourceField] = e.targetField })
        if (JSON.stringify(value || {}) !== JSON.stringify(currentAsRecord)) {
            setEntries(externalEntries)
        }
    }, [value])

    // 将内部数组转为 Record 并提交
    const commitChanges = (updatedEntries: Array<{ sourceField: string; targetField: string }>) => {
        const mapping: Record<string, string> = {}
        updatedEntries.forEach(entry => {
            if (entry.sourceField.trim()) {
                mapping[entry.sourceField.trim()] = entry.targetField.trim()
            }
        })
        onChange(mapping)
    }

    const handleAdd = () => {
        const defaultSource = action === 'filterData' ? 'name' : 'name'
        const defaultTarget = action === 'filterData' ? 'filterValue' : 'param'
        const newEntries = [...entries, { sourceField: defaultSource, targetField: defaultTarget }]
        setEntries(newEntries)
        commitChanges(newEntries)
    }

    const handleRemove = (index: number) => {
        const newEntries = entries.filter((_, i) => i !== index)
        setEntries(newEntries)
        commitChanges(newEntries)
    }

    const handleSourceChange = (index: number, newSource: string) => {
        const newEntries = entries.map((e, i) => i === index ? { ...e, sourceField: newSource } : e)
        setEntries(newEntries)
    }

    const handleTargetChange = (index: number, newTarget: string) => {
        const newEntries = entries.map((e, i) => i === index ? { ...e, targetField: newTarget } : e)
        setEntries(newEntries)
    }

    const handleBlur = () => {
        commitChanges(entries)
    }

    return (
        <div className="param-mapping-editor">
            {entries.map((entry, index) => (
                <div key={index} className="mapping-row">
                    <Input
                        size="small"
                        value={entry.sourceField}
                        onChange={(e) => handleSourceChange(index, e.target.value)}
                        onBlur={handleBlur}
                        placeholder="源字段"
                        style={{ flex: 1 }}
                    />
                    <span className="mapping-arrow">→</span>
                    <Input
                        size="small"
                        value={entry.targetField}
                        onChange={(e) => handleTargetChange(index, e.target.value)}
                        onBlur={handleBlur}
                        placeholder="目标字段"
                        style={{ flex: 1 }}
                    />
                    <Button
                        type="text"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemove(index)}
                    />
                </div>
            ))}
            <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAdd}
                block
                style={{ marginTop: entries.length > 0 ? 4 : 0 }}
            >
                添加映射
            </Button>
        </div>
    )
}
