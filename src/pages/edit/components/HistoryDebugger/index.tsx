import { useState } from 'react'
import { Card, Button, Space, Typography, Collapse, Tag, Tooltip } from 'antd'
import { BugOutlined, EyeInvisibleOutlined } from '@ant-design/icons'
import { useEditor } from '../../context/EditorContext'
import './index.less'

const { Text, Paragraph } = Typography
const { Panel } = Collapse

interface HistoryDebuggerProps {
    visible?: boolean
}

/**
 * 历史记录调试器
 * 仅在开发环境中显示，用于调试历史记录功能
 */
export default function HistoryDebugger({ visible = false }: HistoryDebuggerProps) {
    const [isVisible, setIsVisible] = useState(visible)
    const { state, canUndo, canRedo, undo, redo } = useEditor()

    // 仅在开发环境中显示
    if (import.meta.env.PROD && !visible) {
        return null
    }

    if (!isVisible) {
        return (
            <div className="history-debugger-toggle">
                <Tooltip title="显示历史记录调试器">
                    <Button
                        type="text"
                        size="small"
                        icon={<BugOutlined />}
                        onClick={() => setIsVisible(true)}
                    />
                </Tooltip>
            </div>
        )
    }

    return (
        <div className="history-debugger">
            <Card
                size="small"
                title={
                    <Space>
                        <BugOutlined />
                        <Text strong>历史记录调试器</Text>
                    </Space>
                }
                extra={
                    <Button
                        type="text"
                        size="small"
                        icon={<EyeInvisibleOutlined />}
                        onClick={() => setIsVisible(false)}
                    />
                }
            >
                <Space direction="vertical" style={{ width: '100%' }}>
                    {/* 基本状态 */}
                    <div className="debug-section">
                        <Text strong>基本状态</Text>
                        <div className="debug-info">
                            <Space wrap>
                                <Tag color={canUndo ? 'green' : 'red'}>
                                    可撤销: {canUndo ? '是' : '否'}
                                </Tag>
                                <Tag color={canRedo ? 'green' : 'red'}>
                                    可重做: {canRedo ? '是' : '否'}
                                </Tag>
                                <Tag color="blue">
                                    组件数: {state.components.length}
                                </Tag>
                                <Tag color="purple">
                                    已选择: {state.selectedIds.length}
                                </Tag>
                            </Space>
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="debug-section">
                        <Text strong>操作</Text>
                        <div className="debug-actions">
                            <Space>
                                <Button
                                    size="small"
                                    disabled={!canUndo}
                                    onClick={undo}
                                >
                                    撤销
                                </Button>
                                <Button
                                    size="small"
                                    disabled={!canRedo}
                                    onClick={redo}
                                >
                                    重做
                                </Button>
                            </Space>
                        </div>
                    </div>

                    {/* 当前状态详情 */}
                    <Collapse size="small">
                        <Panel header="当前状态详情" key="current-state">
                            <div className="debug-state">
                                <Paragraph>
                                    <Text strong>画布配置:</Text>
                                    <br />
                                    尺寸: {state.canvasConfig.width} × {state.canvasConfig.height}
                                    <br />
                                    背景: {state.canvasConfig.backgroundColor}
                                    <br />
                                    缩放: {Math.round(state.scale * 100)}%
                                </Paragraph>

                                <Paragraph>
                                    <Text strong>选择状态:</Text>
                                    <br />
                                    单选ID: {state.selectedId || '无'}
                                    <br />
                                    多选IDs: {state.selectedIds.length > 0 ? state.selectedIds.join(', ') : '无'}
                                </Paragraph>

                                <Paragraph>
                                    <Text strong>面板状态:</Text>
                                    <br />
                                    组件库: {state.showComponentPanel ? '显示' : '隐藏'}
                                    <br />
                                    图层面板: {state.showLayerPanel ? '显示' : '隐藏'}
                                    <br />
                                    属性面板: {state.showPropertyPanel ? '显示' : '隐藏'}
                                    <br />
                                    专注模式: {state.zenMode ? '开启' : '关闭'}
                                </Paragraph>
                            </div>
                        </Panel>

                        <Panel header="组件列表" key="components">
                            <div className="debug-components">
                                {state.components.length === 0 ? (
                                    <Text type="secondary">暂无组件</Text>
                                ) : (
                                    state.components.map((comp, index) => (
                                        <div key={comp.id} className="component-item">
                                            <Space>
                                                <Tag>{index + 1}</Tag>
                                                <Text code>{comp.id}</Text>
                                                <Text>{comp.name}</Text>
                                                <Tag color="blue">{comp.type}</Tag>
                                                {!comp.visible && <Tag color="red">隐藏</Tag>}
                                                {comp.locked && <Tag color="orange">锁定</Tag>}
                                                {comp.groupId && <Tag color="purple">组合</Tag>}
                                            </Space>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Panel>
                    </Collapse>
                </Space>
            </Card>
        </div>
    )
}