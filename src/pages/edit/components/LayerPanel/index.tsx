import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, UnlockOutlined, DeleteOutlined, GroupOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { useEditor } from '../../context/EditorContext'
import type { ComponentItem } from '../../types'
import './index.less'

export default function LayerPanel() {
    const { state, selectComponent, selectComponents, deleteComponent, toggleVisibility, toggleLock, reorderLayers, ungroupComponents } = useEditor()

    // 将组件按组合分组
    const groupedComponents = new Map<string, ComponentItem[]>()
    const ungroupedComponents: ComponentItem[] = []

    state.components.forEach(comp => {
        if (comp.groupId) {
            if (!groupedComponents.has(comp.groupId)) {
                groupedComponents.set(comp.groupId, [])
            }
            groupedComponents.get(comp.groupId)!.push(comp)
        } else {
            ungroupedComponents.push(comp)
        }
    })

    // 构建显示列表（倒序显示）
    const displayItems: Array<{ type: 'component' | 'group'; data: ComponentItem | ComponentItem[] }> = []
    
    // 添加未组合的组件
    ungroupedComponents.forEach(comp => {
        displayItems.push({ type: 'component', data: comp })
    })
    
    // 添加组合
    groupedComponents.forEach(components => {
        displayItems.push({ type: 'group', data: components })
    })
    
    // 倒序显示
    const layers = displayItems.reverse()

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('layerIndex', String(index))
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault()
        const sourceIndex = parseInt(e.dataTransfer.getData('layerIndex'))

        if (sourceIndex === targetIndex) return

        // TODO: 实现拖拽排序逻辑
        // 需要考虑组合的情况
    }

    const handleLayerClick = (id: string, groupId?: string) => {
        if (groupId) {
            // 点击组合，选中整个组合
            const groupComponents = state.components
                .filter(comp => comp.groupId === groupId)
                .map(comp => comp.id)
            selectComponents(groupComponents)
        } else {
            selectComponent(id)
        }
    }

    const handleGroupClick = (groupId: string) => {
        // 选中整个组合
        const groupComponents = state.components
            .filter(comp => comp.groupId === groupId)
            .map(comp => comp.id)
        selectComponents(groupComponents)
    }

    const isGroupSelected = (groupId: string) => {
        const groupComponentIds = state.components
            .filter(comp => comp.groupId === groupId)
            .map(comp => comp.id)
        return groupComponentIds.every(id => state.selectedIds.includes(id))
    }

    return (
        <div className="layer-panel">
            <div className="layer-panel-header">图层</div>
            <div className="layer-panel-list">
                {layers.length === 0 ? (
                    <div className="layer-panel-empty">暂无图层</div>
                ) : (
                    layers.map((item, index) => {
                        if (item.type === 'group') {
                            const components = item.data as ComponentItem[]
                            const groupId = components[0].groupId!
                            const mainComponent = components.find(c => c.isGroup) || components[0]
                            const isSelected = isGroupSelected(groupId)
                            const allVisible = components.every(c => c.visible)
                            const allLocked = components.every(c => c.locked)

                            return (
                                <div
                                    key={groupId}
                                    className={`layer-item layer-group ${isSelected ? 'selected' : ''} ${!allVisible ? 'hidden' : ''}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onClick={() => handleGroupClick(groupId)}
                                >
                                    <GroupOutlined className="layer-group-icon" />
                                    <span className="layer-item-name">
                                        组合 ({components.length}个组件)
                                    </span>
                                    <div className="layer-item-actions">
                                        <Tooltip title="取消组合">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<GroupOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    ungroupComponents(mainComponent.id)
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title={allVisible ? '隐藏' : '显示'}>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={allVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    components.forEach(comp => toggleVisibility(comp.id))
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title={allLocked ? '解锁' : '锁定'}>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={allLocked ? <LockOutlined /> : <UnlockOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    components.forEach(comp => toggleLock(comp.id))
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="删除">
                                            <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteComponent(mainComponent.id)
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            )
                        } else {
                            const component = item.data as ComponentItem
                            return (
                                <div
                                    key={component.id}
                                    className={`layer-item ${state.selectedIds.includes(component.id) ? 'selected' : ''} ${!component.visible ? 'hidden' : ''}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    onClick={() => handleLayerClick(component.id)}
                                >
                                    <span className="layer-item-name">{component.name}</span>
                                    <div className="layer-item-actions">
                                        <Tooltip title={component.visible ? '隐藏' : '显示'}>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={component.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleVisibility(component.id)
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title={component.locked ? '解锁' : '锁定'}>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={component.locked ? <LockOutlined /> : <UnlockOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleLock(component.id)
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="删除">
                                            <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteComponent(component.id)
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            )
                        }
                    })
                )}
            </div>
        </div>
    )
}
