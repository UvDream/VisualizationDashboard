import { useState, useEffect } from 'react'
import { Input, Tooltip, Badge } from 'antd'
import {
    SearchOutlined,
    LineChartOutlined,
    BarChartOutlined,
    PieChartOutlined,
    DashboardOutlined,
    RadarChartOutlined,
    DotChartOutlined,
    FontSizeOutlined,
    BorderOutlined,
    EditOutlined,
    SelectOutlined,
    SwitcherFilled,
    PercentageOutlined,
    TagOutlined,
    BellOutlined,
    UserOutlined,
    CreditCardOutlined,
    TableOutlined,
    BorderOuterOutlined,
    StarOutlined,
    PictureOutlined,
    PlaySquareOutlined,
    GlobalOutlined,
    GatewayOutlined,
    HeatMapOutlined,
    CalendarOutlined,
    OrderedListOutlined,
    UnorderedListOutlined,
    FunnelPlotOutlined,
    CloudOutlined,
    LayoutOutlined,
    AppstoreOutlined,
    ClockCircleOutlined,
    FullscreenOutlined,
    SmileOutlined,
    StarFilled,
    HistoryOutlined,
    FireOutlined,
} from '@ant-design/icons'
import * as AntdIcons from '@ant-design/icons'
import DraggableItem from './DraggableItem'
import type { ComponentType, ComponentCategory } from '../../types'
import './index.less'

interface ComponentConfig {
    type: ComponentType
    name: string
    icon: React.ReactNode
    category: ComponentCategory
    data?: any
    keywords?: string[] // 搜索关键词
}

// 图表组件
const chartComponents: ComponentConfig[] = [
    { type: 'singleLineChart', name: '单折线图', icon: <LineChartOutlined />, category: 'chart', keywords: ['折线', '趋势', 'line'] },
    { type: 'doubleLineChart', name: '双折线图', icon: <LineChartOutlined />, category: 'chart', keywords: ['折线', '对比', 'line'] },
    { type: 'singleBarChart', name: '单柱状图', icon: <BarChartOutlined />, category: 'chart', keywords: ['柱状', '条形', 'bar'] },
    { type: 'doubleBarChart', name: '双柱状图', icon: <BarChartOutlined />, category: 'chart', keywords: ['柱状', '对比', 'bar'] },
    { type: 'horizontalBarChart', name: '横向柱状图', icon: <BarChartOutlined style={{ transform: 'rotate(90deg)' }} />, category: 'chart', keywords: ['横向', '条形', 'horizontal'] },
    { type: 'pieChart', name: '饼图', icon: <PieChartOutlined />, category: 'chart', keywords: ['饼图', '占比', 'pie'] },
    { type: 'halfPieChart', name: '半环形图', icon: <PieChartOutlined />, category: 'chart', keywords: ['环形', '半圆', 'donut'] },
    { type: 'funnelChart', name: '漏斗图', icon: <FunnelPlotOutlined />, category: 'chart', keywords: ['漏斗', '转化', 'funnel'] },
    { type: 'wordCloudChart', name: '词云图', icon: <CloudOutlined />, category: 'chart', keywords: ['词云', '标签', 'cloud'] },
    { type: 'gaugeChart', name: '仪表盘', icon: <DashboardOutlined />, category: 'chart', keywords: ['仪表', '指标', 'gauge'] },
    { type: 'radarChart', name: '雷达图', icon: <RadarChartOutlined />, category: 'chart', keywords: ['雷达', '多维', 'radar'] },
    { type: 'scatterChart', name: '散点图', icon: <DotChartOutlined />, category: 'chart', keywords: ['散点', '分布', 'scatter'] },
    { type: 'mapChart', name: '地图', icon: <HeatMapOutlined />, category: 'chart', keywords: ['地图', '区域', 'map'] },
    { type: 'cityMapChart', name: '城市地图', icon: <GlobalOutlined />, category: 'chart', keywords: ['城市', '地理', 'city'] },
    { type: 'calendarChart', name: '日历热力图', icon: <CalendarOutlined />, category: 'chart', keywords: ['日历', '热力', 'calendar'] },
    { type: 'treeChart', name: '树形分布图', icon: <AppstoreOutlined />, category: 'chart', keywords: ['树形', '层级', 'tree'] },
    { type: 'sankeyChart', name: '桑基图', icon: <GatewayOutlined />, category: 'chart', keywords: ['桑基', '流向', 'sankey'] },
]

// Antd 组件
const antdComponents: ComponentConfig[] = [
    { type: 'text', name: '文本', icon: <FontSizeOutlined />, category: 'component', keywords: ['文本', '文字', 'text'] },
    { type: 'gradientText', name: '渐变文字', icon: <FontSizeOutlined />, category: 'component', keywords: ['渐变', '文字', 'gradient'] },
    { type: 'flipCountdown', name: '翻牌倒计时', icon: <ClockCircleOutlined />, category: 'component', keywords: ['倒计时', '翻牌', 'countdown'] },
    { type: 'button', name: '按钮', icon: <BorderOutlined />, category: 'component', keywords: ['按钮', '点击', 'button'] },
    { type: 'input', name: '输入框', icon: <EditOutlined />, category: 'component', keywords: ['输入', '表单', 'input'] },
    { type: 'select', name: '选择器', icon: <SelectOutlined />, category: 'component', keywords: ['选择', '下拉', 'select'] },
    { type: 'switch', name: '开关', icon: <SwitcherFilled />, category: 'component', keywords: ['开关', '切换', 'switch'] },
    { type: 'progress', name: '进度条', icon: <PercentageOutlined />, category: 'component', keywords: ['进度', '百分比', 'progress'] },
    { type: 'tag', name: '标签', icon: <TagOutlined />, category: 'component', keywords: ['标签', '标记', 'tag'] },
    { type: 'badge', name: '徽标', icon: <BellOutlined />, category: 'component', keywords: ['徽标', '提醒', 'badge'] },
    { type: 'avatar', name: '头像', icon: <UserOutlined />, category: 'component', keywords: ['头像', '用户', 'avatar'] },
    { type: 'card', name: '卡片', icon: <CreditCardOutlined />, category: 'component', keywords: ['卡片', '容器', 'card'] },
    { type: 'table', name: '表格', icon: <TableOutlined />, category: 'component', keywords: ['表格', '数据', 'table'] },
    { type: 'scrollRankList', name: '滚动排名', icon: <OrderedListOutlined />, category: 'component', keywords: ['排名', '滚动', 'rank'] },
    { type: 'carouselList', name: '轮播列表', icon: <UnorderedListOutlined />, category: 'component', keywords: ['轮播', '列表', 'carousel'] },
]

// 小组件 - 装饰边框
const widgetComponents: ComponentConfig[] = [
    { type: 'borderBox1', name: '边框1', icon: <BorderOuterOutlined />, category: 'widget', keywords: ['边框', '装饰', 'border'] },
    { type: 'borderBox2', name: '边框2', icon: <BorderOuterOutlined />, category: 'widget', keywords: ['边框', '装饰', 'border'] },
    { type: 'borderBox3', name: '边框3', icon: <BorderOuterOutlined />, category: 'widget', keywords: ['边框', '装饰', 'border'] },
    { type: 'fullscreenButton', name: '全屏按钮', icon: <FullscreenOutlined />, category: 'widget', keywords: ['全屏', '按钮', 'fullscreen'] },
    { type: 'decoration1', name: '装饰1', icon: <GatewayOutlined />, category: 'widget', keywords: ['装饰', '美化', 'decoration'] },
    { type: 'decoration2', name: '装饰2', icon: <StarOutlined />, category: 'widget', keywords: ['装饰', '美化', 'decoration'] },
    { type: 'container', name: '容器', icon: <BorderOuterOutlined />, category: 'widget', keywords: ['容器', '布局', 'container'] },
    { type: 'futuristicTitle', name: '酷炫标题', icon: <FontSizeOutlined />, category: 'widget', keywords: ['标题', '酷炫', 'title'] },
    // 布局组件
    { type: 'layoutTwoColumn', name: '两栏布局', icon: <LayoutOutlined />, category: 'widget', keywords: ['布局', '两栏', 'layout'] },
    { type: 'layoutThreeColumn', name: '三栏布局', icon: <AppstoreOutlined />, category: 'widget', keywords: ['布局', '三栏', 'layout'] },
    { type: 'layoutHeader', name: '头部布局', icon: <LayoutOutlined />, category: 'widget', keywords: ['布局', '头部', 'header'] },
    { type: 'layoutSidebar', name: '侧栏布局', icon: <LayoutOutlined />, category: 'widget', keywords: ['布局', '侧栏', 'sidebar'] },
]

// 图片组件
const imageComponents: ComponentConfig[] = [
    { type: 'image', name: '图片', icon: <PictureOutlined />, category: 'image', keywords: ['图片', '图像', 'image'] },
    { type: 'carousel', name: '轮播图', icon: <PlaySquareOutlined />, category: 'image', keywords: ['轮播', '图片', 'carousel'] },
]

// 自动生成图标列表
const allIconKeys = Object.keys(AntdIcons).filter(key => key.endsWith('Outlined'))
const iconComponents: ComponentConfig[] = allIconKeys.map(key => {
    const IconComp = (AntdIcons as any)[key]
    const name = key.replace('Outlined', '')
    return {
        type: 'icon',
        name: name,
        icon: <IconComp />,
        category: 'icon',
        data: { iconType: key },
        keywords: [name.toLowerCase(), 'icon', '图标']
    }
})

// 3D组件
const threeComponents: ComponentConfig[] = [
    { type: 'threeEarth', name: '3D地球', icon: <GlobalOutlined />, category: '3d', keywords: ['3d', '地球', 'earth'] },
    { type: 'threeParticles', name: '粒子背景', icon: <GatewayOutlined />, category: '3d', keywords: ['粒子', '背景', 'particles'] },
    { type: 'threeCube', name: '3D魔方', icon: <BorderOuterOutlined />, category: '3d', keywords: ['3d', '魔方', 'cube'] },
    { type: 'threeDNA', name: 'DNA螺旋', icon: <GatewayOutlined />, category: '3d', keywords: ['dna', '螺旋', 'helix'] },
    { type: 'threeWave', name: '3D波浪', icon: <LineChartOutlined />, category: '3d', keywords: ['3d', '波浪', 'wave'] },
    { type: 'threeTorus', name: '3D环形', icon: <PieChartOutlined />, category: '3d', keywords: ['3d', '环形', 'torus'] },
    { type: 'threeGalaxy', name: '星系', icon: <StarOutlined />, category: '3d', keywords: ['星系', '宇宙', 'galaxy'] },
    { type: 'threeTunnel', name: '时空隧道', icon: <GatewayOutlined />, category: '3d', keywords: ['隧道', '时空', 'tunnel'] },
    { type: 'threeMatrix', name: '矩阵雨', icon: <BorderOutlined />, category: '3d', keywords: ['矩阵', '雨', 'matrix'] },
    { type: 'threePlasma', name: '等离子球', icon: <DashboardOutlined />, category: '3d', keywords: ['等离子', '球', 'plasma'] },
]

const allComponents = {
    recent: [], // 最近使用
    favorite: [], // 收藏
    chart: chartComponents,
    component: antdComponents,
    widget: widgetComponents,
    image: imageComponents,
    icon: iconComponents,
    '3d': threeComponents,
}

const categoryTabs = [
    { key: 'recent', label: '最近', icon: <HistoryOutlined />, color: '#10B981' },
    { key: 'favorite', label: '收藏', icon: <StarFilled />, color: '#F59E0B' },
    { key: 'chart', label: '图表', icon: <BarChartOutlined />, color: '#3B82F6' },
    { key: 'component', label: '组件', icon: <AppstoreOutlined />, color: '#8B5CF6' },
    { key: '3d', label: '3D', icon: <GlobalOutlined />, color: '#EF4444' },
    { key: 'widget', label: '装饰', icon: <GatewayOutlined />, color: '#F97316' },
    { key: 'image', label: '图片', icon: <PictureOutlined />, color: '#06B6D4' },
    { key: 'icon', label: '图标', icon: <SmileOutlined />, color: '#84CC16' },
]

// 热门组件推荐
const popularComponents = [
    'singleLineChart', 'singleBarChart', 'pieChart', 'text', 'card', 'table'
]

export default function ComponentPanel() {
    const [activeCategory, setActiveCategory] = useState<ComponentCategory>('chart')
    const [searchText, setSearchText] = useState('')
    const [recentComponents, setRecentComponents] = useState<ComponentConfig[]>([])
    const [favoriteComponents, setFavoriteComponents] = useState<ComponentConfig[]>([])

    // 从 localStorage 加载最近使用和收藏
    useEffect(() => {
        const recent = JSON.parse(localStorage.getItem('recentComponents') || '[]')
        const favorites = JSON.parse(localStorage.getItem('favoriteComponents') || '[]')
        
        // 根据类型查找完整的组件配置
        const findComponent = (type: string) => {
            for (const category of Object.values(allComponents)) {
                const found = category.find((comp: ComponentConfig) => comp.type === type)
                if (found) return found
            }
            return null
        }

        setRecentComponents(recent.map(findComponent).filter(Boolean))
        setFavoriteComponents(favorites.map(findComponent).filter(Boolean))
    }, [])

    // 记录组件使用
    const recordComponentUsage = (component: ComponentConfig) => {
        const recent = JSON.parse(localStorage.getItem('recentComponents') || '[]')
        const newRecent = [component.type, ...recent.filter((t: string) => t !== component.type)].slice(0, 10)
        localStorage.setItem('recentComponents', JSON.stringify(newRecent))
        
        const findComponent = (type: string) => {
            for (const category of Object.values(allComponents)) {
                const found = category.find((comp: ComponentConfig) => comp.type === type)
                if (found) return found
            }
            return null
        }
        setRecentComponents(newRecent.map(findComponent).filter((comp): comp is ComponentConfig => comp !== null))
    }

    // 切换收藏状态
    const toggleFavorite = (component: ComponentConfig, e: React.MouseEvent) => {
        e.stopPropagation()
        const favorites = JSON.parse(localStorage.getItem('favoriteComponents') || '[]')
        const isFavorited = favorites.includes(component.type)
        
        let newFavorites
        if (isFavorited) {
            newFavorites = favorites.filter((t: string) => t !== component.type)
        } else {
            newFavorites = [...favorites, component.type]
        }
        
        localStorage.setItem('favoriteComponents', JSON.stringify(newFavorites))
        
        const findComponent = (type: string) => {
            for (const category of Object.values(allComponents)) {
                const found = category.find((comp: ComponentConfig) => comp.type === type)
                if (found) return found
            }
            return null
        }
        setFavoriteComponents(newFavorites.map(findComponent).filter(Boolean))
    }

    // 获取当前分类的组件
    const getCurrentComponents = () => {
        if (activeCategory === 'recent') return recentComponents
        if (activeCategory === 'favorite') return favoriteComponents
        return allComponents[activeCategory] || []
    }

    const currentComponents = getCurrentComponents()

    // 搜索过滤 - 优化为全局搜索
    const filteredComponents = searchText
        ? [] // 搜索时不使用当前分类的组件
        : currentComponents

    // 全局搜索所有组件
    const searchAllComponents = () => {
        if (!searchText) return []
        
        const allComps = [
            ...chartComponents,
            ...antdComponents,
            ...widgetComponents,
            ...imageComponents,
            ...iconComponents.slice(0, 50), // 增加图标数量
            ...threeComponents
        ]
        
        const searchLower = searchText.toLowerCase()
        return allComps.filter((item) => {
            // 扩展搜索范围
            const nameMatch = item.name.toLowerCase().includes(searchLower)
            const keywordMatch = item.keywords && item.keywords.some(keyword => 
                keyword.toLowerCase().includes(searchLower)
            )
            const typeMatch = item.type.toLowerCase().includes(searchLower)
            const categoryMatch = item.category.toLowerCase().includes(searchLower)
            
            return nameMatch || keywordMatch || typeMatch || categoryMatch
        }).map(item => ({
            ...item,
            // 添加分类信息用于显示
            categoryLabel: categoryTabs.find(tab => tab.key === item.category)?.label || item.category
        }))
    }

    const displayComponents = searchText ? searchAllComponents() : filteredComponents

    return (
        <div className="component-panel">
            <div className="component-panel-header">
                <span>组件库</span>
                {searchText && (
                    <Badge count={displayComponents.length} color="#3B82F6" />
                )}
            </div>
            
            <div className="component-panel-search">
                <Input
                    placeholder="搜索所有组件 (如：图表、按钮、地图、3D...)"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />
                {/* 搜索建议 */}
                {!searchText && (
                    <div className="search-suggestions">
                        <span className="suggestions-label">热门搜索：</span>
                        {['图表', '按钮', '地图', '3D', '文本', '表格'].map(keyword => (
                            <span 
                                key={keyword}
                                className="suggestion-tag"
                                onClick={() => setSearchText(keyword)}
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* 热门推荐 */}
            {!searchText && activeCategory === 'chart' && (
                <div className="component-panel-popular">
                    <div className="popular-title">
                        <FireOutlined style={{ color: '#F59E0B' }} />
                        <span>热门推荐</span>
                    </div>
                    <div className="popular-list">
                        {chartComponents
                            .filter(comp => popularComponents.includes(comp.type))
                            .slice(0, 3)
                            .map((item, index) => (
                                <div key={index} className="popular-item">
                                    <span className="popular-icon">{item.icon}</span>
                                    <span className="popular-name">{item.name}</span>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}

            <div className="component-panel-body">
                {/* 左侧分类导航 */}
                <div className="component-panel-sidebar">
                    {categoryTabs.map((tab) => {
                        const count = tab.key === 'recent' ? recentComponents.length : 
                                     tab.key === 'favorite' ? favoriteComponents.length : 
                                     allComponents[tab.key as keyof typeof allComponents]?.length || 0
                        
                        return (
                            <Tooltip key={tab.key} title={tab.label} placement="right">
                                <div
                                    className={`sidebar-tab ${activeCategory === tab.key ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(tab.key as ComponentCategory)}
                                    style={{ '--tab-color': tab.color } as React.CSSProperties}
                                >
                                    <div className="sidebar-tab-icon">{tab.icon}</div>
                                    <div className="sidebar-tab-text">{tab.label}</div>
                                    {count > 0 && (
                                        <div className="sidebar-tab-count">{count}</div>
                                    )}
                                </div>
                            </Tooltip>
                        )
                    })}
                </div>

                {/* 右侧组件列表 */}
                <div className="component-panel-content">
                    {searchText && (
                        <div className="search-result-header">
                            <span>搜索 "{searchText}" 的结果</span>
                            <Badge count={displayComponents.length} color="#3B82F6" />
                        </div>
                    )}
                    
                    <div className={`component-panel-list ${searchText ? 'search-mode' : `category-${activeCategory}`}`}>
                        {displayComponents.map((item, index) => {
                            const isFavorited = favoriteComponents.some(fav => fav.type === item.type)
                            
                            return (
                                <div key={`${searchText ? 'search' : activeCategory}-${item.type}-${index}`} className="component-item-wrapper">
                                    {/* 搜索模式下显示分类标签 */}
                                    {searchText && (item as any).categoryLabel && (
                                        <div className="component-category-tag">
                                            {categoryTabs.find(tab => tab.key === item.category)?.icon}
                                            <span>{(item as any).categoryLabel}</span>
                                        </div>
                                    )}
                                    
                                    <DraggableItem
                                        type={item.type}
                                        name={item.name}
                                        icon={item.icon}
                                        data={item.data}
                                        onDragStart={() => recordComponentUsage(item)}
                                    />
                                    <div 
                                        className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                                        onClick={(e) => toggleFavorite(item, e)}
                                    >
                                        <StarFilled />
                                    </div>
                                </div>
                            )
                        })}
                        
                        {displayComponents.length === 0 && (
                            <div className="component-panel-empty">
                                {searchText ? (
                                    <div>
                                        <SearchOutlined style={{ fontSize: 24, color: '#64748B', marginBottom: 8 }} />
                                        <div>未找到匹配 "{searchText}" 的组件</div>
                                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                                            尝试使用其他关键词，如：图表、按钮、文本等
                                        </div>
                                    </div>
                                ) : '暂无组件'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
