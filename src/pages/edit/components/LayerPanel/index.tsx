import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, UnlockOutlined, DeleteOutlined, CaretRightOutlined, CaretDownOutlined, GroupOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { useState } from 'react'
import { useEditor } from '../../context/EditorContext'
import type { ComponentItem } from '../../types'
import './index.less'

export default function LayerPanel() {
    const { state, selectComponent, selectComponents, deleteComponent, toggleVisibility, toggleLock, ungroupComponents } = useEditor()
    const [expandedLayouts, setExpandedLayouts] = useState<Set<string>>(new Set())
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

    // 构建层级结构
    const buildHierarchy = () => {
        const rootComponents: ComponentItem[] = []
        const childrenMap = new Map<string, ComponentItem[]>()
        const groupedComponents = new Map<string, ComponentItem[]>()

        // 分离根组件、子组件和组合组件
        state.components.forEach(comp => {
            if (comp.groupId) {
                // 这是组合中的组件
                if (!groupedComponents.has(comp.groupId)) {
                    groupedComponents.set(comp.groupId, [])
                }
                groupedComponents.get(comp.groupId)!.push(comp)
            } else if (comp.parentId) {
                // 这是布局组件的子组件
                if (!childrenMap.has(comp.parentId)) {
                    childrenMap.set(comp.parentId, [])
                }
                childrenMap.get(comp.parentId)!.push(comp)
            } else {
                // 这是根组件
                rootComponents.push(comp)
            }
        })

        // 对子组件按 cellIndex 排序
        childrenMap.forEach(children => {
            children.sort((a, b) => (a.cellIndex || 0) - (b.cellIndex || 0))
        })

        return { rootComponents, childrenMap, groupedComponents }
    }

    const { rootComponents, childrenMap, groupedComponents } = buildHierarchy()

    const toggleLayoutExpanded = (layoutId: string) => {
        const newExpanded = new Set(expandedLayouts)
        if (newExpanded.has(layoutId)) {
            newExpanded.delete(layoutId)
        } else {
            newExpanded.add(layoutId)
        }
        setExpandedLayouts(newExpanded)
    }

    const toggleGroupExpanded = (groupId: string) => {
        const newExpanded = new Set(expandedGroups)
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId)
        } else {
            newExpanded.add(groupId)
        }
        setExpandedGroups(newExpanded)
    }

    const isLayoutComponent = (type: string) => {
        return ['layoutTwoColumn', 'layoutThreeColumn', 'layoutHeader', 'layoutSidebar'].includes(type)
    }

    const getCellLabel = (parentComponent: ComponentItem, cellIndex: number) => {
        const direction = parentComponent.props.layoutConfig?.direction
        const type = parentComponent.type
        
        if (type === 'layoutTwoColumn') {
            return direction === 'vertical' ? (cellIndex === 0 ? '上方' : '下方') : (cellIndex === 0 ? '左栏' : '右栏')
        } else if (type === 'layoutThreeColumn') {
            if (direction === 'vertical') {
                return ['上方', '中间', '下方'][cellIndex] || `栏${cellIndex + 1}`
            } else {
                return ['左栏', '中栏', '右栏'][cellIndex] || `栏${cellIndex + 1}`
            }
        } else if (type === 'layoutHeader') {
            return direction === 'horizontal' ? (cellIndex === 0 ? '侧栏' : '内容区') : (cellIndex === 0 ? '头部' : '内容区')
        } else if (type === 'layoutSidebar') {
            return direction === 'vertical' ? (cellIndex === 0 ? '头部' : '内容区') : (cellIndex === 0 ? '侧栏' : '内容区')
        }
        return `栏${cellIndex + 1}`
    }

    const isGroupSelected = (groupId: string) => {
        const groupComponentIds = groupedComponents.get(groupId)?.map(comp => comp.id) || []
        return groupComponentIds.length > 0 && groupComponentIds.every(id => state.selectedIds.includes(id))
    }

    const handleGroupClick = (groupId: string) => {
        const groupComponentIds = groupedComponents.get(groupId)?.map(comp => comp.id) || []
        selectComponents(groupComponentIds)
    }

    const renderGroupItem = (groupId: string, components: ComponentItem[], level: number = 0) => {
        const isSelected = isGroupSelected(groupId)
        const isExpanded = expandedGroups.has(groupId)
        const allVisible = components.every(c => c.visible)
        const allLocked = components.every(c => c.locked)
        const mainComponent = components.find(c => c.isGroup) || components[0]

        return (
            <div key={groupId}>
                <div
                    className={`layer-item layer-group ${isSelected ? 'selected' : ''} ${!allVisible ? 'hidden' : ''}`}
                    style={{ paddingLeft: level * 20 + 12 }}
                    onClick={() => handleGroupClick(groupId)}
                >
                    <div className="layer-item-content">
                        <Button
                            type="text"
                            size="small"
                            icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleGroupExpanded(groupId)
                            }}
                            className="layer-expand-btn"
                        />
                        <GroupOutlined className="layer-group-icon" />
                        <span className="layer-item-name">
                            组合 ({components.length}个组件)
                        </span>
                    </div>
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
                
                {/* 渲染组合内的组件 */}
                {isExpanded && (
                    <div className="layer-children">
                        {components.map(component => renderLayerItem(component, level + 1, true))}
                    </div>
                )}
            </div>
        )
    }

    const renderLayerItem = (component: ComponentItem, level: number = 0, isInGroup: boolean = false) => {
        const isSelected = state.selectedIds.includes(component.id)
        const children = childrenMap.get(component.id) || []
        const hasChildren = children.length > 0
        const isExpanded = expandedLayouts.has(component.id)
        const isLayout = isLayoutComponent(component.type)

        return (
            <div key={component.id}>
                <div
                    className={`layer-item ${isSelected ? 'selected' : ''} ${!component.visible ? 'hidden' : ''} ${isInGroup ? 'in-group' : ''}`}
                    style={{ paddingLeft: level * 20 + 12 }}
                    onClick={() => selectComponent(component.id)}
                >
                    <div className="layer-item-content">
                        {isLayout && hasChildren ? (
                            <Button
                                type="text"
                                size="small"
                                icon={isExpanded ? <CaretDownOutlined /> : <CaretRightOutlined />}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleLayoutExpanded(component.id)
                                }}
                                className="layer-expand-btn"
                            />
                        ) : (
                            <div className="layer-expand-placeholder" />
                        )}
                        <span className="layer-item-name">
                            {component.name}
                            {isLayout && hasChildren && (
                                <span className="layer-children-count"> ({children.length})</span>
                            )}
                        </span>
                    </div>
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
                
                {/* 渲染子组件 */}
                {isLayout && hasChildren && isExpanded && (
                    <div className="layer-children">
                        {children.map(child => (
                            <div key={child.id} className="layer-child-item">
                                <div
                                    className={`layer-item ${state.selectedIds.includes(child.id) ? 'selected' : ''} ${!child.visible ? 'hidden' : ''}`}
                                    style={{ paddingLeft: (level + 1) * 20 + 12 }}
                                    onClick={() => selectComponent(child.id)}
                                >
                                    <div className="layer-item-content">
                                        <div className="layer-expand-placeholder" />
                                        <span className="layer-cell-label">
                                            {getCellLabel(component, child.cellIndex || 0)}:
                                        </span>
                                        <span className="layer-item-name">{child.name}</span>
                                    </div>
                                    <div className="layer-item-actions">
                                        <Tooltip title={child.visible ? '隐藏' : '显示'}>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={child.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleVisibility(child.id)
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title={child.locked ? '解锁' : '锁定'}>
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={child.locked ? <LockOutlined /> : <UnlockOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleLock(child.id)
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
                                                    deleteComponent(child.id)
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                                {/* 如果子组件也是布局组件，递归渲染 */}
                                {isLayoutComponent(child.type) && childrenMap.has(child.id) && (
                                    renderLayerItem(child, level + 2)
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // 构建显示列表
    const displayItems: Array<{ type: 'component' | 'group'; data: ComponentItem | string }> = []
    
    // 添加未组合的根组件
    rootComponents.forEach(comp => {
        displayItems.push({ type: 'component', data: comp })
    })
    
    // 添加组合
    groupedComponents.forEach((_, groupId) => {
        displayItems.push({ type: 'group', data: groupId })
    })
    
    // 倒序显示（最后添加的在上面）
    const sortedDisplayItems = displayItems.reverse()

    return (
        <div className="layer-panel">
            <div className="layer-panel-header">图层</div>
            <div className="layer-panel-list">
                {sortedDisplayItems.length === 0 ? (
                    <div className="layer-panel-empty">暂无图层</div>
                ) : (
                    sortedDisplayItems.map((item) => {
                        if (item.type === 'group') {
                            const groupId = item.data as string
                            const groupComponents = groupedComponents.get(groupId)!
                            return renderGroupItem(groupId, groupComponents)
                        } else {
                            const component = item.data as ComponentItem
                            return renderLayerItem(component)
                        }
                    })
                )}
            </div>
        </div>
    )
}
