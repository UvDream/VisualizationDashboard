import React, { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode } from 'react'
import type { EditorState, EditorAction, ComponentItem, SnapLine, CanvasConfig } from '../types'
import { MAX_HISTORY_LENGTH } from '../config/constants'

// 初始状态
const getInitialState = (): EditorState => {
    // 尝试从 localStorage 加载状态
    const savedState = localStorage.getItem('editorState')
    if (savedState) {
        try {
            const parsed = JSON.parse(savedState)
            // 确保必要的字段存在，并提供默认值
            return {
                ...parsed,
                selectedIds: parsed.selectedIds || [],
                canvasConfig: {
                    width: 1920,
                    height: 1080,
                    backgroundColor: '#000000',
                    name: '大屏可视化',
                    backgroundType: 'color',
                    backgroundImageMode: 'cover',
                    backgroundImageOpacity: 1,
                    // 合并保存的配置，覆盖默认值
                    ...parsed.canvasConfig,
                    // 确保 chartTheme 存在
                    chartTheme: {
                        type: 'preset',
                        presetName: 'professional',
                        customColors: [],
                        // 合并保存的图表主题配置
                        ...parsed.canvasConfig?.chartTheme,
                    }
                }
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
                presetName: 'professional',
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

        case 'IMPORT_PROJECT':
            return {
                ...state,
                canvasConfig: action.payload.canvasConfig,
                components: action.payload.components,
                selectedId: null,
                selectedIds: [],
                scale: 1, // 重置缩放
                snapLines: [], // 清除对齐线
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
    // 新增：详细的历史记录描述
    pastActions: HistoryAction[]
    futureActions: HistoryAction[]
}

// 历史记录操作描述
interface HistoryAction {
    id: string
    type: string
    description: string
    componentName?: string
    componentType?: string
    timestamp: number
    icon: string
}

// 历史状态存储 key
const HISTORY_STORAGE_KEY = 'editorHistoryState'

// 获取初始历史状态（从 localStorage 加载）
const getInitialHistoryState = (): HistoryState => {
    try {
        const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY)
        if (savedHistory) {
            const parsed = JSON.parse(savedHistory)
            // 验证数据结构完整性
            if (parsed.past && parsed.present && parsed.future !== undefined &&
                parsed.pastActions && parsed.futureActions !== undefined) {
                // 确保 present 中 selectedIds 存在
                return {
                    ...parsed,
                    present: {
                        ...parsed.present,
                        selectedIds: parsed.present.selectedIds || []
                    }
                }
            }
        }
    } catch (error) {
        console.error('Failed to load history state from localStorage:', error)
    }
    // 默认初始历史状态
    return {
        past: [],
        present: initialState,
        future: [],
        pastActions: [],
        futureActions: [],
    }
}

// 保存历史状态到 localStorage
const saveHistoryState = (state: HistoryState) => {
    try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(state))
        // 同时保存当前状态（兼容旧逻辑）
        localStorage.setItem('editorState', JSON.stringify(state.present))
    } catch (error) {
        console.error('Failed to save history state to localStorage:', error)
    }
}

const initialHistory: HistoryState = getInitialHistoryState()

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

// 生成历史记录操作描述
function generateActionDescription(action: EditorAction, state: EditorState): HistoryAction {
    const timestamp = Date.now()
    const id = `action_${timestamp}`

    // 组件类型映射
    const componentTypeMap: Record<string, string> = {
        'singleLineChart': '单折线图',
        'doubleLineChart': '双折线图',
        'singleBarChart': '单柱状图',
        'doubleBarChart': '双柱状图',
        'horizontalBarChart': '横向柱状图',
        'pieChart': '饼图',
        'halfPieChart': '半饼图',
        'funnelChart': '漏斗图',
        'wordCloudChart': '词云图',
        'gaugeChart': '仪表盘',
        'radarChart': '雷达图',
        'scatterChart': '散点图',
        'mapChart': '地图',
        'cityMapChart': '城市地图',
        'calendarChart': '日历图',
        'treeChart': '树图',
        'sankeyChart': '桑基图',
        'text': '文本',
        'button': '按钮',
        'input': '输入框',
        'select': '选择器',
        'switch': '开关',
        'progress': '进度条',
        'tag': '标签',
        'badge': '徽章',
        'avatar': '头像',
        'card': '卡片',
        'table': '表格',
        'scrollRankList': '滚动排行榜',
        'carouselList': '轮播列表',
        'borderBox1': '边框1',
        'borderBox2': '边框2',
        'borderBox3': '边框3',
        'decoration1': '装饰1',
        'decoration2': '装饰2',
        'fullscreenButton': '全屏按钮',
        'customImageBorder': '自定义图片边框',
        'image': '图片',
        'carousel': '轮播图',
        'icon': '图标',
        'container': '容器',
        'layoutTwoColumn': '两列布局',
        'layoutThreeColumn': '三列布局',
        'layoutHeader': '头部布局',
        'layoutSidebar': '侧边栏布局',
    }

    switch (action.type) {
        case 'ADD_COMPONENT': {
            const component = action.payload as ComponentItem
            const typeName = componentTypeMap[component.type] || component.type
            return {
                id,
                type: action.type,
                description: `新增 - ${typeName}`,
                componentName: component.name,
                componentType: component.type,
                timestamp,
                icon: '➕'
            }
        }

        case 'DELETE_COMPONENT': {
            const componentId = action.payload as string
            const component = state.components.find(c => c.id === componentId)
            const typeName = component ? (componentTypeMap[component.type] || component.type) : '组件'
            return {
                id,
                type: action.type,
                description: `删除 - ${typeName}`,
                componentName: component?.name,
                componentType: component?.type,
                timestamp,
                icon: '🗑️'
            }
        }

        case 'DELETE_COMPONENTS': {
            const componentIds = action.payload as string[]
            return {
                id,
                type: action.type,
                description: `删除 - ${componentIds.length}个组件`,
                timestamp,
                icon: '🗑️'
            }
        }

        case 'UPDATE_COMPONENT': {
            const { id: componentId, updates } = action.payload as { id: string; updates: Partial<ComponentItem> }
            const component = state.components.find(c => c.id === componentId)
            const typeName = component ? (componentTypeMap[component.type] || component.type) : '组件'

            // 判断更新类型
            if (updates.style) {
                const styleUpdates = updates.style
                if ('x' in styleUpdates || 'y' in styleUpdates) {
                    return {
                        id,
                        type: action.type,
                        description: `移动位置 - ${typeName}`,
                        componentName: component?.name,
                        componentType: component?.type,
                        timestamp,
                        icon: '📍'
                    }
                }
                if ('width' in styleUpdates || 'height' in styleUpdates) {
                    return {
                        id,
                        type: action.type,
                        description: `调整大小 - ${typeName}`,
                        componentName: component?.name,
                        componentType: component?.type,
                        timestamp,
                        icon: '📏'
                    }
                }
                return {
                    id,
                    type: action.type,
                    description: `修改样式 - ${typeName}`,
                    componentName: component?.name,
                    componentType: component?.type,
                    timestamp,
                    icon: '🎨'
                }
            }

            return {
                id,
                type: action.type,
                description: `修改属性 - ${typeName}`,
                componentName: component?.name,
                componentType: component?.type,
                timestamp,
                icon: '⚙️'
            }
        }

        case 'MOVE_COMPONENT': {
            const { id: componentId } = action.payload as { id: string; x: number; y: number }
            const component = state.components.find(c => c.id === componentId)
            const typeName = component ? (componentTypeMap[component.type] || component.type) : '组件'
            return {
                id,
                type: action.type,
                description: `移动位置 - ${typeName}`,
                componentName: component?.name,
                componentType: component?.type,
                timestamp,
                icon: '📍'
            }
        }

        case 'REORDER_LAYERS': {
            return {
                id,
                type: action.type,
                description: '调整图层顺序',
                timestamp,
                icon: '📚'
            }
        }

        case 'TOGGLE_VISIBILITY': {
            const componentId = action.payload as string
            const component = state.components.find(c => c.id === componentId)
            const typeName = component ? (componentTypeMap[component.type] || component.type) : '组件'
            const isVisible = component?.visible
            return {
                id,
                type: action.type,
                description: `${isVisible ? '隐藏' : '显示'} - ${typeName}`,
                componentName: component?.name,
                componentType: component?.type,
                timestamp,
                icon: isVisible ? '👁️' : '🙈'
            }
        }

        case 'TOGGLE_LOCK': {
            const componentId = action.payload as string
            const component = state.components.find(c => c.id === componentId)
            const typeName = component ? (componentTypeMap[component.type] || component.type) : '组件'
            const isLocked = component?.locked
            return {
                id,
                type: action.type,
                description: `${isLocked ? '解锁' : '锁定'} - ${typeName}`,
                componentName: component?.name,
                componentType: component?.type,
                timestamp,
                icon: isLocked ? '🔓' : '🔒'
            }
        }

        case 'GROUP_COMPONENTS': {
            const componentIds = action.payload as string[]
            return {
                id,
                type: action.type,
                description: `组合 - ${componentIds.length}个组件`,
                timestamp,
                icon: '📦'
            }
        }

        case 'UNGROUP_COMPONENTS': {
            return {
                id,
                type: action.type,
                description: '取消组合',
                timestamp,
                icon: '📤'
            }
        }

        case 'SET_CANVAS_CONFIG': {
            return {
                id,
                type: action.type,
                description: '画布设置',
                timestamp,
                icon: '🖼️'
            }
        }

        default: {
            return {
                id,
                type: action.type,
                description: '未知操作',
                timestamp,
                icon: '❓'
            }
        }
    }
}

// History Reducer
function historyReducer(state: HistoryState, action: EditorAction | { type: 'UNDO' } | { type: 'REDO' } | { type: 'JUMP_TO_HISTORY'; payload: number }): HistoryState {
    const { past, present, future, pastActions, futureActions } = state

    switch (action.type) {
        case 'UNDO':
            if (past.length === 0) return state
            const previous = past[past.length - 1]
            const newPast = past.slice(0, -1)
            const lastAction = pastActions[pastActions.length - 1]
            const newUndoState = {
                past: newPast,
                present: previous,
                future: [present, ...future],
                pastActions: pastActions.slice(0, -1),
                futureActions: lastAction ? [lastAction, ...futureActions] : futureActions,
            }
            // 保存完整历史状态到 localStorage
            saveHistoryState(newUndoState)
            // 触发自定义事件通知其他页面状态变化
            window.dispatchEvent(new CustomEvent('editorStateChange'))
            return newUndoState

        case 'REDO':
            if (future.length === 0) return state
            const next = future[0]
            const newFuture = future.slice(1)
            const nextAction = futureActions[0]
            const newRedoState = {
                past: [...past, present],
                present: next,
                future: newFuture,
                pastActions: nextAction ? [...pastActions, nextAction] : pastActions,
                futureActions: futureActions.slice(1),
            }
            // 保存完整历史状态到 localStorage
            saveHistoryState(newRedoState)
            // 触发自定义事件通知其他页面状态变化
            window.dispatchEvent(new CustomEvent('editorStateChange'))
            return newRedoState

        case 'JUMP_TO_HISTORY': {
            const targetIndex = action.payload
            const totalPastLength = past.length

            // 有效范围是 0 到 totalPastLength + future.length
            if (targetIndex < 0 || targetIndex > totalPastLength + future.length) {
                return state
            }

            let newState: HistoryState

            if (targetIndex === totalPastLength) {
                // 跳转到当前状态，不需要改变
                return state
            } else if (targetIndex < totalPastLength) {
                // 跳转到过去的某个状态
                const targetState = past[targetIndex]
                const newPastStates = past.slice(0, targetIndex)
                const newFutureStates = [...past.slice(targetIndex + 1), present, ...future]
                const newPastActions = pastActions.slice(0, targetIndex)
                const newFutureActions = [...pastActions.slice(targetIndex), ...futureActions]

                newState = {
                    past: newPastStates,
                    present: targetState,
                    future: newFutureStates,
                    pastActions: newPastActions,
                    futureActions: newFutureActions,
                }

            } else {
                // 跳转到未来的某个状态
                const futureIndex = targetIndex - totalPastLength - 1
                const targetState = future[futureIndex]
                const newPastStates = [...past, present, ...future.slice(0, futureIndex)]
                const newFutureStates = future.slice(futureIndex + 1)
                const newPastActions = [...pastActions, ...futureActions.slice(0, futureIndex + 1)]
                const newFutureActions = futureActions.slice(futureIndex + 1)

                newState = {
                    past: newPastStates,
                    present: targetState,
                    future: newFutureStates,
                    pastActions: newPastActions,
                    futureActions: newFutureActions,
                }
            }

            // 保存完整历史状态到 localStorage
            saveHistoryState(newState)
            // 触发自定义事件通知其他页面状态变化
            window.dispatchEvent(new CustomEvent('editorStateChange'))
            return newState
        }

        default:
            const newPresent = editorReducer(present, action as EditorAction)

            if (newPresent === present) return state

            // 如果是需要记录历史的操作，推入 past
            if (HISTORY_ACTIONS.includes(action.type)) {
                // 生成操作描述
                const actionDescription = generateActionDescription(action as EditorAction, present)

                // 限制历史记录长度
                const newPast = [...past, present]
                const newPastActions = [...pastActions, actionDescription]

                if (newPast.length > MAX_HISTORY_LENGTH) {
                    newPast.shift() // 移除最早的历史记录
                    newPastActions.shift() // 移除最早的操作描述
                }

                const newHistoryState = {
                    past: newPast,
                    present: newPresent,
                    future: [], // 清空 future
                    pastActions: newPastActions,
                    futureActions: [], // 清空 future actions
                }
                // 保存完整历史状态到 localStorage
                saveHistoryState(newHistoryState)
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
                // 保存完整历史状态到 localStorage
                saveHistoryState(newOtherState)
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
    importProject: (data: { canvasConfig: CanvasConfig; components: ComponentItem[] }) => void
    undo: () => void
    redo: () => void
    canUndo: boolean
    canRedo: boolean
    // 新增：暴露历史记录数据
    historyLength: number
    futureLength: number
    // 新增：详细历史记录
    historyActions: HistoryAction[]
    futureActions: HistoryAction[]
    jumpToHistory: (index: number) => void
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
    const jumpToHistory = React.useCallback((index: number) => dispatchHistory({ type: 'JUMP_TO_HISTORY', payload: index }), [])

    // 添加快捷键支持
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // 检查是否在输入框中，如果是则不处理快捷键
            const target = event.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
                return
            }

            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
            const ctrlKey = isMac ? event.metaKey : event.ctrlKey

            // Ctrl/Cmd + Z: 撤销
            if (ctrlKey && event.key === 'z' && !event.shiftKey) {
                event.preventDefault()
                if (history.past.length > 0) {
                    undo()
                }
                return
            }

            // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y: 重做
            if ((ctrlKey && event.key === 'z' && event.shiftKey) || (ctrlKey && event.key === 'y')) {
                event.preventDefault()
                if (history.future.length > 0) {
                    redo()
                }
                return
            }

            // Delete 或 Backspace: 删除选中组件
            if ((event.key === 'Delete' || event.key === 'Backspace') && (state.selectedId || state.selectedIds.length > 0)) {
                event.preventDefault()
                const selectedIds = state.selectedIds || []
                if (selectedIds.length > 1) {
                    dispatchHistory({ type: 'DELETE_COMPONENTS', payload: selectedIds })
                } else if (state.selectedId) {
                    dispatchHistory({ type: 'DELETE_COMPONENT', payload: state.selectedId })
                }
                return
            }

            // Escape: 取消选择
            if (event.key === 'Escape') {
                event.preventDefault()
                dispatchHistory({ type: 'SELECT_COMPONENT', payload: null })
                return
            }

            // F11: 切换专注模式
            if (event.key === 'F11') {
                event.preventDefault()
                dispatchHistory({ type: 'TOGGLE_ZEN_MODE', payload: !state.zenMode })
                return
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [history.past.length, history.future.length, state.selectedId, state.selectedIds, state.zenMode, undo, redo])

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

    const importProject = React.useCallback((data: { canvasConfig: CanvasConfig; components: ComponentItem[] }) => {
        dispatch({ type: 'IMPORT_PROJECT', payload: data })
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
        importProject,
        undo,
        redo,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        // 新增：暴露历史记录数据
        historyLength: history.past.length,
        futureLength: history.future.length,
        // 新增：详细历史记录
        historyActions: history.pastActions,
        futureActions: history.futureActions,
        jumpToHistory,
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
        jumpToHistory,
        history.past.length,
        history.future.length,
        history.pastActions,
        history.futureActions,
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
