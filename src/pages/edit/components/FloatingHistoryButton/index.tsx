import { useState } from 'react'
import { Button, Space, Typography, Badge, Tooltip, Popover, List } from 'antd'
import { HistoryOutlined } from '@ant-design/icons'
import { useEditor } from '../../context/EditorContext'
import './index.less'

const { Text } = Typography

/**
 * 画布内历史记录气泡卡片
 * 位于画布左下角的小按钮，点击显示气泡卡片
 */
export default function CanvasHistoryButton() {
    const [popoverVisible, setPopoverVisible] = useState(false)
    const { historyLength, historyActions, futureActions, jumpToHistory } = useEditor()

    const handleVisibleChange = (visible: boolean) => {
        setPopoverVisible(visible)
    }

    // 处理跳转到历史记录
    const handleJumpToHistory = (index: number) => {
        jumpToHistory(index)
        setPopoverVisible(false)
    }

    // 合并所有历史记录（过去 + 当前 + 未来）
    const allHistoryItems = [
        // 过去的操作（倒序显示，最新的在上面）
        // 注意：点击某个操作应该恢复到该操作完成后的状态
        // past[i] 存储的是 pastActions[i] 执行前的状态
        // 所以要恢复到 pastActions[i] 执行后的状态，需要跳转到 index + 1
        ...historyActions.map((action, index) => ({
            ...action,
            index: index + 1, // 修复：跳转到操作完成后的状态
            isCurrent: false,
            isPast: true,
            isFuture: false,
        })).reverse(),
        // 当前状态
        {
            id: 'current',
            type: 'CURRENT',
            description: '当前状态',
            timestamp: Date.now(),
            icon: '📍',
            index: historyLength,
            isCurrent: true,
            isPast: false,
            isFuture: false,
        },
        // 未来的操作
        ...futureActions.map((action, index) => ({
            ...action,
            index: historyLength + 1 + index,
            isCurrent: false,
            isPast: false,
            isFuture: true,
        })),
    ]

    // 气泡卡片内容
    const popoverContent = (
        <div className="history-popover-content">
            {/* 历史记录列表 */}
            <div className="history-list">
                {allHistoryItems.length > 1 ? (
                    <List
                        size="small"
                        dataSource={allHistoryItems}
                        renderItem={(item) => (
                            <List.Item
                                className={`history-list-item ${item.isCurrent ? 'current' : ''} ${item.isPast ? 'past' : ''} ${item.isFuture ? 'future' : ''}`}
                                onClick={() => !item.isCurrent && handleJumpToHistory(item.index)}
                                style={{ cursor: item.isCurrent ? 'default' : 'pointer' }}
                            >
                                <div className="history-item-content">
                                    <div className="history-item-icon">{item.icon}</div>
                                    <div className="history-item-text">
                                        <Text
                                            strong={item.isCurrent}
                                            type={item.isFuture ? 'secondary' : undefined}
                                        >
                                            {item.description}
                                        </Text>
                                        {item.componentName && (
                                            <Text
                                                type="secondary"
                                                className="history-item-name"
                                            >
                                                ({item.componentName})
                                            </Text>
                                        )}
                                    </div>
                                    {item.isCurrent && (
                                        <Badge status="processing" />
                                    )}
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div className="empty-state">
                        <HistoryOutlined style={{ fontSize: '16px', color: 'var(--ant-color-text-tertiary)', marginBottom: '4px' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            暂无历史记录
                        </Text>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <div className="canvas-history-button">
            <Popover
                content={popoverContent}
                title={
                    <Space size="small">
                        <HistoryOutlined />
                        <span>历史记录</span>
                        {historyLength > 0 && (
                            <Badge count={historyLength} size="small" />
                        )}
                    </Space>
                }
                trigger="click"
                placement="topLeft"
                open={popoverVisible}
                onOpenChange={handleVisibleChange}
                overlayClassName="history-popover"
            >
                <Tooltip
                    title={`历史记录${historyLength > 0 ? ` (${historyLength})` : ''}`}
                    placement="top"
                >
                    <Button
                        size="small"
                        icon={<HistoryOutlined />}
                        className="history-trigger-button"
                        type={historyLength > 0 ? "primary" : "default"}
                    />
                </Tooltip>
            </Popover>
        </div>
    )
}