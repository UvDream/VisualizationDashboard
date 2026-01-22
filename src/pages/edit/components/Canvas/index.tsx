import { useRef, useState, useEffect } from 'react'
import { useDrop } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import { Button, Slider, Tooltip } from 'antd'
import { ZoomInOutlined, ZoomOutOutlined, ReloadOutlined, FullscreenExitOutlined } from '@ant-design/icons'
import { useEditor } from '../../context/EditorContext'
import Ruler from '../Ruler'
import type { ComponentType, ComponentItem } from '../../types'
import { defaultConfigs } from '../../config/defaultConfigs'
import CanvasItem from './CanvasItem'
import './index.less'

interface CanvasProps {
    previewMode?: boolean
}

export default function Canvas({ previewMode = false }: CanvasProps) {
    const { state, addComponent, selectComponent, selectComponents, deleteComponent, deleteComponents, bringForward, sendBackward, bringToFront, sendToBack, groupComponents, ungroupComponents, setScale, toggleZenMode } = useEditor()
    const customCanvasRef = useRef<HTMLDivElement>(null)
    const [previewScale, setPreviewScale] = useState(1)

    // 预览模式下计算自适应缩放
    useEffect(() => {
        if (previewMode) {
            const calculatePreviewScale = () => {
                const canvasWidth = state.canvasConfig?.width || 1920
                const canvasHeight = state.canvasConfig?.height || 1080
                const windowWidth = window.innerWidth
                const windowHeight = window.innerHeight
                
                // 计算缩放比例，保持宽高比
                const scaleX = windowWidth / canvasWidth
                const scaleY = windowHeight / canvasHeight
                const scale = Math.min(scaleX, scaleY, 1) // 最大不超过1
                
                setPreviewScale(scale)
            }

            calculatePreviewScale()
            window.addEventListener('resize', calculatePreviewScale)
            
            return () => {
                window.removeEventListener('resize', calculatePreviewScale)
            }
        }
    }, [previewMode, state.canvasConfig?.width, state.canvasConfig?.height])

    // 右键菜单状态
    const [menuVisible, setMenuVisible] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

    // 框选状态
    const [isSelecting, setIsSelecting] = useState(false)
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 })
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 })
    const [hasSelectedByBox, setHasSelectedByBox] = useState(false) // 标记是否通过框选选中了组件

    // 键盘事件监听 - 删除选中组件
    useEffect(() => {
        if (previewMode) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // ESC 键退出禅模式
            if (e.key === 'Escape' && state.zenMode) {
                e.preventDefault()
                toggleZenMode(false)
                return
            }

            // Delete 或 Backspace 键删除选中组件
            if ((e.key === 'Delete' || e.key === 'Backspace') && !e.repeat) {
                // 检查焦点是否在输入框等元素上
                const target = e.target as HTMLElement
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return
                }

                const selectedIds = state.selectedIds || []
                if (selectedIds.length > 0) {
                    e.preventDefault()
                    deleteComponents(selectedIds)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [previewMode, state.selectedIds, state.zenMode, deleteComponents, toggleZenMode])

    // 只有在非预览模式下才使用useDrop
    const [dropRef, isOver] = !previewMode ? (() => {
        const [{ isOver }, drop] = useDrop(() => ({
            accept: 'NEW_COMPONENT',
            drop: (item: { componentType: ComponentType; data?: any }, monitor) => {
                const offset = monitor.getClientOffset()
                const canvasRect = customCanvasRef.current?.getBoundingClientRect()

                if (offset && canvasRect) {
                    // 计算缩放后的坐标 [Logic X = (Screen X - Canvas Left) / Scale]
                    const x = (offset.x - canvasRect.left) / state.scale
                    const y = (offset.y - canvasRect.top) / state.scale

                    const config = defaultConfigs[item.componentType] || { props: {}, style: { width: 100, height: 100 } }
                    const newComponent: ComponentItem = {
                        id: uuidv4(),
                        type: item.componentType,
                        name: `${item.componentType}_${Date.now()}`,
                        props: { ...config.props, ...item.data }, // 合并拖拽携带的数据
                        style: {
                            x,
                            y,
                            width: config.style.width || 100,
                            height: config.style.height || 100,
                            ...config.style,
                        },
                        visible: true,
                        locked: false,
                    }

                    addComponent(newComponent)
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        }))
        return [drop, isOver]
    })() : [undefined, false]

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (!previewMode && !isSelecting && !hasSelectedByBox) {
            // 只有点击画布空白区域才清空选择
            if (e.target === e.currentTarget) {
                selectComponent(null)
            }
            // 点击画布关闭右键菜单
            setMenuVisible(false)
        }
        // 重置框选标记
        setHasSelectedByBox(false)
    }

    // 框选开始
    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (previewMode) return

        // 只有在画布空白区域按下鼠标才开始框选
        if (e.target === e.currentTarget) {
            const canvasRect = customCanvasRef.current?.getBoundingClientRect()
            if (canvasRect) {
                const x = (e.clientX - canvasRect.left) / state.scale
                const y = (e.clientY - canvasRect.top) / state.scale

                setIsSelecting(true)
                setSelectionStart({ x, y })
                setSelectionEnd({ x, y })
                setMenuVisible(false)
                setHasSelectedByBox(false)
            }
        }
    }

    // 框选移动
    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!isSelecting || previewMode) return

        const canvasRect = customCanvasRef.current?.getBoundingClientRect()
        if (canvasRect) {
            const x = (e.clientX - canvasRect.left) / state.scale
            const y = (e.clientY - canvasRect.top) / state.scale

            setSelectionEnd({ x, y })

            // 计算框选区域
            const minX = Math.min(selectionStart.x, x)
            const maxX = Math.max(selectionStart.x, x)
            const minY = Math.min(selectionStart.y, y)
            const maxY = Math.max(selectionStart.y, y)

            // 检测哪些组件在框选区域内
            const selectedIds = state.components
                .filter(comp => {
                    const compX = comp.style.x
                    const compY = comp.style.y
                    const compRight = compX + comp.style.width
                    const compBottom = compY + comp.style.height

                    // 判断组件是否与框选区域相交
                    return !(compRight < minX || compX > maxX || compBottom < minY || compY > maxY)
                })
                .map(comp => comp.id)

            selectComponents(selectedIds)
        }
    }

    // 框选结束
    const handleCanvasMouseUp = () => {
        if (isSelecting) {
            setIsSelecting(false)
            // 如果选中了组件，标记为通过框选选中
            const selectedIds = state.selectedIds || []
            if (selectedIds.length > 0) {
                setHasSelectedByBox(true)
            }
        }
    }

    // 右键菜单事件处理
    const handleContextMenu = (e: React.MouseEvent, componentId: string) => {
        if (previewMode) return

        e.preventDefault()
        e.stopPropagation()

        // 设置菜单位置
        setMenuPosition({ x: e.clientX, y: e.clientY })
        setSelectedComponentId(componentId)
        setMenuVisible(true)

        // 点击外部关闭菜单
        document.addEventListener('click', handleClickOutside)
    }

    const handleClickOutside = () => {
        setMenuVisible(false)
        document.removeEventListener('click', handleClickOutside)
    }

    // 关闭菜单
    const closeMenu = () => {
        setMenuVisible(false)
        document.removeEventListener('click', handleClickOutside)
    }

    // 菜单项点击处理
    const handleMenuClick = (action: string) => {
        closeMenu()

        const selectedIds = state.selectedIds || []
        
        // 组合操作 - 需要多选
        if (action === 'group') {
            if (selectedIds.length >= 2) {
                groupComponents(selectedIds)
            }
            return
        }

        // 取消组合操作
        if (action === 'ungroup') {
            if (selectedComponentId) {
                const component = state.components.find(comp => comp.id === selectedComponentId)
                if (component?.groupId) {
                    ungroupComponents(selectedComponentId)
                }
            }
            return
        }

        // 多选操作
        if (selectedIds.length > 1) {
            switch (action) {
                case 'delete':
                    deleteComponents(selectedIds)
                    break
                case 'bringForward':
                    // 批量上移一层
                    selectedIds.forEach(id => bringForward(id))
                    break
                case 'sendBackward':
                    // 批量下移一层
                    selectedIds.forEach(id => sendBackward(id))
                    break
                case 'bringToFront':
                    // 批量置顶
                    selectedIds.forEach(id => bringToFront(id))
                    break
                case 'sendToBack':
                    // 批量置底
                    selectedIds.forEach(id => sendToBack(id))
                    break
            }
            return
        }

        if (!selectedComponentId) return

        switch (action) {
            case 'bringForward':
                bringForward(selectedComponentId)
                break
            case 'sendBackward':
                sendBackward(selectedComponentId)
                break
            case 'bringToFront':
                bringToFront(selectedComponentId)
                break
            case 'sendToBack':
                sendToBack(selectedComponentId)
                break
            case 'delete':
                deleteComponent(selectedComponentId)
                break
        }
    }

    // 合并 refs
    const setRefs = (el: HTMLDivElement | null) => {
        (customCanvasRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        if (dropRef && el) {
            dropRef(el)
        }
    }

    // 生成背景样式
    const getBackgroundStyle = () => {
        const config = state.canvasConfig
        const baseStyle: React.CSSProperties = {
            backgroundColor: config?.backgroundColor || '#000000',
        }

        // 只有当背景类型为图片且有背景图片时才应用背景图片样式
        if (config?.backgroundType === 'image' && config?.backgroundImage) {
            const opacity = config.backgroundImageOpacity ?? 1
            const mode = config.backgroundImageMode || 'cover'

            switch (mode) {
                case 'tile':
                    baseStyle.backgroundImage = `url(${config.backgroundImage})`
                    baseStyle.backgroundRepeat = 'repeat'
                    baseStyle.backgroundSize = 'auto'
                    baseStyle.backgroundPosition = 'top left'
                    baseStyle.opacity = opacity
                    break
                case 'stretch':
                    baseStyle.backgroundImage = `url(${config.backgroundImage})`
                    baseStyle.backgroundRepeat = 'no-repeat'
                    baseStyle.backgroundSize = '100% 100%'
                    baseStyle.backgroundPosition = 'center'
                    baseStyle.opacity = opacity
                    break
                case 'cover':
                    baseStyle.backgroundImage = `url(${config.backgroundImage})`
                    baseStyle.backgroundRepeat = 'no-repeat'
                    baseStyle.backgroundSize = 'cover'
                    baseStyle.backgroundPosition = 'center'
                    baseStyle.opacity = opacity
                    break
                case 'contain':
                    baseStyle.backgroundImage = `url(${config.backgroundImage})`
                    baseStyle.backgroundRepeat = 'no-repeat'
                    baseStyle.backgroundSize = 'contain'
                    baseStyle.backgroundPosition = 'center'
                    baseStyle.opacity = opacity
                    break
                case 'center':
                    baseStyle.backgroundImage = `url(${config.backgroundImage})`
                    baseStyle.backgroundRepeat = 'no-repeat'
                    baseStyle.backgroundSize = 'auto'
                    baseStyle.backgroundPosition = 'center'
                    baseStyle.opacity = opacity
                    break
                default:
                    break
            }
        }

        return baseStyle
    }

    // 禅模式缩放控制
    const handleZenZoomOut = () => {
        const newScale = Math.max(0.2, state.scale - 0.1)
        setScale(parseFloat(newScale.toFixed(1)))
    }

    const handleZenZoomIn = () => {
        const newScale = Math.min(2.0, state.scale + 0.1)
        setScale(parseFloat(newScale.toFixed(1)))
    }

    const handleZenResetZoom = () => {
        setScale(1.0)
    }

    return (
        <div className="canvas-wrapper">
            {!previewMode && (
                <>
                    <div className="ruler-corner" />
                    <Ruler type="horizontal" />
                    <Ruler type="vertical" />
                </>
            )}

            <div
                ref={!previewMode ? setRefs : undefined}
                className={`canvas-area ${isOver && !previewMode ? 'drag-over' : ''}`}
                style={{
                    width: state.canvasConfig?.width || 1920,
                    height: state.canvasConfig?.height || 1080,
                    ...getBackgroundStyle(),
                    transform: previewMode 
                        ? `scale(${previewScale})` 
                        : `scale(${state.scale}) translate(0px, 0px)`,
                    top: !previewMode ? 40 : 0,
                    left: !previewMode ? 40 : 0,
                    transformOrigin: previewMode ? 'center center' : '0 0',
                }}
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
            >
                {/* 只渲染顶层组件，子组件由 LayoutCell 渲染 */}
                {state.components.filter(item => !item.parentId).map((item) => (
                    <CanvasItem
                        key={item.id}
                        item={item}
                        onContextMenu={!previewMode ? (e) => handleContextMenu(e, item.id) : undefined}
                        previewMode={previewMode}
                    />
                ))}

                {/* 渲染吸附辅助线 */}
                {!previewMode && state.snapLines.map((line, index) => (
                    <div
                        key={index}
                        className={`snap-line snap-line-${line.type}`}
                        style={{
                            left: line.type === 'v' ? line.position : 0,
                            top: line.type === 'h' ? line.position : 0,
                        }}
                    />
                ))}

                {/* 框选区域 */}
                {!previewMode && isSelecting && (
                    <div
                        className="selection-box"
                        style={{
                            left: Math.min(selectionStart.x, selectionEnd.x),
                            top: Math.min(selectionStart.y, selectionEnd.y),
                            width: Math.abs(selectionEnd.x - selectionStart.x),
                            height: Math.abs(selectionEnd.y - selectionStart.y),
                        }}
                    />
                )}
            </div>

            {/* 右键菜单 */}
            {!previewMode && menuVisible && (
                <div
                    className="canvas-context-menu"
                    style={{
                        left: menuPosition.x,
                        top: menuPosition.y,
                    }}
                >
                    {/* 根据选中状态显示不同菜单 */}
                    {(() => {
                        const selectedIds = state.selectedIds || []
                        const selectedComponent = selectedComponentId ? state.components.find(comp => comp.id === selectedComponentId) : null
                        const isGrouped = selectedComponent?.groupId
                        const canGroup = selectedIds.length >= 2 && !selectedIds.some(id => {
                            const comp = state.components.find(c => c.id === id)
                            return comp?.groupId
                        })
                        
                        return (
                            <>
                                {/* 组合相关操作 */}
                                {canGroup && (
                                    <>
                                        <div
                                            className="context-menu-item"
                                            onClick={() => handleMenuClick('group')}
                                        >
                                            组合
                                        </div>
                                        <div className="context-menu-divider" />
                                    </>
                                )}
                                
                                {isGrouped && (
                                    <>
                                        <div
                                            className="context-menu-item"
                                            onClick={() => handleMenuClick('ungroup')}
                                        >
                                            取消组合
                                        </div>
                                        <div className="context-menu-divider" />
                                    </>
                                )}

                                {/* 图层操作 - 多选和单选都显示 */}
                                <div
                                    className="context-menu-item"
                                    onClick={() => handleMenuClick('bringForward')}
                                >
                                    上移一层
                                </div>
                                <div
                                    className="context-menu-item"
                                    onClick={() => handleMenuClick('sendBackward')}
                                >
                                    下移一层
                                </div>
                                <div
                                    className="context-menu-item"
                                    onClick={() => handleMenuClick('bringToFront')}
                                >
                                    置顶
                                </div>
                                <div
                                    className="context-menu-item"
                                    onClick={() => handleMenuClick('sendToBack')}
                                >
                                    置底
                                </div>
                                <div className="context-menu-divider" />

                                {/* 删除操作 */}
                                <div
                                    className="context-menu-item context-menu-item-delete"
                                    onClick={() => handleMenuClick('delete')}
                                >
                                    删除{selectedIds.length > 1 ? `(${selectedIds.length}个)` : ''}
                                </div>
                            </>
                        )
                    })()}
                </div>
            )}

            {/* 禅模式浮动缩放控制器 */}
            {!previewMode && state.zenMode && (
                <div className="zen-zoom-controls">
                    <Tooltip title="退出禅模式 (ESC)">
                        <Button 
                            icon={<FullscreenExitOutlined />} 
                            onClick={() => toggleZenMode(false)}
                            size="small"
                            type="primary"
                        />
                    </Tooltip>
                    <div className="zen-divider" />
                    <Tooltip title="缩小">
                        <Button 
                            icon={<ZoomOutOutlined />} 
                            onClick={handleZenZoomOut}
                            size="small"
                        />
                    </Tooltip>
                    <div className="zen-zoom-slider">
                        <Slider
                            min={0.2}
                            max={2.0}
                            step={0.1}
                            value={state.scale}
                            onChange={setScale}
                            tooltip={{ formatter: (value) => `${Math.round((value || 0) * 100)}%` }}
                            style={{ width: 120 }}
                        />
                    </div>
                    <Tooltip title="放大">
                        <Button 
                            icon={<ZoomInOutlined />} 
                            onClick={handleZenZoomIn}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="重置缩放">
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={handleZenResetZoom}
                            size="small"
                        />
                    </Tooltip>
                    <span className="zen-zoom-percentage">
                        {Math.round(state.scale * 100)}%
                    </span>
                </div>
            )}
        </div>
    )
}
