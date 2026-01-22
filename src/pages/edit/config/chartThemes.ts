// 图表主题配置

export interface ChartTheme {
    name: string
    colors: string[]
    description?: string
}

// 预设主题
export const PRESET_THEMES: Record<string, ChartTheme> = {
    bright: {
        name: '明亮',
        colors: ['#5B8FF9', '#5AD8A6', '#F6BD16', '#E86452', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3'],
        description: '明亮清新的配色方案'
    },
    dark: {
        name: '暗波',
        colors: ['#4992ff', '#7cffb2', '#fddd60', '#ff6e76', '#58d9f9', '#05c091', '#ff8a45', '#8d48e3', '#dd79ff'],
        description: '适合深色背景的配色'
    },
    macarons: {
        name: '马卡龙',
        colors: ['#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80', '#8b9dc3', '#dfe0e3', '#97b552', '#95706d', '#dc69aa'],
        description: '柔和的马卡龙色系'
    },
    blueGreen: {
        name: '蓝绿',
        colors: ['#19d4ae', '#5ab1ef', '#fa6e86', '#ffb980', '#0067a6', '#c4b4e4', '#d87a80', '#9cbbff', '#d9d0c7', '#87a997'],
        description: '蓝绿色调主题'
    },
    purple: {
        name: '深紫',
        colors: ['#9b8bba', '#e098c7', '#8fd3e8', '#71669e', '#cc70af', '#7cb4cc'],
        description: '优雅的紫色系'
    },
    vintage: {
        name: '复古',
        colors: ['#d87c7c', '#919e8b', '#d7ab82', '#6e7074', '#61a0a8', '#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b'],
        description: '复古怀旧风格'
    },
    pink: {
        name: '粉青',
        colors: ['#e01f54', '#001852', '#f5e8c8', '#b8d2c7', '#c6b38e', '#a4d8c2', '#f3d999', '#d3758f', '#dcc392', '#2e4783', '#82b6e9', '#ff6347'],
        description: '粉色与青色的搭配'
    },
    gray: {
        name: '灰粉',
        colors: ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#cbb0e3'],
        description: '灰色与粉色的组合'
    },
    cyan: {
        name: '青草',
        colors: ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'],
        description: '清新的青草色'
    },
    orange: {
        name: '橘红',
        colors: ['#c1232b', '#27727b', '#fcce10', '#e87c25', '#b5c334', '#fe8463', '#9bca63', '#fad860', '#f3a43b', '#60c0dd', '#d7504b', '#c6e579', '#f4e001', '#f0805a', '#26c0c0'],
        description: '温暖的橘红色系'
    },
    deepColor: {
        name: '深色',
        colors: ['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'],
        description: '深沉稳重的配色'
    },
    roma: {
        name: '罗马红',
        colors: ['#e01f54', '#001852', '#f5e8c8', '#b8d2c7', '#c6b38e', '#a4d8c2', '#f3d999', '#d3758f', '#dcc392', '#2e4783'],
        description: '罗马风格的红色主题'
    }
}

// 获取主题颜色
export function getThemeColors(themeType: 'preset' | 'custom', presetName?: string, customColors?: string[]): string[] {
    if (themeType === 'custom' && customColors && customColors.length > 0) {
        return customColors
    }
    
    if (themeType === 'preset' && presetName && PRESET_THEMES[presetName]) {
        return PRESET_THEMES[presetName].colors
    }
    
    // 默认返回 default 主题
    return PRESET_THEMES.default.colors
}

// 获取当前主题颜色（用于图表配置）
export function getCurrentThemeColors(canvasConfig?: { chartTheme?: { type: 'preset' | 'custom'; presetName?: string; customColors?: string[] } }): string[] {
    if (!canvasConfig?.chartTheme) {
        return PRESET_THEMES.default.colors
    }
    
    return getThemeColors(
        canvasConfig.chartTheme.type,
        canvasConfig.chartTheme.presetName,
        canvasConfig.chartTheme.customColors
    )
}
