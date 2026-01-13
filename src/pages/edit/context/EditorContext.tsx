import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { EditorState, EditorAction, ComponentItem } from '../types'

// 初始状态
const initialState: EditorState = {
    components: [],
    selectedId: null,
}

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

        default:
            return state
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
    toggleVisibility: (id: string) => void
    toggleLock: (id: string) => void
    getSelectedComponent: () => ComponentItem | undefined
}

// 创建 Context
const EditorContext = createContext<EditorContextType | null>(null)

// Provider 组件
export function EditorProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(editorReducer, initialState)

    const addComponent = (component: ComponentItem) => {
        dispatch({ type: 'ADD_COMPONENT', payload: component })
    }

    const updateComponent = (id: string, updates: Partial<ComponentItem>) => {
        dispatch({ type: 'UPDATE_COMPONENT', payload: { id, updates } })
    }

    const deleteComponent = (id: string) => {
        dispatch({ type: 'DELETE_COMPONENT', payload: id })
    }

    const selectComponent = (id: string | null) => {
        dispatch({ type: 'SELECT_COMPONENT', payload: id })
    }

    const moveComponent = (id: string, x: number, y: number) => {
        dispatch({ type: 'MOVE_COMPONENT', payload: { id, x, y } })
    }

    const reorderLayers = (components: ComponentItem[]) => {
        dispatch({ type: 'REORDER_LAYERS', payload: components })
    }

    const toggleVisibility = (id: string) => {
        dispatch({ type: 'TOGGLE_VISIBILITY', payload: id })
    }

    const toggleLock = (id: string) => {
        dispatch({ type: 'TOGGLE_LOCK', payload: id })
    }

    const getSelectedComponent = () => {
        return state.components.find((comp) => comp.id === state.selectedId)
    }

    return (
        <EditorContext.Provider
            value={{
                state,
                dispatch,
                addComponent,
                updateComponent,
                deleteComponent,
                selectComponent,
                moveComponent,
                reorderLayers,
                toggleVisibility,
                toggleLock,
                getSelectedComponent,
            }}
        >
            {children}
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
