import { Button, Tooltip, Space } from 'antd'
import {
    SaveOutlined,
    EyeOutlined,
    UndoOutlined,
    RedoOutlined,
    DeleteOutlined,
    CopyOutlined,
} from '@ant-design/icons'
import { useEditor } from '../../context/EditorContext'
import './index.less'

export default function Toolbar() {
    const { state, deleteComponent } = useEditor()

    const handleDelete = () => {
        if (state.selectedId) {
            deleteComponent(state.selectedId)
        }
    }

    return (
        <div className="toolbar">
            <div className="toolbar-left">
                <span className="toolbar-title">可视化大屏编辑器</span>
            </div>
            <div className="toolbar-center">
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
