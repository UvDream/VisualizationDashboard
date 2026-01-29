import { Badge, Tooltip, Space } from 'antd'
import { HistoryOutlined, SaveOutlined } from '@ant-design/icons'
import { useHistory } from '../../hooks/useHistory'
import './index.less'

interface HistoryIndicatorProps {
    showSaveStatus?: boolean
    className?: string
}

/**
 * 历史记录状态指示器
 * 显示当前的历史记录状态和保存状态
 */
export default function HistoryIndicator({ showSaveStatus = true, className }: HistoryIndicatorProps) {
    const { historyStats, hasUnsavedChanges } = useHistory()

    return (
        <div className={`history-indicator ${className || ''}`}>
            <Space size="small">
                {/* 历史记录状态 */}
                <Tooltip 
                    title={
                        <div>
                            <div>可撤销: {historyStats.canUndo ? '是' : '否'}</div>
                            <div>可重做: {historyStats.canRedo ? '是' : '否'}</div>
                            <div>组件数量: {historyStats.componentsCount}</div>
                            <div>已选择: {historyStats.selectedCount}</div>
                        </div>
                    }
                >
                    <Badge 
                        dot={historyStats.hasHistory} 
                        status={historyStats.hasHistory ? 'processing' : 'default'}
                    >
                        <HistoryOutlined className="history-icon" />
                    </Badge>
                </Tooltip>

                {/* 保存状态 */}
                {showSaveStatus && (
                    <Tooltip title={hasUnsavedChanges ? '有未保存的更改' : '所有更改已保存'}>
                        <Badge 
                            dot={hasUnsavedChanges} 
                            status={hasUnsavedChanges ? 'warning' : 'success'}
                        >
                            <SaveOutlined 
                                className={`save-icon ${hasUnsavedChanges ? 'unsaved' : 'saved'}`} 
                            />
                        </Badge>
                    </Tooltip>
                )}
            </Space>
        </div>
    )
}