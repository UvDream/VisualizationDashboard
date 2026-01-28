import { useCallback, useMemo } from 'react'
import { useEditor } from '../context/EditorContext'

/**
 * 历史记录增强 Hook
 * 提供更多历史记录相关的功能
 */
export function useHistory() {
    const { undo, redo, canUndo, canRedo, state } = useEditor()

    // 批量撤销到指定步数
    const undoSteps = useCallback((steps: number) => {
        for (let i = 0; i < steps && canUndo; i++) {
            undo()
        }
    }, [undo, canUndo])

    // 批量重做到指定步数
    const redoSteps = useCallback((steps: number) => {
        for (let i = 0; i < steps && canRedo; i++) {
            redo()
        }
    }, [redo, canRedo])

    // 清空历史记录（通过重新加载状态实现）
    const clearHistory = useCallback(() => {
        // 这个功能需要在 EditorContext 中实现
        console.warn('clearHistory 功能需要在 EditorContext 中实现')
    }, [])

    // 获取历史记录统计信息
    const historyStats = useMemo(() => {
        return {
            canUndo,
            canRedo,
            hasHistory: canUndo || canRedo,
            componentsCount: state.components.length,
            selectedCount: state.selectedIds.length,
        }
    }, [canUndo, canRedo, state.components.length, state.selectedIds.length])

    // 检查是否有未保存的更改
    const hasUnsavedChanges = useMemo(() => {
        return canUndo // 如果可以撤销，说明有未保存的更改
    }, [canUndo])

    return {
        // 基础功能
        undo,
        redo,
        canUndo,
        canRedo,
        
        // 增强功能
        undoSteps,
        redoSteps,
        clearHistory,
        
        // 状态信息
        historyStats,
        hasUnsavedChanges,
    }
}

/**
 * 历史记录快捷键 Hook
 * 用于在特定组件中启用历史记录快捷键
 */
export function useHistoryShortcuts(enabled: boolean = true) {
    const { undo, redo, canUndo, canRedo } = useHistory()

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return

        // 检查是否在输入框中
        const target = event.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
            return
        }

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
        const ctrlKey = isMac ? event.metaKey : event.ctrlKey

        // Ctrl/Cmd + Z: 撤销
        if (ctrlKey && event.key === 'z' && !event.shiftKey && canUndo) {
            event.preventDefault()
            undo()
            return
        }

        // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y: 重做
        if (((ctrlKey && event.key === 'z' && event.shiftKey) || (ctrlKey && event.key === 'y')) && canRedo) {
            event.preventDefault()
            redo()
            return
        }
    }, [enabled, undo, redo, canUndo, canRedo])

    return { handleKeyDown }
}