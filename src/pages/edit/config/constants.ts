/**
 * 编辑器常量配置
 */

// 吸附配置
export const SNAP_THRESHOLD = 5 // 吸附阈值（像素）

// 缩放配置
export const SCALE_MIN = 0.2 // 最小缩放比例
export const SCALE_MAX = 2.0 // 最大缩放比例
export const SCALE_STEP = 0.1 // 缩放步长

// 画布默认配置
export const DEFAULT_CANVAS_WIDTH = 1920
export const DEFAULT_CANVAS_HEIGHT = 1080
export const DEFAULT_CANVAS_BACKGROUND = '#000000'

// 组件最小尺寸
export const MIN_COMPONENT_WIDTH = 10
export const MIN_COMPONENT_HEIGHT = 10

// 历史记录相关
export const MAX_HISTORY_LENGTH = 50 // 最大历史记录数

// localStorage 防抖延迟
export const STORAGE_DEBOUNCE_DELAY = 300 // 毫秒

// 需要记录历史的操作类型
export const HISTORY_ACTIONS = [
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
] as const

// 需要触发事件的操作类型（排除 SYNC_STATE）
export const EVENT_TRIGGER_ACTIONS = [
    ...HISTORY_ACTIONS,
    'SELECT_COMPONENT',
    'SELECT_COMPONENTS',
    'SET_SCALE',
    'SET_SNAP_LINES',
] as const

// 布局组件类型
export const LAYOUT_COMPONENT_TYPES = [
    'layoutTwoColumn',
    'layoutThreeColumn',
    'layoutHeader',
    'layoutSidebar',
] as const

// 图表组件类型（需要轴配置）
export const AXIS_CHART_TYPES = [
    'singleLineChart',
    'doubleLineChart',
    'singleBarChart',
    'doubleBarChart',
    'horizontalBarChart',
    'scatterChart',
] as const

// 日历热力图语言配置
export const CALENDAR_MONTH_NAMES: Record<string, string[]> = {
    zh: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}

export const CALENDAR_DAY_NAMES: Record<string, string[]> = {
    zh: ['日', '一', '二', '三', '四', '五', '六'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}
