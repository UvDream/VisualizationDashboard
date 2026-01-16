import { useState } from 'react'
import { Button, Tooltip, Space, Slider, Modal, Form, Input, InputNumber, ColorPicker } from 'antd'
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
    SettingOutlined,
    GithubOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useEditor } from '../../context/EditorContext'
import './index.less'

export default function Toolbar() {
    const navigate = useNavigate()

    const { state, deleteComponent, deleteComponents, setScale, undo, redo, canUndo, canRedo, setCanvasConfig, copyComponent } = useEditor()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [form] = Form.useForm()

    const handleDelete = () => {
        const selectedIds = state.selectedIds || []
        if (selectedIds.length > 1) {
            // 多选删除
            deleteComponents(selectedIds)
        } else if (state.selectedId) {
            // 单选删除
            deleteComponent(state.selectedId)
        }
    }

    const handleCopy = () => {
        if (state.selectedId) {
            copyComponent(state.selectedId)
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

    const handleOpenSettings = () => {
        form.setFieldsValue({
            name: state.canvasConfig?.name,
            width: state.canvasConfig?.width,
            height: state.canvasConfig?.height,
            backgroundColor: state.canvasConfig?.backgroundColor,
        })
        setIsModalOpen(true)
    }

    const handleSaveSettings = () => {
        form.validateFields().then((values) => {
            const { name, width, height, backgroundColor } = values
            const bgStr = typeof backgroundColor === 'string' ? backgroundColor : backgroundColor?.toHexString()

            setCanvasConfig({
                name,
                width,
                height,
                backgroundColor: bgStr,
            })
            setIsModalOpen(false)
        })
    }

    return (
        <div className="toolbar">
            <div className="toolbar-left">
                <span className="toolbar-title">{state.canvasConfig?.name || '可视化大屏编辑器'}</span>
            </div>
            <div className="toolbar-center">
                <Space size="large">
                    <Space>
                        <Tooltip title="撤销">
                            <Button icon={<UndoOutlined />} disabled={!canUndo} onClick={undo} />
                        </Tooltip>
                        <Tooltip title="重做">
                            <Button icon={<RedoOutlined />} disabled={!canRedo} onClick={redo} />
                        </Tooltip>
                        <Tooltip title="复制">
                            <Button icon={<CopyOutlined />} disabled={!state.selectedId} onClick={handleCopy} />
                        </Tooltip>
                        <Tooltip title="删除">
                            <Button
                                icon={<DeleteOutlined />}
                                disabled={!state.selectedId && !(state.selectedIds || []).length}
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
                    <Tooltip title="设置">
                        <Button icon={<SettingOutlined />} onClick={handleOpenSettings}>设置</Button>
                    </Tooltip>
                    <Tooltip title="预览">
                        <Button icon={<EyeOutlined />} onClick={() => navigate('/preview')}>预览</Button>
                    </Tooltip>
                    <Button type="primary" icon={<SaveOutlined />}>
                        保存
                    </Button>
                    <Tooltip title="GitHub">
                        <Button
                            icon={<GithubOutlined />}
                            onClick={() => window.open('https://github.com/UvDream/VisualizationDashboard', '_blank')}
                        />
                    </Tooltip>
                </Space>
            </div>

            <Modal
                title="画布设置"
                open={isModalOpen}
                onOk={handleSaveSettings}
                onCancel={() => setIsModalOpen(false)}
                okText="确认"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="大屏名称" rules={[{ required: true, message: '请输入大屏名称' }]}>
                        <Input placeholder="请输入大屏名称" />
                    </Form.Item>
                    <Space>
                        <Form.Item name="width" label="宽度 (px)" rules={[{ required: true }]}>
                            <InputNumber min={100} max={10000} />
                        </Form.Item>
                        <Form.Item name="height" label="高度 (px)" rules={[{ required: true }]}>
                            <InputNumber min={100} max={10000} />
                        </Form.Item>
                    </Space>
                    <Form.Item name="backgroundColor" label="背景颜色" rules={[{ required: true }]}>
                        <ColorPicker showText format="hex" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
