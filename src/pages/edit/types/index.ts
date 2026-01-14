// 组件类型枚举
export type ComponentType =
    // 图表类 - ECharts
    | 'singleLineChart' | 'doubleLineChart' | 'singleBarChart' | 'doubleBarChart' | 'horizontalBarChart' | 'pieChart' | 'halfPieChart' | 'funnelChart' | 'gaugeChart' | 'radarChart' | 'scatterChart' | 'mapChart' | 'calendarChart'
    // 组件库 - Antd
    | 'text' | 'button' | 'input' | 'select' | 'switch' | 'progress' | 'tag' | 'badge' | 'avatar' | 'card' | 'table' | 'scrollRankList' | 'carouselList'
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

// 图表轴配置
export interface ChartAxisConfig {
    show?: boolean
    type?: 'value' | 'category' | 'time' | 'log'
    name?: string
    nameLocation?: 'start' | 'middle' | 'end'
    nameTextStyle?: {
        color?: string
        fontSize?: number
        fontWeight?: string
    }
    nameGap?: number
    position?: 'top' | 'bottom' | 'left' | 'right'
    // 轴线
    axisLine?: {
        show?: boolean
        lineStyle?: {
            color?: string
            width?: number
            type?: 'solid' | 'dashed' | 'dotted'
        }
    }
    // 刻度线
    axisTick?: {
        show?: boolean
        lineStyle?: {
            color?: string
            width?: number
        }
    }
    // 轴标签
    axisLabel?: {
        show?: boolean
        color?: string
        fontSize?: number
        fontWeight?: string
        rotate?: number
        margin?: number
    }
    // 分割线
    splitLine?: {
        show?: boolean
        lineStyle?: {
            color?: string
            width?: number
            type?: 'solid' | 'dashed' | 'dotted'
            opacity?: number
        }
    }
    // 分割区域
    splitArea?: {
        show?: boolean
        areaStyle?: {
            color?: string[]
            opacity?: number
        }
    }
}

// 图表系列符号配置
export interface ChartSymbolConfig {
    show?: boolean
    type?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'none'
    size?: number
    color?: string
    borderColor?: string
    borderWidth?: number
    opacity?: number
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
    // 图表轴配置
    xAxisConfig?: ChartAxisConfig
    yAxisConfig?: ChartAxisConfig
    // 折线图符号配置
    symbolConfig?: ChartSymbolConfig

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
    seriesData?: Array<{ 
        name: string; 
        data: any[];
        // 系列特定的符号配置
        symbolConfig?: ChartSymbolConfig;
    }>
    pieData?: Array<{ name: string; value: number }>
    funnelData?: Array<{ name: string; value: number }>
    singleData?: number
    legend?: ChartLegendConfig

    // 下拉选择选项
    selectOptions?: Array<{ label: string; value: string }>

    // 开关
    checked?: boolean

    // 雷达图配置
    radarConfig?: {
        shape?: 'polygon' | 'circle' // 雷达图形状
        radius?: number // 半径百分比
        indicator?: Array<{ name: string; max: number }> // 指示器
        axisLine?: {
            show?: boolean
            lineStyle?: {
                color?: string
                width?: number
            }
        }
        splitLine?: {
            show?: boolean
            lineStyle?: {
                color?: string
                width?: number
            }
        }
        splitArea?: {
            show?: boolean
            areaStyle?: {
                color?: string[]
            }
        }
        axisName?: {
            color?: string
            fontSize?: number
            fontWeight?: string
        }
    }
    radarSeriesConfig?: {
        areaStyle?: {
            show?: boolean
            opacity?: number
        }
        lineStyle?: {
            width?: number
        }
        symbol?: string
        symbolSize?: number
    }

    // 饼图配置
    pieConfig?: {
        radius?: [string, string] // 内外半径 ['40%', '70%']
        center?: [string, string] // 圆心位置 ['50%', '50%']
        roseType?: false | 'radius' | 'area' // 玫瑰图类型
        borderRadius?: number // 扇区圆角
        borderWidth?: number // 扇区边框宽度
        borderColor?: string // 扇区边框颜色
        label?: {
            show?: boolean
            position?: 'outside' | 'inside' | 'center'
            color?: string
            fontSize?: number
            formatter?: string // '{b}: {d}%'
        }
        labelLine?: {
            show?: boolean
            length?: number
            length2?: number
            lineStyle?: {
                color?: string
                width?: number
            }
        }
        itemStyle?: {
            shadowBlur?: number
            shadowColor?: string
        }
    }

    // 地图属性
    mapRegion?: string // 地图区域：china, beijing, shanghai 等
    mapData?: Array<{ name: string; value: number }> // 地图数据

    // 日历热力图属性
    calendarYear?: number // 年份
    calendarData?: Array<[string, number]> // 日历数据 [['2024-01-01', 100], ...]
    calendarColors?: string[] // 热力颜色数组，从浅到深
    calendarCellSize?: number // 单元格大小
    calendarLang?: 'zh' | 'en' // 语言
    calendarMonthLabel?: {
        show?: boolean
        color?: string
        fontSize?: number
    }
    calendarDayLabel?: {
        show?: boolean
        color?: string
        fontSize?: number
        firstDay?: number // 0-周日开始，1-周一开始
    }
    calendarYearLabel?: {
        show?: boolean
        color?: string
        fontSize?: number
    }

    // 滚动排名列表属性
    rankListData?: Array<{ name: string; value: number }> // 排名数据
    rankListConfig?: {
        rowHeight?: number // 行高
        barHeight?: number // 进度条高度
        barColor?: string // 进度条颜色
        barBgColor?: string // 进度条背景色
        textColor?: string // 文字颜色
        valueColor?: string // 数值颜色
        fontSize?: number // 字体大小
        showIndex?: boolean // 显示序号
        indexColor?: string // 序号颜色
        scrollSpeed?: number // 滚动速度(ms)
        showBar?: boolean // 显示进度条
    }

    // 轮播列表属性
    carouselListData?: Array<Record<string, any>> // 列表数据
    carouselListConfig?: {
        columns?: Array<{ title: string; key: string; width?: number }> // 列配置
        rowHeight?: number // 行高
        headerHeight?: number // 表头高度
        headerBgColor?: string // 表头背景色
        headerTextColor?: string // 表头文字颜色
        rowBgColor?: string // 行背景色
        rowAltBgColor?: string // 交替行背景色
        textColor?: string // 文字颜色
        fontSize?: number // 字体大小
        scrollSpeed?: number // 滚动速度(ms)
        showHeader?: boolean // 显示表头
        pageSize?: number // 每页显示行数
    }
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
    selectedIds: string[] // 多选ID列表
    scale: number // 画布缩放比例
    snapLines: SnapLine[] // 当前显示的吸附辅助线
    canvasConfig: CanvasConfig // 画布配置
}

// 编辑器 Action 类型
export type EditorAction =
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
