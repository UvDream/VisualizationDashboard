import React, { createContext, useContext, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { EditorState, EditorAction, ComponentItem, SnapLine, CanvasConfig } from '../types'

// 初始状态
const getInitialState = (): EditorState => {
    // 尝试从 localStorage 加载状态
    const savedState = localStorage.getItem('editorState')
    if (savedState) {
        try {
            return JSON.parse(savedState)
        } catch (error) {
            console.error('Failed to load state from localStorage:', error)
        }
    }
    // 默认初始状态
    return {
        components: [],
        selectedId: null,
        scale: 1,
        snapLines: [],
        canvasConfig: {
            width: 1920,
            height: 1080,
            backgroundColor: '#000000',
            name: '大屏可视化'
        }
    }
}

const initialState: EditorState = getInitialState()

// Reducer
function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
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
            return {
                ...state,
                components: state.components.filter((comp) => comp.id !== action.payload),
                selectedId: state.selectedId === action.payload ? null : state.selectedId,
            }

        case 'SELECT_COMPONENT':
            return {
                ...state,
                selectedId: action.payload,
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

        case 'SET_CANVAS_CONFIG':
            return {
                ...state,
                canvasConfig: {
                    ...state.canvasConfig,
                    ...action.payload,
                },
            }

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
    'MOVE_COMPONENT',
    'REORDER_LAYERS',
    'TOGGLE_VISIBILITY',
    'TOGGLE_LOCK',
    'SET_CANVAS_CONFIG',
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
                return newHistoryState
            }

            // 其他操作（如选中、缩放）只更新当前状态，不记录历史
            const newOtherState = {
                ...state,
                present: newPresent,
            }
            // 保存到 localStorage
            localStorage.setItem('editorState', JSON.stringify(newOtherState.present))
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
    selectComponent: (id: string | null) => void
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

    const selectComponent = React.useCallback((id: string | null) => {
        dispatch({ type: 'SELECT_COMPONENT', payload: id })
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

    const contextValue = React.useMemo(() => ({
        state,
        dispatch,
        addComponent,
        updateComponent,
        deleteComponent,
        selectComponent,
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
        selectComponent,
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
