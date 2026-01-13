// 组件类型枚举
export type ComponentType = 'text' | 'button' | 'image' | 'chart' | 'container'

// 组件样式
export interface ComponentStyle {
    x: number
    y: number
    width: number
    height: number
    backgroundColor?: string
    color?: string
    fontSize?: number
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    opacity?: number
    zIndex?: number
}

// 组件属性（根据类型不同有不同属性）
export interface ComponentProps {
    // 通用属性
    content?: string

    // 按钮属性
    buttonType?: 'primary' | 'default' | 'dashed' | 'link'

    // 图片属性
    src?: string
    alt?: string

    // 图表属性
    chartType?: 'line' | 'bar' | 'pie'
}

// 画布上的组件项
export interface ComponentItem {
    id: string
    type: ComponentType
    name: string
    props: ComponentProps
    style: ComponentStyle
    visible: boolean
    locked: boolean
}

// 编辑器状态
export interface EditorState {
    components: ComponentItem[]
    selectedId: string | null
}

// 编辑器 Action 类型
export type EditorAction =
    | { type: 'ADD_COMPONENT'; payload: ComponentItem }
    | { type: 'UPDATE_COMPONENT'; payload: { id: string; updates: Partial<ComponentItem> } }
    | { type: 'DELETE_COMPONENT'; payload: string }
    | { type: 'SELECT_COMPONENT'; payload: string | null }
    | { type: 'MOVE_COMPONENT'; payload: { id: string; x: number; y: number } }
    | { type: 'REORDER_LAYERS'; payload: ComponentItem[] }
    | { type: 'TOGGLE_VISIBILITY'; payload: string }
    | { type: 'TOGGLE_LOCK'; payload: string }

// 拖拽项类型
export interface DragItem {
    type: 'NEW_COMPONENT' | 'CANVAS_COMPONENT'
    componentType?: ComponentType
    id?: string
}

// 组件库项配置
export interface ComponentConfig {
    type: ComponentType
    name: string
    icon: string
    defaultProps: ComponentProps
    defaultStyle: Partial<ComponentStyle>
}
