import { useState } from 'react'
import { Card, Button, Space, Typography, Steps, Alert, Divider } from 'antd'
import { PlayCircleOutlined, UndoOutlined, RedoOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useEditor } from '../../context/EditorContext'
import { useHistory } from '../../hooks/useHistory'
import type { ComponentItem } from '../../types'
import './index.less'

const { Title, Paragraph, Text } = Typography

/**
 * 历史记录功能演示组件
 * 用于展示和测试历史记录功能
 */
export default function HistoryDemo() {
    const { addComponent, deleteComponent, updateComponent, state } = useEditor()
    const { undo, redo, canUndo, canRedo, historyStats } = useHistory()
    const [currentStep, setCurrentStep] = useState(0)

    // 演示步骤
    const demoSteps = [
        {
            title: '添加组件',
            description: '添加一个文本组件到画布',
            action: () => {
                const newComponent: ComponentItem = {
                    id: `demo_text_${Date.now()}`,
                    type: 'text',
                    name: '演示文本',
                    props: {
                        content: '这是一个演示文本组件',
                        textAlign: 'center'
                    },
                    style: {
                        x: 100,
                        y: 100,
                        width: 200,
                        height: 50,
                        backgroundColor: '#1890ff',
                        color: '#ffffff',
                        fontSize: 16,
                        borderRadius: 4,
                        zIndex: 1
                    },
                    visible: true,
                    locked: false
                }
                addComponent(newComponent)
            }
        },
        {
            title: '修改组件',
            description: '修改组件的样式属性',
            action: () => {
                const lastComponent = state.components[state.components.length - 1]
                if (lastComponent) {
                    updateComponent(lastComponent.id, {
                        style: {
                            ...lastComponent.style,
                            backgroundColor: '#52c41a',
                            width: 250,
                            height: 60
                        }
                    })
                }
            }
        },
        {
            title: '移动组件',
            description: '移动组件到新位置',
            action: () => {
                const lastComponent = state.components[state.components.length - 1]
                if (lastComponent) {
                    updateComponent(lastComponent.id, {
                        style: {
                            ...lastComponent.style,
                            x: 200,
                            y: 200
                        }
                    })
                }
            }
        },
        {
            title: '删除组件',
            description: '删除刚才创建的组件',
            action: () => {
                const lastComponent = state.components[state.components.length - 1]
                if (lastComponent && lastComponent.id.startsWith('demo_text_')) {
                    deleteComponent(lastComponent.id)
                }
            }
        }
    ]

    const executeStep = (stepIndex: number) => {
        if (stepIndex < demoSteps.length) {
            demoSteps[stepIndex].action()
            setCurrentStep(stepIndex + 1)
        }
    }

    const resetDemo = () => {
        // 删除所有演示组件
        const demoComponents = state.components.filter(comp => comp.id.startsWith('demo_text_'))
        demoComponents.forEach(comp => deleteComponent(comp.id))
        setCurrentStep(0)
    }

    return (
        <div className="history-demo">
            <Card title="历史记录功能演示" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                    {/* 当前状态 */}
                    <Alert
                        message="当前状态"
                        description={
                            <Space direction="vertical" size="small">
                                <Text>组件数量: {historyStats.componentsCount}</Text>
                                <Text>可撤销: {historyStats.canUndo ? '是' : '否'}</Text>
                                <Text>可重做: {historyStats.canRedo ? '是' : '否'}</Text>
                            </Space>
                        }
                        type="info"
                        showIcon
                    />

                    {/* 演示步骤 */}
                    <div>
                        <Title level={5}>演示步骤</Title>
                        <Steps
                            current={currentStep}
                            direction="vertical"
                            size="small"
                            items={demoSteps.map((step, index) => ({
                                title: step.title,
                                description: step.description,
                                status: index < currentStep ? 'finish' : 
                                       index === currentStep ? 'process' : 'wait'
                            }))}
                        />
                    </div>

                    <Divider />

                    {/* 操作按钮 */}
                    <div>
                        <Title level={5}>操作控制</Title>
                        <Space wrap>
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={() => executeStep(currentStep)}
                                disabled={currentStep >= demoSteps.length}
                            >
                                执行下一步
                            </Button>
                            
                            <Button
                                icon={<UndoOutlined />}
                                onClick={undo}
                                disabled={!canUndo}
                            >
                                撤销
                            </Button>
                            
                            <Button
                                icon={<RedoOutlined />}
                                onClick={redo}
                                disabled={!canRedo}
                            >
                                重做
                            </Button>
                            
                            <Button onClick={resetDemo}>
                                重置演示
                            </Button>
                        </Space>
                    </div>

                    {/* 快捷操作 */}
                    <div>
                        <Title level={5}>快捷操作</Title>
                        <Space wrap>
                            <Button
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => executeStep(0)}
                            >
                                快速添加组件
                            </Button>
                            
                            <Button
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                    const demoComponent = state.components.find(comp => 
                                        comp.id.startsWith('demo_text_')
                                    )
                                    if (demoComponent) {
                                        deleteComponent(demoComponent.id)
                                    }
                                }}
                                disabled={!state.components.some(comp => comp.id.startsWith('demo_text_'))}
                            >
                                删除演示组件
                            </Button>
                        </Space>
                    </div>

                    {/* 使用提示 */}
                    <Alert
                        message="使用提示"
                        description={
                            <div>
                                <Paragraph style={{ margin: 0, fontSize: '12px' }}>
                                    • 使用 <Text code>Ctrl+Z</Text> 撤销操作
                                </Paragraph>
                                <Paragraph style={{ margin: 0, fontSize: '12px' }}>
                                    • 使用 <Text code>Ctrl+Y</Text> 重做操作
                                </Paragraph>
                                <Paragraph style={{ margin: 0, fontSize: '12px' }}>
                                    • 历史记录会自动保存到本地存储
                                </Paragraph>
                            </div>
                        }
                        type="success"
                        showIcon
                    />
                </Space>
            </Card>
        </div>
    )
}