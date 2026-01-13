// 组件类型枚举
export type ComponentType =
    // 图表类 - ECharts
    | 'lineChart' | 'barChart' | 'pieChart' | 'gaugeChart' | 'radarChart' | 'scatterChart'
    // 组件库 - Antd
    | 'text' | 'button' | 'input' | 'select' | 'switch' | 'progress' | 'tag' | 'badge' | 'avatar' | 'card' | 'table'
    // 小组件 - 装饰
    | 'borderBox1' | 'borderBox2' | 'borderBox3' | 'decoration1' | 'decoration2'
    // 图片
    | 'image' | 'carousel'
    // 图标
    | 'icon'
    // 容器
    | 'container'
    // 3D组件
    | 'threeEarth' | 'threeParticles'

// 组件分类
export type ComponentCategory = 'chart' | 'component' | 'widget' | 'image' | 'icon' | '3d'

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

// 图表图例配置
export interface ChartLegendConfig {
    show?: boolean
    orient?: 'horizontal' | 'vertical' // 布局方向
    position?: 'top' | 'bottom' | 'left' | 'right' // 简化版位置
    align?: 'left' | 'center' | 'right' // 对齐方式 (alignment within the position) -> ECharts uses left/top/right/bottom combination. 
    // Let's simplify for user: Position (Top/Bottom/Left/Right) + Alignment (Start/Center/End) is complex to map directly.
    // ECharts has left/top/right/bottom. 
    // Let's use:
    // left: 'left' | 'center' | 'right' | number
    // top: 'top' | 'middle' | 'bottom' | number
    left?: string
    top?: string
    textStyle?: {
        color?: string
        fontSize?: number
        fontWeight?: string
    }
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
    chartData?: unknown
    chartOption?: unknown

    // 图标属性
    iconType?: string

    // 装饰边框属性
    borderStyle?: number

    // 进度条
    percent?: number

    // 标签
    tagColor?: string

    // 表格属性
    tableColumns?: Array<{ title: string; dataIndex: string; key: string }>
    tableData?: Array<Record<string, any>>

    // 图表数据
    chartTitle?: string
    xAxisData?: string[]
    seriesData?: Array<{ name: string; data: any[] }>
    pieData?: Array<{ name: string; value: number }>
    singleData?: number
    legend?: ChartLegendConfig

    // 下拉选择选项
    selectOptions?: Array<{ label: string; value: string }>

    // 开关
    checked?: boolean
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

// 吸附线
export interface SnapLine {
    type: 'v' | 'h'  // 垂直或水平
    position: number // 位置坐标
}

export interface CanvasConfig {
    width: number
    height: number
    backgroundColor: string
    name: string
}

// 编辑器状态
export interface EditorState {
    components: ComponentItem[]
    selectedId: string | null
    scale: number // 画布缩放比例
    snapLines: SnapLine[] // 当前显示的吸附辅助线
    canvasConfig: CanvasConfig // 画布配置
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
    | { type: 'SET_SCALE'; payload: number }
    | { type: 'SET_SNAP_LINES'; payload: SnapLine[] }
    | { type: 'SET_CANVAS_CONFIG'; payload: Partial<CanvasConfig> }

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
    icon: React.ReactNode
    category: ComponentCategory
    defaultProps: ComponentProps
    defaultStyle: Partial<ComponentStyle>
}
