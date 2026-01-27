import { useState, useRef } from 'react'
import { Button, Tooltip, Space, Slider, Modal, Form, Input, InputNumber, ColorPicker, Upload, Select, message, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import {
    SaveOutlined,
    EyeOutlined,
    UndoOutlined,
    RedoOutlined,
    DeleteOutlined,
    CopyOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    SettingOutlined,
    UploadOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    AppstoreOutlined,
    BarsOutlined,
    ControlOutlined,
    MoreOutlined,
    QuestionCircleOutlined,
    ExportOutlined,
    ImportOutlined,
    FileTextOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useEditor } from '../../context/EditorContext'
import { exportProject, importProject as importProjectUtil, exportAsTemplate, exportSelectedComponents } from '../../utils/importExport'
import './index.less'

export default function Toolbar() {
    const navigate = useNavigate()

    const { state, deleteComponent, deleteComponents, setScale, undo, redo, canUndo, canRedo, setCanvasConfig, copyComponent, toggleZenMode, togglePanel, importProject } = useEditor()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showShortcuts, setShowShortcuts] = useState(false)
    const [templateModalOpen, setTemplateModalOpen] = useState(false)
    const [form] = Form.useForm()
    const [templateForm] = Form.useForm()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDelete = () => {
        const selectedIds = state.selectedIds || []
        if (selectedIds.length > 1) {
            deleteComponents(selectedIds)
        } else if (state.selectedId) {
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

    const handleFitToScreen = () => {
        // 计算适合屏幕的缩放比例
        const container = document.querySelector('.canvas-container')
        if (container) {
            const containerRect = container.getBoundingClientRect()
            const scaleX = (containerRect.width - 40) / (state.canvasConfig?.width || 1920)
            const scaleY = (containerRect.height - 40) / (state.canvasConfig?.height || 1080)
            const scale = Math.min(scaleX, scaleY, 1.0)
            setScale(parseFloat(scale.toFixed(2)))
        }
    }

    const handleToggleZenMode = () => {
        toggleZenMode(!state.zenMode)
    }

    const handleOpenSettings = () => {
        form.setFieldsValue({
            name: state.canvasConfig?.name,
            width: state.canvasConfig?.width,
            height: state.canvasConfig?.height,
            backgroundColor: state.canvasConfig?.backgroundColor,
            backgroundType: state.canvasConfig?.backgroundType || 'color',
            backgroundImage: state.canvasConfig?.backgroundImage,
            backgroundImageMode: state.canvasConfig?.backgroundImageMode || 'cover',
            backgroundImageOpacity: state.canvasConfig?.backgroundImageOpacity || 1,
        })
        setIsModalOpen(true)
    }

    const handleSaveSettings = () => {
        form.validateFields().then((values) => {
            const { name, width, height, backgroundColor, backgroundType, backgroundImage, backgroundImageMode, backgroundImageOpacity } = values
            const bgStr = backgroundColor && typeof backgroundColor === 'string' ? backgroundColor : backgroundColor?.toHexString()

            setCanvasConfig({
                name,
                width,
                height,
                backgroundColor: backgroundType === 'color' ? bgStr : '#000000',
                backgroundType,
                backgroundImage: backgroundType === 'image' ? backgroundImage : undefined,
                backgroundImageMode,
                backgroundImageOpacity,
            })
            setIsModalOpen(false)
        })
    }

    // 导出项目
    const handleExportProject = () => {
        exportProject(state, state.canvasConfig.name)
    }

    // 导入项目
    const handleImportProject = () => {
        fileInputRef.current?.click()
    }

    // 处理文件选择
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            if (file.type !== 'application/json') {
                message.error('请选择 JSON 格式的项目文件')
                return
            }
            
            importProjectUtil(file, (data) => {
                importProject(data)
            })
        }
        // 清空文件输入，允许重复选择同一文件
        event.target.value = ''
    }

    // 保存为模板
    const handleSaveAsTemplate = () => {
        if (state.components.length === 0) {
            message.warning('当前画布没有组件，无法保存为模板')
            return
        }
        setTemplateModalOpen(true)
    }

    // 确认保存模板
    const handleConfirmSaveTemplate = () => {
        templateForm.validateFields().then((values) => {
            const { templateName } = values
            exportAsTemplate(state.components, templateName)
            setTemplateModalOpen(false)
            templateForm.resetFields()
        })
    }

    // 导出选中组件
    const handleExportSelected = () => {
        const selectedIds = state.selectedIds || []
        if (selectedIds.length === 0) {
            message.warning('请先选择要导出的组件')
            return
        }
        
        const selectedComponents = state.components.filter(comp => selectedIds.includes(comp.id))
        exportSelectedComponents(selectedComponents, '选中组件')
    }

    const handleImageUpload = (file: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const base64 = e.target?.result as string
            form.setFieldValue('backgroundImage', base64)
            message.success('背景图片上传成功')
        }
        reader.readAsDataURL(file)
        return false
    }

    // 更多操作菜单
    const moreMenuItems: MenuProps['items'] = [
        {
            key: 'export',
            icon: <ExportOutlined />,
            label: '导出项目',
            onClick: handleExportProject
        },
        {
            key: 'import',
            icon: <ImportOutlined />,
            label: '导入项目',
            onClick: handleImportProject
        },
        {
            key: 'exportSelected',
            icon: <ExportOutlined />,
            label: '导出选中组件',
            onClick: handleExportSelected,
            disabled: !state.selectedIds || state.selectedIds.length === 0
        },
        {
            type: 'divider',
        },
        {
            key: 'template',
            icon: <FileTextOutlined />,
            label: '保存为模板',
            onClick: handleSaveAsTemplate
        },
        {
            type: 'divider',
        },
        {
            key: 'shortcuts',
            icon: <QuestionCircleOutlined />,
            label: '快捷键帮助',
            onClick: () => setShowShortcuts(true)
        },
    ]

    return (
        <>
            <div className="toolbar">
                <div className="toolbar-left">
                    <span className="toolbar-title">{state.canvasConfig?.name || '可视化大屏编辑器'}</span>
                </div>
                
                <div className="toolbar-center">
                    <div className="toolbar-group">
                        <span className="toolbar-group-label">编辑</span>
                        <Space size="small">
                            <Tooltip title="撤销 (Ctrl+Z)">
                                <Button 
                                    icon={<UndoOutlined />} 
                                    disabled={!canUndo} 
                                    onClick={undo}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="重做 (Ctrl+Y)">
                                <Button 
                                    icon={<RedoOutlined />} 
                                    disabled={!canRedo} 
                                    onClick={redo}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="复制 (Ctrl+C)">
                                <Button 
                                    icon={<CopyOutlined />} 
                                    disabled={!state.selectedId} 
                                    onClick={handleCopy}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title="删除 (Delete)">
                                <Button
                                    icon={<DeleteOutlined />}
                                    disabled={!state.selectedId && !(state.selectedIds || []).length}
                                    onClick={handleDelete}
                                    size="small"
                                    danger
                                />
                            </Tooltip>
                        </Space>
                    </div>

                    <div className="toolbar-divider" />

                    <div className="toolbar-group">
                        <span className="toolbar-group-label">面板</span>
                        <Space size="small">
                            <Tooltip title={state.showComponentPanel ? "隐藏组件库" : "显示组件库"}>
                                <Button
                                    icon={<AppstoreOutlined />}
                                    onClick={() => togglePanel('component')}
                                    type={state.showComponentPanel ? "primary" : "default"}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title={state.showLayerPanel ? "隐藏图层" : "显示图层"}>
                                <Button
                                    icon={<BarsOutlined />}
                                    onClick={() => togglePanel('layer')}
                                    type={state.showLayerPanel ? "primary" : "default"}
                                    size="small"
                                />
                            </Tooltip>
                            <Tooltip title={state.showPropertyPanel ? "隐藏属性" : "显示属性"}>
                                <Button
                                    icon={<ControlOutlined />}
                                    onClick={() => togglePanel('property')}
                                    type={state.showPropertyPanel ? "primary" : "default"}
                                    size="small"
                                />
                            </Tooltip>
                        </Space>
                    </div>

                    <div className="toolbar-divider" />

                    <div className="toolbar-group">
                        <span className="toolbar-group-label">视图</span>
                        <Space size="small" align="center">
                            <Tooltip title="缩小">
                                <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} size="small" />
                            </Tooltip>
                            
                            <div className="zoom-control">
                                <Slider
                                    min={0.2}
                                    max={2.0}
                                    step={0.1}
                                    value={state.scale}
                                    onChange={setScale}
                                    style={{ width: 80 }}
                                    tooltip={{ formatter: null }}
                                />
                                <span className="zoom-percentage">{Math.round(state.scale * 100)}%</span>
                            </div>
                            
                            <Tooltip title="放大">
                                <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} size="small" />
                            </Tooltip>
                            
                            <Tooltip title="适合屏幕">
                                <Button onClick={handleFitToScreen} size="small">适合</Button>
                            </Tooltip>
                            
                            <Tooltip title="100%">
                                <Button onClick={handleResetZoom} size="small">100%</Button>
                            </Tooltip>
                            
                            <Tooltip title={state.zenMode ? "退出专注模式 (F11)" : "专注模式 (F11)"}>
                                <Button
                                    icon={state.zenMode ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                                    onClick={handleToggleZenMode}
                                    type={state.zenMode ? "primary" : "default"}
                                    size="small"
                                />
                            </Tooltip>
                        </Space>
                    </div>
                </div>
                
                <div className="toolbar-right">
                    <Space size="small">
                        <Tooltip title="画布设置">
                            <Button icon={<SettingOutlined />} onClick={handleOpenSettings} size="small">
                                设置
                            </Button>
                        </Tooltip>
                        <Tooltip title="预览大屏">
                            <Button icon={<EyeOutlined />} onClick={() => navigate('/preview')} size="small">
                                预览
                            </Button>
                        </Tooltip>
                        <Button type="primary" icon={<SaveOutlined />} size="small">
                            保存
                        </Button>
                        <Dropdown menu={{ items: moreMenuItems }} placement="bottomRight">
                            <Button icon={<MoreOutlined />} size="small" />
                        </Dropdown>
                    </Space>
                </div>
            </div>

            {/* 快捷键帮助弹窗 */}
            <Modal
                title="快捷键帮助"
                open={showShortcuts}
                onCancel={() => setShowShortcuts(false)}
                footer={[
                    <Button key="close" onClick={() => setShowShortcuts(false)}>
                        关闭
                    </Button>
                ]}
                width={500}
            >
                <div className="shortcuts-help">
                    <div className="shortcut-section">
                        <h4>编辑操作</h4>
                        <div className="shortcut-item">
                            <span className="shortcut-key">Ctrl + Z</span>
                            <span>撤销</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">Ctrl + Y</span>
                            <span>重做</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">Ctrl + C</span>
                            <span>复制组件</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">Delete / Backspace</span>
                            <span>删除组件</span>
                        </div>
                    </div>
                    
                    <div className="shortcut-section">
                        <h4>视图控制</h4>
                        <div className="shortcut-item">
                            <span className="shortcut-key">F11</span>
                            <span>切换专注模式</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">Ctrl + 滚轮</span>
                            <span>缩放画布</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">空格 + 拖拽</span>
                            <span>平移画布</span>
                        </div>
                    </div>
                    
                    <div className="shortcut-section">
                        <h4>选择操作</h4>
                        <div className="shortcut-item">
                            <span className="shortcut-key">Ctrl + 点击</span>
                            <span>多选组件</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">拖拽框选</span>
                            <span>框选多个组件</span>
                        </div>
                        <div className="shortcut-item">
                            <span className="shortcut-key">Esc</span>
                            <span>取消选择</span>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* 画布设置弹窗 */}
            <Modal
                title="画布设置"
                open={isModalOpen}
                onOk={handleSaveSettings}
                onCancel={() => setIsModalOpen(false)}
                okText="确认"
                cancelText="取消"
                width={600}
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
                    <Form.Item name="backgroundType" label="背景类型" rules={[{ required: true }]}>
                        <Select
                            options={[
                                { value: 'color', label: '纯色背景' },
                                { value: 'image', label: '背景图片' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.backgroundType !== currentValues.backgroundType}>
                        {({ getFieldValue }) => {
                            const backgroundType = getFieldValue('backgroundType')

                            if (backgroundType === 'color') {
                                return (
                                    <Form.Item name="backgroundColor" label="背景颜色" rules={[{ required: true }]}>
                                        <ColorPicker showText format="hex" />
                                    </Form.Item>
                                )
                            }

                            if (backgroundType === 'image') {
                                return (
                                    <>
                                        <Form.Item name="backgroundImage" label="背景图片URL" rules={[{ required: true, message: '请输入背景图片URL' }]}>
                                            <Input placeholder="请输入图片URL，如：https://example.com/image.jpg" />
                                        </Form.Item>

                                        <Form.Item label="或上传本地图片">
                                            <Upload
                                                accept="image/*"
                                                beforeUpload={handleImageUpload}
                                                showUploadList={false}
                                            >
                                                <Button icon={<UploadOutlined />}>上传图片</Button>
                                            </Upload>
                                        </Form.Item>

                                        <Form.Item name="backgroundImageMode" label="背景图片模式">
                                            <Select
                                                options={[
                                                    { value: 'tile', label: '平铺 - 重复显示图片' },
                                                    { value: 'stretch', label: '拉伸 - 拉伸填满画布' },
                                                    { value: 'cover', label: '填充 - 保持比例填满画布' },
                                                    { value: 'contain', label: '适应 - 保持比例完整显示' },
                                                    { value: 'center', label: '居中 - 原始大小居中显示' },
                                                ]}
                                            />
                                        </Form.Item>

                                        <Form.Item name="backgroundImageOpacity" label="背景图片透明度">
                                            <Slider
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                marks={{
                                                    0: '0%',
                                                    0.5: '50%',
                                                    1: '100%'
                                                }}
                                            />
                                        </Form.Item>
                                    </>
                                )
                            }
                            return null
                        }}
                    </Form.Item>
                </Form>
            </Modal>

            {/* 隐藏的文件输入用于导入项目 */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* 保存为模板模态框 */}
            <Modal
                title="保存为模板"
                open={templateModalOpen}
                onOk={handleConfirmSaveTemplate}
                onCancel={() => {
                    setTemplateModalOpen(false)
                    templateForm.resetFields()
                }}
                okText="保存"
                cancelText="取消"
            >
                <Form form={templateForm} layout="vertical">
                    <Form.Item
                        name="templateName"
                        label="模板名称"
                        rules={[
                            { required: true, message: '请输入模板名称' },
                            { min: 2, message: '模板名称至少2个字符' },
                            { max: 50, message: '模板名称不能超过50个字符' }
                        ]}
                    >
                        <Input placeholder="请输入模板名称，如：数据大屏模板" />
                    </Form.Item>
                    <div style={{ color: '#666', fontSize: '12px', marginTop: '-16px', marginBottom: '16px' }}>
                        将保存当前画布中的 {state.components.length} 个组件为模板文件
                    </div>
                </Form>
            </Modal>
        </>
    )
}
