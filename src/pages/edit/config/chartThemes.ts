// 图表主题配置

export interface ChartTheme {
    name: string
    colors: string[]
    description?: string
}

// 预设主题 - 基于 UI-UX Pro Max 专业数据可视化配色
export const PRESET_THEMES: Record<string, ChartTheme> = {
    // 默认主题（向后兼容）
    default: {
        name: '默认',
        colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'],
        description: '默认主题，与专业蓝相同'
    },
    // 新增专业主题
    professional: {
        name: '专业蓝',
        colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'],
        description: '专业数据可视化配色，高对比度，适合商业报表'
    },
    modernDark: {
        name: '现代深色',
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'],
        description: '现代深色主题，适合暗色界面的数据展示'
    },
    analytics: {
        name: '分析仪表',
        colors: ['#0EA5E9', '#22C55E', '#F59E0B', '#EF4444', '#A855F7', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'],
        description: '专为分析仪表板设计的高可读性配色'
    },
    gradient: {
        name: '渐变蓝绿',
        colors: ['#0F766E', '#14B8A6', '#5EEAD4', '#0369A1', '#0EA5E9', '#38BDF8', '#F59E0B', '#FBBF24', '#EF4444', '#F87171'],
        description: '蓝绿渐变系列，适合趋势图和热力图'
    },
    // 优化后的经典主题
    bright: {
        name: '明亮',
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'],
        description: '明亮清新的配色方案，提升对比度'
    },
    dark: {
        name: '深色优化',
        colors: ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA', '#22D3EE', '#A3E635', '#FB923C', '#F472B6', '#818CF8'],
        description: '优化的深色主题，更适合暗色背景'
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

    // 默认返回专业蓝主题
    return PRESET_THEMES.professional.colors
}

// 获取当前主题颜色（用于图表配置）
export function getCurrentThemeColors(canvasConfig?: { chartTheme?: { type: 'preset' | 'custom'; presetName?: string; customColors?: string[] } }): string[] {
    if (!canvasConfig?.chartTheme) {
        return PRESET_THEMES.professional.colors
    }

    return getThemeColors(
        canvasConfig.chartTheme.type,
        canvasConfig.chartTheme.presetName,
        canvasConfig.chartTheme.customColors
    )
}
