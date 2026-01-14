import { useState } from 'react'
import { Input } from 'antd'
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
}

// 图表组件
const chartComponents: ComponentConfig[] = [
    { type: 'singleLineChart', name: '单折线图', icon: <LineChartOutlined />, category: 'chart' },
    { type: 'doubleLineChart', name: '双折线图', icon: <LineChartOutlined />, category: 'chart' },
    { type: 'singleBarChart', name: '单柱状图', icon: <BarChartOutlined />, category: 'chart' },
    { type: 'doubleBarChart', name: '双柱状图', icon: <BarChartOutlined />, category: 'chart' },
    { type: 'horizontalBarChart', name: '横向柱状图', icon: <BarChartOutlined style={{ transform: 'rotate(90deg)' }} />, category: 'chart' },
    { type: 'pieChart', name: '饼图', icon: <PieChartOutlined />, category: 'chart' },
    { type: 'halfPieChart', name: '半环形图', icon: <PieChartOutlined />, category: 'chart' },
    { type: 'gaugeChart', name: '仪表盘', icon: <DashboardOutlined />, category: 'chart' },
    { type: 'radarChart', name: '雷达图', icon: <RadarChartOutlined />, category: 'chart' },
    { type: 'scatterChart', name: '散点图', icon: <DotChartOutlined />, category: 'chart' },
    { type: 'mapChart', name: '地图', icon: <HeatMapOutlined />, category: 'chart' },
    { type: 'calendarChart', name: '日历热力图', icon: <CalendarOutlined />, category: 'chart' },
]

// Antd 组件
const antdComponents: ComponentConfig[] = [
    { type: 'text', name: '文本', icon: <FontSizeOutlined />, category: 'component' },
    { type: 'button', name: '按钮', icon: <BorderOutlined />, category: 'component' },
    { type: 'input', name: '输入框', icon: <EditOutlined />, category: 'component' },
    { type: 'select', name: '选择器', icon: <SelectOutlined />, category: 'component' },
    { type: 'switch', name: '开关', icon: <SwitcherFilled />, category: 'component' },
    { type: 'progress', name: '进度条', icon: <PercentageOutlined />, category: 'component' },
    { type: 'tag', name: '标签', icon: <TagOutlined />, category: 'component' },
    { type: 'badge', name: '徽标', icon: <BellOutlined />, category: 'component' },
    { type: 'avatar', name: '头像', icon: <UserOutlined />, category: 'component' },
    { type: 'card', name: '卡片', icon: <CreditCardOutlined />, category: 'component' },
    { type: 'table', name: '表格', icon: <TableOutlined />, category: 'component' },
    { type: 'scrollRankList', name: '滚动排名', icon: <OrderedListOutlined />, category: 'component' },
    { type: 'carouselList', name: '轮播列表', icon: <UnorderedListOutlined />, category: 'component' },
]

// 小组件 - 装饰边框
const widgetComponents: ComponentConfig[] = [
    { type: 'borderBox1', name: '边框1', icon: <BorderOuterOutlined />, category: 'widget' },
    { type: 'borderBox2', name: '边框2', icon: <BorderOuterOutlined />, category: 'widget' },
    { type: 'borderBox3', name: '边框3', icon: <BorderOuterOutlined />, category: 'widget' },
    { type: 'decoration1', name: '装饰1', icon: <GatewayOutlined />, category: 'widget' },
    { type: 'decoration2', name: '装饰2', icon: <StarOutlined />, category: 'widget' },
    { type: 'container', name: '容器', icon: <BorderOuterOutlined />, category: 'widget' },
]

// 图片组件
const imageComponents: ComponentConfig[] = [
    { type: 'image', name: '图片', icon: <PictureOutlined />, category: 'image' },
    { type: 'carousel', name: '轮播图', icon: <PlaySquareOutlined />, category: 'image' },
]

// 自动生成图标列表
// 过滤 Outlined 图标，排除非组件导出
const allIconKeys = Object.keys(AntdIcons).filter(key => key.endsWith('Outlined'))
const iconComponents: ComponentConfig[] = allIconKeys.map(key => {
    const IconComp = (AntdIcons as any)[key]
    return {
        type: 'icon',
        name: key.replace('Outlined', ''), // 简化名称显示
        icon: <IconComp />,
        category: 'icon',
        data: { iconType: key } // 传递真实图标类型
    }
})

// 3D组件
const threeComponents: ComponentConfig[] = [
    { type: 'threeEarth', name: '3D地球', icon: <GlobalOutlined />, category: '3d' },
    { type: 'threeParticles', name: '粒子背景', icon: <GatewayOutlined />, category: '3d' },
]

const allComponents = {
    chart: chartComponents,
    component: antdComponents,
    widget: widgetComponents,
    image: imageComponents,
    icon: iconComponents,
    '3d': threeComponents,
}

const categoryTabs = [
    { key: 'chart', label: '图表' },
    { key: 'component', label: '组件库' },
    { key: '3d', label: '3D' },
    { key: 'widget', label: '小组件' },
    { key: 'image', label: '图片' },
    { key: 'icon', label: '图标' },
]

export default function ComponentPanel() {
    const [activeCategory, setActiveCategory] = useState<ComponentCategory>('chart')
    const [searchText, setSearchText] = useState('')

    const currentComponents = allComponents[activeCategory] || []

    const filteredComponents = searchText
        ? currentComponents.filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
        )
        : currentComponents

    return (
        <div className="component-panel">
            <div className="component-panel-header">组件库</div>
            <div className="component-panel-search">
                <Input
                    placeholder="搜索组件"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                />
            </div>

            <div className="component-panel-body">
                {/* 左侧分类导航 */}
                <div className="component-panel-sidebar">
                    {categoryTabs.map((tab) => (
                        <div
                            key={tab.key}
                            className={`sidebar-tab ${activeCategory === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveCategory(tab.key as ComponentCategory)}
                            title={tab.label}
                        >
                            {/* 这里如果 categoryTabs 有 icon 就显示 icon，暂时显示首字或者简化样式 */}
                            <div className="sidebar-tab-text">{tab.label}</div>
                            {/* 如需显示 Icon，则在 categoryTabs 中添加 icon 字段并在 TYPES 中对应 */}
                        </div>
                    ))}
                </div>

                {/* 右侧组件列表 */}
                <div className="component-panel-content">
                    <div className="component-panel-list">
                        {filteredComponents.map((item, index) => (
                            <DraggableItem
                                key={`${item.type}-${index}`}
                                type={item.type}
                                name={item.name}
                                icon={item.icon}
                                data={(item as any).data} // 传递额外数据
                            />
                        ))}
                        {filteredComponents.length === 0 && (
                            <div className="component-panel-empty">暂无组件</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
