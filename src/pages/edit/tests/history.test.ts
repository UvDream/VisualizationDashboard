/**
 * 历史记录功能测试
 * 这是一个简单的测试文件，用于验证历史记录功能的基本逻辑
 */

import { canMergeActions, mergeActions, getActionDisplayName } from '../utils/historyUtils'
import type { EditorAction } from '../types'

// 模拟操作数据
const mockMoveAction1: EditorAction = {
    type: 'MOVE_COMPONENT',
    payload: { id: 'comp1', x: 100, y: 100 }
}

const mockMoveAction2: EditorAction = {
    type: 'MOVE_COMPONENT',
    payload: { id: 'comp1', x: 120, y: 110 }
}

const mockUpdateAction1: EditorAction = {
    type: 'UPDATE_COMPONENT',
    payload: {
        id: 'comp1',
        updates: {
            style: { width: 100, height: 100 }
        }
    }
}

const mockUpdateAction2: EditorAction = {
    type: 'UPDATE_COMPONENT',
    payload: {
        id: 'comp1',
        updates: {
            style: { width: 120, height: 120 }
        }
    }
}

const mockAddAction: EditorAction = {
    type: 'ADD_COMPONENT',
    payload: {
        id: 'comp2',
        type: 'text',
        name: '文本组件',
        props: { content: 'Hello' },
        style: { x: 0, y: 0, width: 100, height: 50 },
        visible: true,
        locked: false
    }
}

// 测试函数
function runTests() {
    console.log('🧪 开始历史记录功能测试...')

    // 测试 1: 操作合并检查
    console.log('\n📋 测试 1: 操作合并检查')
    
    // 相同组件的移动操作应该可以合并
    const canMergeMove = canMergeActions(mockMoveAction1, mockMoveAction2, 1000)
    console.log(`✅ 相同组件移动操作合并: ${canMergeMove ? '通过' : '失败'}`)

    // 相同组件的样式更新应该可以合并
    const canMergeUpdate = canMergeActions(mockUpdateAction1, mockUpdateAction2, 1000)
    console.log(`✅ 相同组件样式更新合并: ${canMergeUpdate ? '通过' : '失败'}`)

    // 不同类型的操作不应该合并
    const canMergeDifferent = canMergeActions(mockMoveAction1, mockAddAction, 1000)
    console.log(`✅ 不同类型操作不合并: ${!canMergeDifferent ? '通过' : '失败'}`)

    // 测试 2: 操作合并
    console.log('\n🔄 测试 2: 操作合并')
    
    const mergedMove = mergeActions(mockMoveAction1, mockMoveAction2)
    const isMoveMerged = mergedMove.type === 'MOVE_COMPONENT' && 
                        (mergedMove.payload as any).x === 120 && 
                        (mergedMove.payload as any).y === 110
    console.log(`✅ 移动操作合并结果: ${isMoveMerged ? '通过' : '失败'}`)

    const mergedUpdate = mergeActions(mockUpdateAction1, mockUpdateAction2)
    const isUpdateMerged = mergedUpdate.type === 'UPDATE_COMPONENT' &&
                          (mergedUpdate.payload as any).updates.style.width === 120 &&
                          (mergedUpdate.payload as any).updates.style.height === 120
    console.log(`✅ 更新操作合并结果: ${isUpdateMerged ? '通过' : '失败'}`)

    // 测试 3: 操作显示名称
    console.log('\n🏷️ 测试 3: 操作显示名称')
    
    const moveDisplayName = getActionDisplayName('MOVE_COMPONENT')
    console.log(`✅ 移动操作显示名称: ${moveDisplayName === '移动组件' ? '通过' : '失败'} (${moveDisplayName})`)

    const addDisplayName = getActionDisplayName('ADD_COMPONENT')
    console.log(`✅ 添加操作显示名称: ${addDisplayName === '添加组件' ? '通过' : '失败'} (${addDisplayName})`)

    const unknownDisplayName = getActionDisplayName('UNKNOWN_ACTION')
    console.log(`✅ 未知操作显示名称: ${unknownDisplayName === 'UNKNOWN_ACTION' ? '通过' : '失败'} (${unknownDisplayName})`)

    console.log('\n🎉 历史记录功能测试完成!')
}

// 导出测试函数，可以在浏览器控制台中调用
if (typeof window !== 'undefined') {
    (window as any).testHistory = runTests
}

export { runTests as testHistoryFunctions }