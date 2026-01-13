import { useState } from 'react'
import { Input, Tabs } from 'antd'
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
    GatewayOutlined,
    StarOutlined,
    PictureOutlined,
    PlaySquareOutlined,
    SmileOutlined,
    HeartOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    InfoCircleOutlined,
} from '@ant-design/icons'
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
    { type: 'lineChart', name: '折线图', icon: <LineChartOutlined />, category: 'chart' },
    { type: 'barChart', name: '柱状图', icon: <BarChartOutlined />, category: 'chart' },
    { type: 'pieChart', name: '饼图', icon: <PieChartOutlined />, category: 'chart' },
    { type: 'gaugeChart', name: '仪表盘', icon: <DashboardOutlined />, category: 'chart' },
    { type: 'radarChart', name: '雷达图', icon: <RadarChartOutlined />, category: 'chart' },
    { type: 'scatterChart', name: '散点图', icon: <DotChartOutlined />, category: 'chart' },
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

// 图标组件
const iconComponents: ComponentConfig[] = [
    { type: 'icon', name: '笑脸', icon: <SmileOutlined />, category: 'icon' },
    { type: 'icon', name: '爱心', icon: <HeartOutlined />, category: 'icon' },
    { type: 'icon', name: '成功', icon: <CheckCircleOutlined />, category: 'icon' },
    { type: 'icon', name: '警告', icon: <WarningOutlined />, category: 'icon' },
    { type: 'icon', name: '信息', icon: <InfoCircleOutlined />, category: 'icon' },
    { type: 'icon', name: '用户', icon: <UserOutlined />, category: 'icon' },
]

const allComponents = {
    chart: chartComponents,
    component: antdComponents,
    widget: widgetComponents,
    image: imageComponents,
    icon: iconComponents,
}

const categoryTabs = [
    { key: 'chart', label: '图表' },
    { key: 'component', label: '组件库' },
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
            <Tabs
                activeKey={activeCategory}
                onChange={(key) => setActiveCategory(key as ComponentCategory)}
                items={categoryTabs}
                size="small"
                className="component-panel-tabs"
            />
            <div className="component-panel-list">
                {filteredComponents.map((item, index) => (
                    <DraggableItem
                        key={`${item.type}-${index}`}
                        type={item.type}
                        name={item.name}
                        icon={item.icon}
                    />
                ))}
                {filteredComponents.length === 0 && (
                    <div className="component-panel-empty">暂无组件</div>
                )}
            </div>
        </div>
    )
}
