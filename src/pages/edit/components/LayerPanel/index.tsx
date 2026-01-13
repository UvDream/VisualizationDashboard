import { EyeOutlined, EyeInvisibleOutlined, LockOutlined, UnlockOutlined, DeleteOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { useEditor } from '../../context/EditorContext'
import './index.less'

export default function LayerPanel() {
    const { state, selectComponent, deleteComponent, toggleVisibility, toggleLock, reorderLayers } = useEditor()

    // 图层列表（倒序显示，最上面的图层在列表最前面）
    const layers = [...state.components].reverse()

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

        const newLayers = [...layers]
        const [removed] = newLayers.splice(sourceIndex, 1)
        newLayers.splice(targetIndex, 0, removed)

        // 反转回原来的顺序
        reorderLayers([...newLayers].reverse())
    }

    const handleLayerClick = (id: string) => {
        selectComponent(id)
    }

    return (
        <div className="layer-panel">
            <div className="layer-panel-header">图层</div>
            <div className="layer-panel-list">
                {layers.length === 0 ? (
                    <div className="layer-panel-empty">暂无图层</div>
                ) : (
                    layers.map((item, index) => (
                        <div
                            key={item.id}
                            className={`layer-item ${state.selectedId === item.id ? 'selected' : ''} ${!item.visible ? 'hidden' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, index)}
                            onClick={() => handleLayerClick(item.id)}
                        >
                            <span className="layer-item-name">{item.name}</span>
                            <div className="layer-item-actions">
                                <Tooltip title={item.visible ? '隐藏' : '显示'}>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={item.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleVisibility(item.id)
                                        }}
                                    />
                                </Tooltip>
                                <Tooltip title={item.locked ? '解锁' : '锁定'}>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={item.locked ? <LockOutlined /> : <UnlockOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            toggleLock(item.id)
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
                                            deleteComponent(item.id)
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
