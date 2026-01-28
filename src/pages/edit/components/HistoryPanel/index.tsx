import { useRef, useEffect } from 'react'
import { Button, Typography, Space, Tooltip, Timeline } from 'antd'
import { UndoOutlined, RedoOutlined, HistoryOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useEditor } from '../../context/EditorContext'
import './index.less'

const { Text } = Typography

interface HistoryPanelProps {
    visible?: boolean
}

export default function HistoryPanel({ visible = true }: HistoryPanelProps) {
    const {
        undo,
        redo,
        canUndo,
        canRedo,
        historyActions,
        futureActions,
        jumpToHistory
    } = useEditor()

    const scrollRef = useRef<HTMLDivElement>(null)

    // 自动滚动到底部
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [historyActions.length])

    if (!visible) return null

    // 合并所有操作记录用于显示
    // 过去的操作 + 当前状态(作为最新的一条记录) + 未来的操作
    // 注意：historyActions 是过去的操作，futureActions 是因为撤销而产生的"未来"操作

    return (
        <div className="history-panel">
            <div className="history-panel-header">
                <Space>
                    <HistoryOutlined />
                    <Text strong>历史记录</Text>
                </Space>
                <Space size="small">
                    <Tooltip title="撤销 (Ctrl+Z)">
                        <Button
                            type="text"
                            size="small"
                            icon={<UndoOutlined />}
                            disabled={!canUndo}
                            onClick={undo}
                        />
                    </Tooltip>
                    <Tooltip title="重做 (Ctrl+Y)">
                        <Button
                            type="text"
                            size="small"
                            icon={<RedoOutlined />}
                            disabled={!canRedo}
                            onClick={redo}
                        />
                    </Tooltip>
                </Space>
            </div>

            <div className="history-panel-content" ref={scrollRef}>
                {historyActions.length === 0 && futureActions.length === 0 ? (
                    <div className="history-empty">
                        <HistoryOutlined style={{ fontSize: 24, color: '#ccc', marginBottom: 8 }} />
                        <Text type="secondary">暂无历史记录</Text>
                    </div>
                ) : (
                    <Timeline className="history-timeline">
                        {/* 初始状态 */}
                        <Timeline.Item color="gray">
                            <div
                                className="history-item"
                                onClick={() => jumpToHistory(0)}
                            >
                                <div className="history-item-content">
                                    <Text type="secondary">初始状态</Text>
                                </div>
                            </div>
                        </Timeline.Item>

                        {/* 过去的操作 */}
                        {historyActions.map((action, index) => (
                            <Timeline.Item
                                key={action.id}
                                color="blue"
                                dot={<ClockCircleOutlined style={{ fontSize: '12px' }} />}
                            >
                                <div
                                    className="history-item"
                                    onClick={() => jumpToHistory(index + 1)}
                                >
                                    <div className="history-item-content">
                                        <Space size={4}>
                                            <span role="img" aria-label="icon">{action.icon}</span>
                                            <Text className="history-desc">{action.description}</Text>
                                        </Space>
                                        <Text type="secondary" style={{ fontSize: '10px' }}>
                                            {new Date(action.timestamp).toLocaleTimeString()}
                                        </Text>
                                    </div>
                                </div>
                            </Timeline.Item>
                        ))}

                        {/* 当前状态指示器 */}
                        <Timeline.Item color="green" dot={<CheckCircleOutlined style={{ fontSize: '14px' }} />}>
                            <div className="history-item current">
                                <Text strong style={{ color: '#52c41a' }}>当前状态</Text>
                            </div>
                        </Timeline.Item>

                        {/* 未来的操作（可重做） */}
                        {futureActions.map((action, index) => (
                            <Timeline.Item
                                key={action.id}
                                color="gray"
                                className="future-item"
                            >
                                <div
                                    className="history-item"
                                    onClick={() => jumpToHistory(historyActions.length + 1 + index)}
                                >
                                    <div className="history-item-content">
                                        <Space size={4}>
                                            <span role="img" aria-label="icon">{action.icon}</span>
                                            <Text type="secondary" className="history-desc">{action.description}</Text>
                                        </Space>
                                        <Text type="secondary" style={{ fontSize: '10px', opacity: 0.7 }}>
                                            {new Date(action.timestamp).toLocaleTimeString()}
                                        </Text>
                                    </div>
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                )}
            </div>

            <div className="history-panel-footer">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    点击记录跳转到该状态
                </Text>
            </div>
        </div>
    )
}