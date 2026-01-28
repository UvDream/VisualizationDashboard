import type { EditorAction } from '../types'

/**
 * 历史记录工具函数
 */

// 可以合并的操作类型
const MERGEABLE_ACTIONS = ['MOVE_COMPONENT', 'UPDATE_COMPONENT'] as const

// 操作合并的时间窗口（毫秒）
const MERGE_TIME_WINDOW = 500

// 上一次操作的记录
let lastAction: {
    type: string
    payload: any
    timestamp: number
} | null = null

/**
 * 检查两个操作是否可以合并
 */
export function canMergeActions(
    prevAction: EditorAction,
    currentAction: EditorAction,
    timeWindow: number = MERGE_TIME_WINDOW
): boolean {
    // 检查操作类型是否可合并
    if (!MERGEABLE_ACTIONS.includes(prevAction.type as any) || 
        !MERGEABLE_ACTIONS.includes(currentAction.type as any)) {
        return false
    }

    // 必须是相同类型的操作
    if (prevAction.type !== currentAction.type) {
        return false
    }

    // 检查时间窗口
    const now = Date.now()
    if (lastAction && (now - lastAction.timestamp) > timeWindow) {
        return false
    }

    // 针对不同操作类型的特殊检查
    switch (currentAction.type) {
        case 'MOVE_COMPONENT':
            // 移动操作：必须是同一个组件
            return (prevAction as any).payload.id === (currentAction as any).payload.id

        case 'UPDATE_COMPONENT':
            // 更新操作：必须是同一个组件，且更新的是样式属性
            const prevPayload = (prevAction as any).payload
            const currentPayload = (currentAction as any).payload
            
            if (prevPayload.id !== currentPayload.id) {
                return false
            }

            // 检查是否都是样式更新
            const isStyleUpdate = (updates: any) => {
                return updates && typeof updates === 'object' && 
                       Object.keys(updates).some(key => key === 'style')
            }

            return isStyleUpdate(prevPayload.updates) && isStyleUpdate(currentPayload.updates)

        default:
            return false
    }
}

/**
 * 合并两个操作
 */
export function mergeActions(
    prevAction: EditorAction,
    currentAction: EditorAction
): EditorAction {
    switch (currentAction.type) {
        case 'MOVE_COMPONENT':
            // 移动操作：使用最新的位置
            return currentAction

        case 'UPDATE_COMPONENT':
            // 更新操作：合并更新内容
            const prevPayload = (prevAction as any).payload
            const currentPayload = (currentAction as any).payload

            return {
                ...currentAction,
                payload: {
                    ...currentPayload,
                    updates: {
                        ...prevPayload.updates,
                        ...currentPayload.updates,
                        // 如果都有 style 更新，合并 style
                        ...(prevPayload.updates?.style && currentPayload.updates?.style ? {
                            style: {
                                ...prevPayload.updates.style,
                                ...currentPayload.updates.style
                            }
                        } : {})
                    }
                }
            }

        default:
            return currentAction
    }
}

/**
 * 记录操作（用于合并检查）
 */
export function recordAction(action: EditorAction): void {
    lastAction = {
        type: action.type,
        payload: action.payload,
        timestamp: Date.now()
    }
}

/**
 * 清除操作记录
 */
export function clearActionRecord(): void {
    lastAction = null
}

/**
 * 获取操作的显示名称
 */
export function getActionDisplayName(actionType: string): string {
    const actionNames: Record<string, string> = {
        'ADD_COMPONENT': '添加组件',
        'UPDATE_COMPONENT': '更新组件',
        'DELETE_COMPONENT': '删除组件',
        'DELETE_COMPONENTS': '删除多个组件',
        'MOVE_COMPONENT': '移动组件',
        'REORDER_LAYERS': '调整图层',
        'TOGGLE_VISIBILITY': '切换可见性',
        'TOGGLE_LOCK': '切换锁定',
        'SET_CANVAS_CONFIG': '设置画布',
        'GROUP_COMPONENTS': '组合组件',
        'UNGROUP_COMPONENTS': '取消组合',
    }

    return actionNames[actionType] || actionType
}

/**
 * 检查操作是否会影响组件
 */
export function isComponentAction(actionType: string): boolean {
    const componentActions = [
        'ADD_COMPONENT',
        'UPDATE_COMPONENT',
        'DELETE_COMPONENT',
        'DELETE_COMPONENTS',
        'MOVE_COMPONENT',
        'TOGGLE_VISIBILITY',
        'TOGGLE_LOCK',
        'GROUP_COMPONENTS',
        'UNGROUP_COMPONENTS',
    ]

    return componentActions.includes(actionType)
}

/**
 * 检查操作是否会影响画布
 */
export function isCanvasAction(actionType: string): boolean {
    const canvasActions = [
        'SET_CANVAS_CONFIG',
        'REORDER_LAYERS',
    ]

    return canvasActions.includes(actionType)
}

/**
 * 防抖函数，用于延迟执行历史记录保存
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout)
        }

        timeout = setTimeout(() => {
            func(...args)
        }, wait)
    }
}