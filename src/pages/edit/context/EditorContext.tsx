import React, { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { EditorState, EditorAction, ComponentItem, SnapLine, CanvasConfig } from '../types'

// 初始状态
const getInitialState = (): EditorState => {
    // 尝试从 localStorage 加载状态
    const savedState = localStorage.getItem('editorState')
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState)
            // 确保 selectedIds 存在
            return {
                ...parsed,
                selectedIds: parsed.selectedIds || []
            }
        } catch (error) {
            console.error('Failed to load state from localStorage:', error)
        }
    }
    // 默认初始状态
    return {
        components: [],
        selectedId: null,
        selectedIds: [],
        scale: 1,
        snapLines: [],
        canvasConfig: {
            width: 1920,
            height: 1080,
            backgroundColor: '#000000',
            name: '大屏可视化',
            backgroundType: 'color',
            backgroundImageMode: 'cover',
            backgroundImageOpacity: 1,
            chartTheme: {
                type: 'preset',
                presetName: 'default',
                customColors: []
            }
        },
        zenMode: false,
        showComponentPanel: true,
        showLayerPanel: true,
        showPropertyPanel: true,
    }
}

const initialState: EditorState = getInitialState()

// Reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case 'SYNC_STATE':
            // 同步整个状态（用于预览页面）
            return {
                ...action.payload,
                selectedIds: action.payload.selectedIds || []
            }

        case 'ADD_COMPONENT':
            return {
                ...state,
                components: [...state.components, action.payload],
                selectedId: action.payload.id,
            }

        case 'UPDATE_COMPONENT':
            return {
                ...state,
                components: state.components.map((comp) =>
                    comp.id === action.payload.id
                        ? { ...comp, ...action.payload.updates }
                        : comp
                ),
            }

        case 'DELETE_COMPONENT':
            // 如果删除的组件是组合的一部分，删除整个组合
            const componentToDelete = state.components.find(comp => comp.id === action.payload)
            const componentsToDelete = componentToDelete?.groupId
                ? state.components.filter(comp => comp.groupId === componentToDelete.groupId).map(comp => comp.id)
                : [action.payload]

            return {
                ...state,
                components: state.components.filter((comp) => !componentsToDelete.includes(comp.id)),
                selectedId: componentsToDelete.includes(state.selectedId || '') ? null : state.selectedId,
                selectedIds: state.selectedIds.filter(id => !componentsToDelete.includes(id)),
            }

        case 'DELETE_COMPONENTS':
            return {
                ...state,
                components: state.components.filter((comp) => !action.payload.includes(comp.id)),
                selectedId: action.payload.includes(state.selectedId || '') ? null : state.selectedId,
                selectedIds: [],
            }

        case 'SELECT_COMPONENT':
            return {
                ...state,
                selectedId: action.payload,
                selectedIds: action.payload ? [action.payload] : [],
            }

        case 'SELECT_COMPONENTS':
            return {
                ...state,
                selectedId: action.payload.length === 1 ? action.payload[0] : null,
                selectedIds: action.payload,
            }

        case 'MOVE_COMPONENT':
            return {
                ...state,
                components: state.components.map((comp) =>
                    comp.id === action.payload.id
                        ? {
                            ...comp,
                            style: {
                                ...comp.style,
                                x: action.payload.x,
                                y: action.payload.y,
                            },
                        }
                        : comp
                ),
            }

        case 'REORDER_LAYERS':
            return {
                ...state,
                components: action.payload,
            }

        case 'TOGGLE_VISIBILITY':
            return {
                ...state,
                components: state.components.map((comp) =>
                    comp.id === action.payload ? { ...comp, visible: !comp.visible } : comp
                ),
            }

        case 'TOGGLE_LOCK':
            return {
                ...state,
                components: state.components.map((comp) =>
                    comp.id === action.payload ? { ...comp, locked: !comp.locked } : comp
                ),
            }

        case 'SET_SCALE':
            return {
                ...state,
                scale: action.payload,
            }

        case 'SET_SNAP_LINES':
            return {
                ...state,
                snapLines: action.payload,
            }

        case 'GROUP_COMPONENTS':
            const groupId = `group_${Date.now()}`
            const componentsToGroup = action.payload
            if (componentsToGroup.length < 2) return state

            return {
                ...state,
                components: state.components.map((comp) => {
                    if (componentsToGroup.includes(comp.id)) {
                        return {
                            ...comp,
                            groupId,
                            isGroup: componentsToGroup[0] === comp.id, // 第一个组件作为组合的主组件
                        }
                    }
                    return comp
                }),
                selectedIds: [componentsToGroup[0]], // 选中组合的主组件
                selectedId: componentsToGroup[0],
            }

        case 'UNGROUP_COMPONENTS':
            const componentToUngroup = state.components.find(comp => comp.id === action.payload)
            if (!componentToUngroup?.groupId) return state

            const groupIdToRemove = componentToUngroup.groupId
            const ungroupedIds = state.components
                .filter(comp => comp.groupId === groupIdToRemove)
                .map(comp => comp.id)

            return {
                ...state,
                components: state.components.map((comp) => {
                    if (comp.groupId === groupIdToRemove) {
                        const { groupId, isGroup, ...rest } = comp
                        return rest
                    }
                    return comp
                }),
                selectedIds: ungroupedIds,
                selectedId: ungroupedIds.length === 1 ? ungroupedIds[0] : null,
            }

        case 'SET_CANVAS_CONFIG':
            return {
                ...state,
                canvasConfig: {
                    ...state.canvasConfig,
                    ...action.payload,
                },
            }

        case 'TOGGLE_ZEN_MODE':
            return {
                ...state,
                zenMode: action.payload,
            }

        case 'TOGGLE_PANEL':
            if (action.payload === 'component') {
                return { ...state, showComponentPanel: !state.showComponentPanel }
            }
            if (action.payload === 'layer') {
                return { ...state, showLayerPanel: !state.showLayerPanel }
            }
            if (action.payload === 'property') {
                return { ...state, showPropertyPanel: !state.showPropertyPanel }
            }
            return state

        default:
            return state
    }
}

// 历史记录状态
interface HistoryState {
    past: EditorState[]
    present: EditorState
    future: EditorState[]
}

const initialHistory: HistoryState = {
    past: [],
    present: initialState,
    future: [],
}

// 需要记录历史的操作类型
const HISTORY_ACTIONS = [
    'ADD_COMPONENT',
    'UPDATE_COMPONENT',
    'DELETE_COMPONENT',
    'DELETE_COMPONENTS',
    'MOVE_COMPONENT',
    'REORDER_LAYERS',
    'TOGGLE_VISIBILITY',
    'TOGGLE_LOCK',
    'SET_CANVAS_CONFIG',
    'GROUP_COMPONENTS',
    'UNGROUP_COMPONENTS',
]

// 需要触发事件的操作类型（排除 SYNC_STATE）
const EVENT_TRIGGER_ACTIONS = [
    ...HISTORY_ACTIONS,
    'SELECT_COMPONENT',
    'SELECT_COMPONENTS',
    'SET_SCALE',
    'SET_SNAP_LINES',
]

// History Reducer
function historyReducer(state: HistoryState, action: EditorAction | { type: 'UNDO' } | { type: 'REDO' }): HistoryState {
    const { past, present, future } = state

    switch (action.type) {
        case 'UNDO':
            if (past.length === 0) return state
            const previous = past[past.length - 1]
            const newPast = past.slice(0, -1)
            const newUndoState = {
                past: newPast,
                present: previous,
                future: [present, ...future],
            }
            // 保存到 localStorage
            localStorage.setItem('editorState', JSON.stringify(newUndoState.present))
            // 触发自定义事件通知其他页面状态变化
            window.dispatchEvent(new CustomEvent('editorStateChange'))
            return newUndoState

        case 'REDO':
            if (future.length === 0) return state
            const next = future[0]
            const newFuture = future.slice(1)
            const newRedoState = {
                past: [...past, present],
                present: next,
                future: newFuture,
            }
            // 保存到 localStorage
            localStorage.setItem('editorState', JSON.stringify(newRedoState.present))
            // 触发自定义事件通知其他页面状态变化
            window.dispatchEvent(new CustomEvent('editorStateChange'))
            return newRedoState

        default:
            const newPresent = editorReducer(present, action as EditorAction)

            if (newPresent === present) return state

            // 如果是需要记录历史的操作，推入 past
            if (HISTORY_ACTIONS.includes(action.type)) {
                const newHistoryState = {
                    past: [...past, present],
                    present: newPresent,
                    future: [],
                }
                // 保存到 localStorage
                localStorage.setItem('editorState', JSON.stringify(newHistoryState.present))
                // 只有非同步操作才触发事件
                if (EVENT_TRIGGER_ACTIONS.includes(action.type)) {
                    window.dispatchEvent(new CustomEvent('editorStateChange'))
                }
                return newHistoryState
            }

            // 其他操作（如选中、缩放）只更新当前状态，不记录历史
            const newOtherState = {
                ...state,
                present: newPresent,
            }

            // SYNC_STATE 操作不保存到 localStorage 也不触发事件
            if (action.type !== 'SYNC_STATE') {
                // 保存到 localStorage
                localStorage.setItem('editorState', JSON.stringify(newOtherState.present))
                // 只有非同步操作才触发事件
                if (EVENT_TRIGGER_ACTIONS.includes(action.type)) {
                    window.dispatchEvent(new CustomEvent('editorStateChange'))
                }
            }

            return newOtherState
    }
}

// Context 类型
interface EditorContextType {
    state: EditorState
    dispatch: React.Dispatch<EditorAction>
    addComponent: (component: ComponentItem) => void
    updateComponent: (id: string, updates: Partial<ComponentItem>) => void
    deleteComponent: (id: string) => void
    deleteComponents: (ids: string[]) => void
    selectComponent: (id: string | null) => void
    selectComponents: (ids: string[]) => void
    moveComponent: (id: string, x: number, y: number) => void
    reorderLayers: (components: ComponentItem[]) => void
    bringForward: (id: string) => void
    sendBackward: (id: string) => void
    bringToFront: (id: string) => void
    sendToBack: (id: string) => void
    toggleVisibility: (id: string) => void
    toggleLock: (id: string) => void
    setScale: (scale: number) => void
    setSnapLines: (lines: SnapLine[]) => void
    setCanvasConfig: (config: Partial<CanvasConfig>) => void
    getSelectedComponent: () => ComponentItem | undefined
    copyComponent: (id: string) => void
    groupComponents: (ids: string[]) => void
    ungroupComponents: (id: string) => void
    toggleZenMode: (enabled: boolean) => void
    togglePanel: (type: 'component' | 'layer' | 'property') => void
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
}

// 创建 Context
const EditorContext = createContext<EditorContextType | null>(null)

// Provider 组件
export function EditorProvider({ children }: { children: ReactNode }) {
    const [history, dispatchHistory] = useReducer(historyReducer, initialHistory)
    const { present: state } = history

    // 包装 dispatch，使其兼容原来的 editorReducer 接口
    const dispatch: React.Dispatch<EditorAction> = React.useCallback((action) => {
        dispatchHistory(action)
    }, [])

    const undo = React.useCallback(() => dispatchHistory({ type: 'UNDO' }), [])
    const redo = React.useCallback(() => dispatchHistory({ type: 'REDO' }), [])

    const addComponent = React.useCallback((component: ComponentItem) => {
        dispatch({ type: 'ADD_COMPONENT', payload: component })
    }, [dispatch])

    const updateComponent = React.useCallback((id: string, updates: Partial<ComponentItem>) => {
        dispatch({ type: 'UPDATE_COMPONENT', payload: { id, updates } })
    }, [dispatch])

    const deleteComponent = React.useCallback((id: string) => {
        dispatch({ type: 'DELETE_COMPONENT', payload: id })
    }, [dispatch])

    const deleteComponents = React.useCallback((ids: string[]) => {
        dispatch({ type: 'DELETE_COMPONENTS', payload: ids })
    }, [dispatch])

    const selectComponent = React.useCallback((id: string | null) => {
        dispatch({ type: 'SELECT_COMPONENT', payload: id })
    }, [dispatch])

    const selectComponents = React.useCallback((ids: string[]) => {
        dispatch({ type: 'SELECT_COMPONENTS', payload: ids })
    }, [dispatch])

    const moveComponent = React.useCallback((id: string, x: number, y: number) => {
        dispatch({ type: 'MOVE_COMPONENT', payload: { id, x, y } })
    }, [dispatch])

    const reorderLayers = React.useCallback((components: ComponentItem[]) => {
        dispatch({ type: 'REORDER_LAYERS', payload: components })
    }, [dispatch])

    const toggleVisibility = React.useCallback((id: string) => {
        dispatch({ type: 'TOGGLE_VISIBILITY', payload: id })
    }, [dispatch])

    const toggleLock = React.useCallback((id: string) => {
        dispatch({ type: 'TOGGLE_LOCK', payload: id })
    }, [dispatch])

    const setScale = React.useCallback((scale: number) => {
        dispatch({ type: 'SET_SCALE', payload: scale })
    }, [dispatch])

    const setSnapLines = React.useCallback((lines: SnapLine[]) => {
        dispatch({ type: 'SET_SNAP_LINES', payload: lines })
    }, [dispatch])

    const setCanvasConfig = React.useCallback((config: Partial<CanvasConfig>) => {
        dispatch({ type: 'SET_CANVAS_CONFIG', payload: config })
    }, [dispatch])

    // 图层操作方法
    const bringForward = React.useCallback((id: string) => {
        const components = [...state.components]
        const index = components.findIndex(c => c.id === id)
        if (index < components.length - 1) {
            // 交换位置
            const temp = components[index]
            components[index] = components[index + 1]
            components[index + 1] = temp

            // 更新z-index
            components.forEach((comp, idx) => {
                comp.style.zIndex = idx + 1
            })

            reorderLayers(components)
        }
    }, [state.components, reorderLayers])

    const sendBackward = React.useCallback((id: string) => {
        const components = [...state.components]
        const index = components.findIndex(c => c.id === id)
        if (index > 0) {
            // 交换位置
            const temp = components[index]
            components[index] = components[index - 1]
            components[index - 1] = temp

            // 更新z-index
            components.forEach((comp, idx) => {
                comp.style.zIndex = idx + 1
            })

            reorderLayers(components)
        }
    }, [state.components, reorderLayers])

    const bringToFront = React.useCallback((id: string) => {
        const components = [...state.components]
        const index = components.findIndex(c => c.id === id)
        if (index < components.length - 1) {
            // 移除并添加到末尾
            const [removed] = components.splice(index, 1)
            components.push(removed)

            // 更新z-index
            components.forEach((comp, idx) => {
                comp.style.zIndex = idx + 1
            })

            reorderLayers(components)
        }
    }, [state.components, reorderLayers])

    const sendToBack = React.useCallback((id: string) => {
        const components = [...state.components]
        const index = components.findIndex(c => c.id === id)
        if (index > 0) {
            // 移除并添加到开头
            const [removed] = components.splice(index, 1)
            components.unshift(removed)

            // 更新z-index
            components.forEach((comp, idx) => {
                comp.style.zIndex = idx + 1
            })

            reorderLayers(components)
        }
    }, [state.components, reorderLayers])

    const getSelectedComponent = React.useCallback(() => {
        return state.components.find((comp) => comp.id === state.selectedId)
    }, [state.components, state.selectedId])

    const groupComponents = React.useCallback((ids: string[]) => {
        dispatch({ type: 'GROUP_COMPONENTS', payload: ids })
    }, [dispatch])

    const ungroupComponents = React.useCallback((id: string) => {
        dispatch({ type: 'UNGROUP_COMPONENTS', payload: id })
    }, [dispatch])

    const copyComponent = React.useCallback((id: string) => {
        const component = state.components.find((comp) => comp.id === id)
        if (!component) return

        const newComponent: ComponentItem = {
            ...component,
            id: `${component.type}_${Date.now()}`,
            name: `${component.name} 副本`,
            style: {
                ...component.style,
                x: component.style.x + 20,
                y: component.style.y + 20,
            },
            props: JSON.parse(JSON.stringify(component.props)), // 深拷贝 props
        }
        addComponent(newComponent)
    }, [state.components, addComponent])

    const toggleZenMode = React.useCallback((enabled: boolean) => {
        dispatch({ type: 'TOGGLE_ZEN_MODE', payload: enabled })
    }, [dispatch])

    const togglePanel = React.useCallback((type: 'component' | 'layer' | 'property') => {
        dispatch({ type: 'TOGGLE_PANEL', payload: type })
    }, [dispatch])

    const contextValue = React.useMemo(() => ({
        state,
        dispatch,
        addComponent,
        updateComponent,
        deleteComponent,
        deleteComponents,
        selectComponent,
        selectComponents,
        moveComponent,
        reorderLayers,
        bringForward,
        sendBackward,
        bringToFront,
        sendToBack,
        toggleVisibility,
        toggleLock,
        setScale,
        setSnapLines,
        setCanvasConfig,
        getSelectedComponent,
        copyComponent,
        groupComponents,
        ungroupComponents,
        toggleZenMode,
        togglePanel,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
    }), [
        state,
        dispatch,
        addComponent,
        updateComponent,
        deleteComponent,
        deleteComponents,
        selectComponent,
        selectComponents,
        moveComponent,
        reorderLayers,
        bringForward,
        sendBackward,
        bringToFront,
        sendToBack,
        toggleVisibility,
        toggleLock,
        setScale,
        setSnapLines,
        setCanvasConfig,
        getSelectedComponent,
        copyComponent,
        groupComponents,
        ungroupComponents,
        toggleZenMode,
        togglePanel,
        undo,
        redo,
        history.past.length,
        history.future.length
    ])

    return (
        <EditorContext.Provider value={contextValue}>
            {children}
            {/* Debug Info (Optional) */}
            {/* <div style={{ position: 'fixed', bottom: 0, right: 0, color: 'white', background: 'rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
                Past: {history.past.length}, Future: {history.future.length}
            </div> */}
        </EditorContext.Provider>
    )
}

// Hook
export function useEditor() {
    const context = useContext(EditorContext)
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider')
    }
    return context
}
