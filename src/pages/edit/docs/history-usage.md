# 历史记录功能使用指南

## 概述

编辑器内置了完整的历史记录功能，支持撤销/重做操作，让用户可以安全地进行各种编辑操作。

## 功能特性

### ✅ 已实现的功能

1. **基础撤销/重做**
   - 支持 Ctrl+Z 撤销操作
   - 支持 Ctrl+Y 或 Ctrl+Shift+Z 重做操作
   - 工具栏撤销/重做按钮
   - 自动禁用不可用的按钮

2. **智能历史记录**
   - 只记录重要操作（添加、删除、移动、更新组件等）
   - 不记录临时操作（选择、缩放、面板切换等）
   - 历史记录长度限制（最多50条）
   - 自动清理过期记录

3. **快捷键支持**
   - Ctrl+Z / Cmd+Z: 撤销
   - Ctrl+Y / Cmd+Y: 重做
   - Ctrl+Shift+Z / Cmd+Shift+Z: 重做
   - Delete/Backspace: 删除选中组件
   - Esc: 取消选择
   - F11: 切换专注模式

4. **状态持久化**
   - 自动保存到 localStorage
   - 页面刷新后恢复状态
   - 防抖延迟保存（300ms）

5. **跨页面同步**
   - 编辑页面和预览页面状态同步
   - 自定义事件通知机制

## 使用方法

### 基础使用

```typescript
import { useEditor } from './context/EditorContext'

function MyComponent() {
    const { undo, redo, canUndo, canRedo } = useEditor()
    
    return (
        <div>
            <button disabled={!canUndo} onClick={undo}>撤销</button>
            <button disabled={!canRedo} onClick={redo}>重做</button>
        </div>
    )
}
```

### 使用历史记录 Hook

```typescript
import { useHistory } from './hooks/useHistory'

function MyComponent() {
    const { 
        undo, 
        redo, 
        canUndo, 
        canRedo, 
        historyStats, 
        hasUnsavedChanges 
    } = useHistory()
    
    return (
        <div>
            <p>可撤销: {historyStats.canUndo ? '是' : '否'}</p>
            <p>可重做: {historyStats.canRedo ? '是' : '否'}</p>
            <p>有未保存更改: {hasUnsavedChanges ? '是' : '否'}</p>
        </div>
    )
}
```

### 使用历史记录指示器

```typescript
import HistoryIndicator from './components/HistoryIndicator'

function Toolbar() {
    return (
        <div className="toolbar">
            <HistoryIndicator showSaveStatus={true} />
        </div>
    )
}
```

### 使用历史记录面板

```typescript
import HistoryPanel from './components/HistoryPanel'

function Sidebar() {
    return (
        <div className="sidebar">
            <HistoryPanel visible={true} />
        </div>
    )
}
```

## 记录的操作类型

以下操作会被记录到历史中：

| 操作类型 | 描述 | 触发条件 |
|---------|------|---------|
| `ADD_COMPONENT` | 添加组件 | 从组件库拖拽组件到画布 |
| `UPDATE_COMPONENT` | 更新组件 | 修改组件属性、样式等 |
| `DELETE_COMPONENT` | 删除组件 | 删除单个组件 |
| `DELETE_COMPONENTS` | 删除多个组件 | 批量删除组件 |
| `MOVE_COMPONENT` | 移动组件 | 拖拽移动组件位置 |
| `REORDER_LAYERS` | 调整图层 | 改变组件层级顺序 |
| `TOGGLE_VISIBILITY` | 切换可见性 | 显示/隐藏组件 |
| `TOGGLE_LOCK` | 切换锁定 | 锁定/解锁组件 |
| `SET_CANVAS_CONFIG` | 设置画布 | 修改画布尺寸、背景等 |
| `GROUP_COMPONENTS` | 组合组件 | 将多个组件组合 |
| `UNGROUP_COMPONENTS` | 取消组合 | 解散组件组合 |

## 不记录的操作类型

以下操作不会被记录到历史中：

- `SELECT_COMPONENT` - 选择组件
- `SELECT_COMPONENTS` - 多选组件
- `SET_SCALE` - 设置缩放比例
- `SET_SNAP_LINES` - 设置对齐线
- `TOGGLE_ZEN_MODE` - 切换专注模式
- `TOGGLE_PANEL` - 切换面板显示
- `SYNC_STATE` - 同步状态

## 开发调试

### 历史记录调试器

在开发环境中，页面右下角会显示历史记录调试器，可以：

- 查看当前历史记录状态
- 手动执行撤销/重做操作
- 查看当前状态详情
- 查看组件列表

### 调试信息

```typescript
// 在开发环境中启用调试器
import HistoryDebugger from './components/HistoryDebugger'

function App() {
    return (
        <div>
            {/* 其他组件 */}
            {process.env.NODE_ENV === 'development' && <HistoryDebugger />}
        </div>
    )
}
```

## 性能优化

### 历史记录长度限制

```typescript
// 在 constants.ts 中配置
export const MAX_HISTORY_LENGTH = 50 // 最大历史记录数
```

### 防抖保存

```typescript
// 在 constants.ts 中配置
export const STORAGE_DEBOUNCE_DELAY = 300 // localStorage 防抖延迟（毫秒）
```

### 操作合并（计划中）

未来版本将支持操作合并，例如：
- 连续的移动操作合并为一个历史记录
- 连续的样式更新合并为一个历史记录

## 最佳实践

1. **合理使用历史记录**
   - 重要操作前先保存当前状态
   - 避免频繁的小操作，考虑批量操作

2. **快捷键使用**
   - 熟练使用 Ctrl+Z/Ctrl+Y 快捷键
   - 在输入框中快捷键会被忽略，避免误操作

3. **状态管理**
   - 定期检查是否有未保存的更改
   - 重要操作前确认当前状态

4. **性能考虑**
   - 历史记录会占用内存，避免过长的操作历史
   - 大型项目考虑定期清理历史记录

## 故障排除

### 常见问题

1. **撤销/重做按钮不可用**
   - 检查是否有可撤销/重做的操作
   - 确认操作类型是否在 `HISTORY_ACTIONS` 中

2. **快捷键不生效**
   - 检查是否在输入框中
   - 确认浏览器是否支持快捷键

3. **状态不同步**
   - 检查 localStorage 是否可用
   - 确认事件监听器是否正常工作

4. **历史记录丢失**
   - 检查是否超过最大历史记录长度
   - 确认操作是否被正确记录

### 调试方法

1. 使用历史记录调试器查看状态
2. 检查浏览器控制台错误信息
3. 查看 localStorage 中的状态数据
4. 使用 React DevTools 查看 Context 状态

## 更新日志

### v1.0.0
- ✅ 基础撤销/重做功能
- ✅ 快捷键支持
- ✅ 状态持久化
- ✅ 历史记录长度限制
- ✅ 跨页面同步
- ✅ 历史记录指示器
- ✅ 开发调试工具

### 计划中的功能
- 🔄 操作合并优化
- 🔄 历史记录可视化时间线
- 🔄 批量撤销/重做
- 🔄 历史记录导出/导入
- 🔄 自定义历史记录策略