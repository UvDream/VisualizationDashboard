import { Button, Tooltip, Space, Slider } from 'antd'
import {
    SaveOutlined,
    EyeOutlined,
    UndoOutlined,
    RedoOutlined,
    DeleteOutlined,
    CopyOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    ReloadOutlined,
} from '@ant-design/icons'
import { useEditor } from '../../context/EditorContext'
import './index.less'

export default function Toolbar() {
    const { state, deleteComponent, setScale } = useEditor()

    const handleDelete = () => {
        if (state.selectedId) {
            deleteComponent(state.selectedId)
        }
    }

    const handleZoomOut = () => {
        const newScale = Math.max(0.2, state.scale - 0.1)
        setScale(parseFloat(newScale.toFixed(1)))
    }

    const handleZoomIn = () => {
        const newScale = Math.min(2.0, state.scale + 0.1)
        setScale(parseFloat(newScale.toFixed(1)))
    }

    const handleResetZoom = () => {
        setScale(1.0)
    }

    return (
        <div className="toolbar">
            <div className="toolbar-left">
                <span className="toolbar-title">可视化大屏编辑器</span>
            </div>
            <div className="toolbar-center">
                <Space size="large">
                    <Space>
                        <Tooltip title="撤销">
                            <Button icon={<UndoOutlined />} disabled />
                        </Tooltip>
                        <Tooltip title="重做">
                            <Button icon={<RedoOutlined />} disabled />
                        </Tooltip>
                        <Tooltip title="复制">
                            <Button icon={<CopyOutlined />} disabled={!state.selectedId} />
                        </Tooltip>
                        <Tooltip title="删除">
                            <Button
                                icon={<DeleteOutlined />}
                                disabled={!state.selectedId}
                                onClick={handleDelete}
                            />
                        </Tooltip>
                    </Space>

                    <div className="toolbar-divider" />

                    <Space>
                        <Tooltip title="缩小">
                            <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} />
                        </Tooltip>
                        <div style={{ width: 100, display: 'flex', alignItems: 'center' }}>
                            <Slider
                                min={0.2}
                                max={2.0}
                                step={0.1}
                                value={state.scale}
                                onChange={setScale}
                                tooltip={{ formatter: (value) => `${Math.round((value || 0) * 100)}%` }}
                            />
                        </div>
                        <Tooltip title="放大">
                            <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} />
                        </Tooltip>
                        <Tooltip title="重置缩放">
                            <Button icon={<ReloadOutlined />} onClick={handleResetZoom} />
                        </Tooltip>
                        <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>
                            {Math.round(state.scale * 100)}%
                        </span>
                    </Space>
                </Space>
            </div>
            <div className="toolbar-right">
                <Space>
                    <Tooltip title="预览">
                        <Button icon={<EyeOutlined />}>预览</Button>
                    </Tooltip>
                    <Button type="primary" icon={<SaveOutlined />}>
                        保存
                    </Button>
                </Space>
            </div>
        </div>
    )
}
