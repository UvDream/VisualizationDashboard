import { createContext, useContext, useReducer, useCallback, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import type { ComponentItem, SnapLine, CanvasConfig } from '../types'
import { HISTORY_ACTIONS, STORAGE_DEBOUNCE_DELAY } from '../config/constants'

// ============= Types =============

export interface EditorState {
    components: ComponentItem[]
    selectedId: string | null
    selectedIds: string[]
    scale: number
    snapLines: SnapLine[]
    canvasConfig: CanvasConfig
}

type EditorAction =
    | { type: 'SYNC_STATE'; payload: EditorState }
    | { type: 'ADD_COMPONENT'; payload: ComponentItem }
    | { type: 'UPDATE_COMPONENT'; payload: { id: string; updates: Partial<ComponentItem> } }
    | { type: 'DELETE_COMPONENT'; payload: string }
    | { type: 'DELETE_COMPONENTS'; payload: string[] }
    | { type: 'SELECT_COMPONENT'; payload: string | null }
    | { type: 'SELECT_COMPONENTS'; payload: string[] }
    | { type: 'MOVE_COMPONENT'; payload: { id: string; x: number; y: number } }
    | { type: 'REORDER_LAYERS'; payload: ComponentItem[] }
    | { type: 'TOGGLE_VISIBILITY'; payload: string }
    | { type: 'TOGGLE_LOCK'; payload: string }
    | { type: 'SET_SCALE'; payload: number }
    | { type: 'SET_SNAP_LINES'; payload: SnapLine[] }
    | { type: 'SET_CANVAS_CONFIG'; payload: Partial<CanvasConfig> }
    | { type: 'GROUP_COMPONENTS'; payload: string[] }
    | { type: 'UNGROUP_COMPONENTS'; payload: string }

// ============= Storage Utils =============

let saveTimeoutId: ReturnType<typeof setTimeout> | null = null

const debouncedSaveToStorage = (state: EditorState) => {
    if (saveTimeoutId) {
        clearTimeout(saveTimeoutId)
    }
    saveTimeoutId = setTimeout(() => {
        try {
            localStorage.setItem('editorState', JSON.stringify(state))
        } catch (error) {
            console.error('Failed to save state to localStorage:', error)
        }
    }, STORAGE_DEBOUNCE_DELAY)
}

const loadFromStorage = (): EditorState | null => {
    try {
        const savedState = localStorage.getItem('editorState')
        if (savedState) {
            const parsed = JSON.parse(savedState)
            return {
                ...parsed,
                selectedIds: parsed.selectedIds || []
            }
        }
    } catch (error) {
        console.error('Failed to load state from localStorage:', error)
    }
    return null
}

// ============= Initial State =============

const getInitialState = (): EditorState => {
    const savedState = loadFromStorage()
    if (savedState) {
        return savedState
    }
    
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
        }
    }
}

// ============= Reducer =============

function editorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case 'SYNC_STATE':
            return { ...action.payload, selectedIds: action.payload.selectedIds || [] }

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

        case 'DELETE_COMPONENT': {
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
                        ? { ...comp, style: { ...comp.style, x: action.payload.x, y: action.payload.y } }
                        : comp
                ),
            }

        case 'REORDER_LAYERS':
            return { ...state, components: action.payload }

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
            return { ...state, scale: action.payload }

        case 'SET_SNAP_LINES':
            return { ...state, snapLines: action.payload }

        case 'GROUP_COMPONENTS': {
            const groupId = `group_${Date.now()}`
            const componentsToGroup = action.payload
            if (componentsToGroup.length < 2) return state

            return {
                ...state,
                components: state.components.map((comp) => {
                    if (componentsToGroup.includes(comp.id)) {
                        return { ...comp, groupId, isGroup: componentsToGroup[0] === comp.id }
                    }
                    return comp
                }),
                selectedIds: [componentsToGroup[0]],
                selectedId: componentsToGroup[0],
            }
        }

        case 'UNGROUP_COMPONENTS': {
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
                        return rest as ComponentItem
                    }
                    return comp
                }),
                selectedIds: ungroupedIds,
                selectedId: ungroupedIds.length === 1 ? ungroupedIds[0] : null,
            }
        }

        case 'SET_CANVAS_CONFIG':
            return {
                ...state,
                canvasConfig: { ...state.canvasConfig, ...action.payload },
            }

        default:
            return state
    }
}

// ============= History Reducer =============

interface HistoryState {
    past: EditorState[]
    present: EditorState
    future: EditorState[]
}

function historyReducer(
    state: HistoryState,
    action: EditorAction | { type: 'UNDO' } | { type: 'REDO' }
): HistoryState {
    const { past, present, future } = state

    switch (action.type) {
        case 'UNDO': {
            if (past.length === 0) return state
            const previous = past[past.length - 1]
            const newPast = past.slice(0, -1)
            const newState = { past: newPast, present: previous, future: [present, ...future] }
            debouncedSaveToStorage(newState.present)
            window.dispatchEvent(new CustomEvent('editorStateChange'))
            return newState
        }

        case 'REDO': {
            if (future.length === 0) return state
            const next = future[0]
            const newFuture = future.slice(1)
            const newState = { past: [...past, present], present: next, future: newFuture }
            debouncedSaveToStorage(newState.present)
            window.dispatchEvent(new CustomEvent('editorStateChange'))
            return newState
        }

        default: {
            const newPresent = editorReducer(present, action as EditorAction)
            if (newPresent === present) return state

            const shouldRecordHistory = HISTORY_ACTIONS.includes(action.type as any)
            
            const newHistoryState = shouldRecordHistory
                ? { past: [...past, present], present: newPresent, future: [] }
                : { ...state, present: newPresent }

            // 只有非 SYNC_STATE 操作才保存和触发事件
            if (action.type !== 'SYNC_STATE') {
                debouncedSaveToStorage(newHistoryState.present)
                if (shouldRecordHistory || ['SELECT_COMPONENT', 'SELECT_COMPONENTS', 'SET_SCALE'].includes(action.type)) {
                    window.dispatchEvent(new CustomEvent('editorStateChange'))
                }
            }

            return newHistoryState
        }
    }
}

// ============= Context Definitions =============

// 组件状态 Context
interface ComponentsContextType {
    components: ComponentItem[]
    addComponent: (component: ComponentItem) => void
    updateComponent: (id: string, updates: Partial<ComponentItem>) => void
    deleteComponent: (id: string) => void
    deleteComponents: (ids: string[]) => void
    moveComponent: (id: string, x: number, y: number) => void
    reorderLayers: (components: ComponentItem[]) => void
    toggleVisibility: (id: string) => void
    toggleLock: (id: string) => void
    copyComponent: (id: string) => void
    groupComponents: (ids: string[]) => void
    ungroupComponents: (id: string) => void
    bringForward: (id: string) => void
    sendBackward: (id: string) => void
    bringToFront: (id: string) => void
    sendToBack: (id: string) => void
}

// 选择状态 Context
interface SelectionContextType {
    selectedId: string | null
    selectedIds: string[]
    selectComponent: (id: string | null) => void
    selectComponents: (ids: string[]) => void
    getSelectedComponent: () => ComponentItem | undefined
}

// 画布状态 Context
interface CanvasContextType {
    scale: number
    snapLines: SnapLine[]
    canvasConfig: CanvasConfig
    setScale: (scale: number) => void
    setSnapLines: (lines: SnapLine[]) => void
    setCanvasConfig: (config: Partial<CanvasConfig>) => void
}

// 历史记录 Context
interface HistoryContextType {
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
}

// 完整的编辑器 Context（向后兼容）
interface EditorContextType extends ComponentsContextType, SelectionContextType, CanvasContextType, HistoryContextType {
    state: EditorState
    dispatch: React.Dispatch<EditorAction>
}

// 创建 Context
const ComponentsContext = createContext<ComponentsContextType | null>(null)
const SelectionContext = createContext<SelectionContextType | null>(null)
const CanvasContext = createContext<CanvasContextType | null>(null)
const HistoryContext = createContext<HistoryContextType | null>(null)
const EditorContext = createContext<EditorContextType | null>(null)

// ============= Provider Component =============

export function EditorProvider({ children }: { children: ReactNode }) {
    const initialHistory: HistoryState = {
        past: [],
        present: getInitialState(),
        future: [],
    }

    const [history, dispatchHistory] = useReducer(historyReducer, initialHistory)
    const { present: state } = history

    // 保存组件列表的引用，用于 getSelectedComponent
    const componentsRef = useRef(state.components)
    componentsRef.current = state.components

    const selectedIdRef = useRef(state.selectedId)
    selectedIdRef.current = state.selectedId

    const dispatch: React.Dispatch<EditorAction> = useCallback((action) => {
        dispatchHistory(action)
    }, [])

    // History actions
    const undo = useCallback(() => dispatchHistory({ type: 'UNDO' }), [])
    const redo = useCallback(() => dispatchHistory({ type: 'REDO' }), [])

    // Component actions
    const addComponent = useCallback((component: ComponentItem) => {
        dispatch({ type: 'ADD_COMPONENT', payload: component })
    }, [dispatch])

    const updateComponent = useCallback((id: string, updates: Partial<ComponentItem>) => {
        dispatch({ type: 'UPDATE_COMPONENT', payload: { id, updates } })
    }, [dispatch])

    const deleteComponent = useCallback((id: string) => {
        dispatch({ type: 'DELETE_COMPONENT', payload: id })
    }, [dispatch])

    const deleteComponents = useCallback((ids: string[]) => {
        dispatch({ type: 'DELETE_COMPONENTS', payload: ids })
    }, [dispatch])

    const moveComponent = useCallback((id: string, x: number, y: number) => {
        dispatch({ type: 'MOVE_COMPONENT', payload: { id, x, y } })
    }, [dispatch])

    const reorderLayers = useCallback((components: ComponentItem[]) => {
        dispatch({ type: 'REORDER_LAYERS', payload: components })
    }, [dispatch])

    const toggleVisibility = useCallback((id: string) => {
        dispatch({ type: 'TOGGLE_VISIBILITY', payload: id })
    }, [dispatch])

    const toggleLock = useCallback((id: string) => {
        dispatch({ type: 'TOGGLE_LOCK', payload: id })
    }, [dispatch])

    const groupComponents = useCallback((ids: string[]) => {
        dispatch({ type: 'GROUP_COMPONENTS', payload: ids })
    }, [dispatch])

    const ungroupComponents = useCallback((id: string) => {
        dispatch({ type: 'UNGROUP_COMPONENTS', payload: id })
    }, [dispatch])

    const copyComponent = useCallback((id: string) => {
        const component = componentsRef.current.find((comp) => comp.id === id)
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
            props: JSON.parse(JSON.stringify(component.props)),
        }
        addComponent(newComponent)
    }, [addComponent])

    // Layer operations
    const bringForward = useCallback((id: string) => {
        const components = [...componentsRef.current]
        const index = components.findIndex(c => c.id === id)
        if (index < components.length - 1) {
            const temp = components[index]
            components[index] = components[index + 1]
            components[index + 1] = temp
            components.forEach((comp, idx) => { comp.style.zIndex = idx + 1 })
            reorderLayers(components)
        }
    }, [reorderLayers])

    const sendBackward = useCallback((id: string) => {
        const components = [...componentsRef.current]
        const index = components.findIndex(c => c.id === id)
        if (index > 0) {
            const temp = components[index]
            components[index] = components[index - 1]
            components[index - 1] = temp
            components.forEach((comp, idx) => { comp.style.zIndex = idx + 1 })
            reorderLayers(components)
        }
    }, [reorderLayers])

    const bringToFront = useCallback((id: string) => {
        const components = [...componentsRef.current]
        const index = components.findIndex(c => c.id === id)
        if (index < components.length - 1) {
            const [removed] = components.splice(index, 1)
            components.push(removed)
            components.forEach((comp, idx) => { comp.style.zIndex = idx + 1 })
            reorderLayers(components)
        }
    }, [reorderLayers])

    const sendToBack = useCallback((id: string) => {
        const components = [...componentsRef.current]
        const index = components.findIndex(c => c.id === id)
        if (index > 0) {
            const [removed] = components.splice(index, 1)
            components.unshift(removed)
            components.forEach((comp, idx) => { comp.style.zIndex = idx + 1 })
            reorderLayers(components)
        }
    }, [reorderLayers])

    // Selection actions
    const selectComponent = useCallback((id: string | null) => {
        dispatch({ type: 'SELECT_COMPONENT', payload: id })
    }, [dispatch])

    const selectComponents = useCallback((ids: string[]) => {
        dispatch({ type: 'SELECT_COMPONENTS', payload: ids })
    }, [dispatch])

    const getSelectedComponent = useCallback(() => {
        return componentsRef.current.find((comp) => comp.id === selectedIdRef.current)
    }, [])

    // Canvas actions
    const setScale = useCallback((scale: number) => {
        dispatch({ type: 'SET_SCALE', payload: scale })
    }, [dispatch])

    const setSnapLines = useCallback((lines: SnapLine[]) => {
        dispatch({ type: 'SET_SNAP_LINES', payload: lines })
    }, [dispatch])

    const setCanvasConfig = useCallback((config: Partial<CanvasConfig>) => {
        dispatch({ type: 'SET_CANVAS_CONFIG', payload: config })
    }, [dispatch])

    // Memoized context values
    const componentsValue = useMemo<ComponentsContextType>(() => ({
        components: state.components,
        addComponent,
        updateComponent,
        deleteComponent,
        deleteComponents,
        moveComponent,
        reorderLayers,
        toggleVisibility,
        toggleLock,
        copyComponent,
        groupComponents,
        ungroupComponents,
        bringForward,
        sendBackward,
        bringToFront,
        sendToBack,
    }), [state.components, addComponent, updateComponent, deleteComponent, deleteComponents, moveComponent, reorderLayers, toggleVisibility, toggleLock, copyComponent, groupComponents, ungroupComponents, bringForward, sendBackward, bringToFront, sendToBack])

    const selectionValue = useMemo<SelectionContextType>(() => ({
        selectedId: state.selectedId,
        selectedIds: state.selectedIds,
        selectComponent,
        selectComponents,
        getSelectedComponent,
    }), [state.selectedId, state.selectedIds, selectComponent, selectComponents, getSelectedComponent])

    const canvasValue = useMemo<CanvasContextType>(() => ({
        scale: state.scale,
        snapLines: state.snapLines,
        canvasConfig: state.canvasConfig,
        setScale,
        setSnapLines,
        setCanvasConfig,
    }), [state.scale, state.snapLines, state.canvasConfig, setScale, setSnapLines, setCanvasConfig])

    const historyValue = useMemo<HistoryContextType>(() => ({
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
    }), [undo, redo, history.past.length, history.future.length])

    // 完整的编辑器 context（向后兼容）
    const editorValue = useMemo<EditorContextType>(() => ({
        state,
        dispatch,
        ...componentsValue,
        ...selectionValue,
        ...canvasValue,
        ...historyValue,
    }), [state, dispatch, componentsValue, selectionValue, canvasValue, historyValue])

    return (
        <EditorContext.Provider value={editorValue}>
            <ComponentsContext.Provider value={componentsValue}>
                <SelectionContext.Provider value={selectionValue}>
                    <CanvasContext.Provider value={canvasValue}>
                        <HistoryContext.Provider value={historyValue}>
                            {children}
                        </HistoryContext.Provider>
                    </CanvasContext.Provider>
                </SelectionContext.Provider>
            </ComponentsContext.Provider>
        </EditorContext.Provider>
    )
}

// ============= Hooks =============

/**
 * 获取完整的编辑器 Context（向后兼容）
 */
export function useEditor() {
    const context = useContext(EditorContext)
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider')
    }
    return context
}

/**
 * 仅获取组件相关操作（减少不必要的重渲染）
 */
export function useComponents() {
    const context = useContext(ComponentsContext)
    if (!context) {
        throw new Error('useComponents must be used within an EditorProvider')
    }
    return context
}

/**
 * 仅获取选择状态（减少不必要的重渲染）
 */
export function useSelection() {
    const context = useContext(SelectionContext)
    if (!context) {
        throw new Error('useSelection must be used within an EditorProvider')
    }
    return context
}

/**
 * 仅获取画布配置（减少不必要的重渲染）
 */
export function useCanvas() {
    const context = useContext(CanvasContext)
    if (!context) {
        throw new Error('useCanvas must be used within an EditorProvider')
    }
    return context
}

/**
 * 仅获取历史记录操作（减少不必要的重渲染）
 */
export function useHistory() {
    const context = useContext(HistoryContext)
    if (!context) {
        throw new Error('useHistory must be used within an EditorProvider')
    }
    return context
}

// 导出类型
export type { EditorAction, EditorContextType, ComponentsContextType, SelectionContextType, CanvasContextType, HistoryContextType }
