import React, { useRef, Suspense, lazy } from 'react'
import { useDrop } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import ReactECharts from 'echarts-for-react'
import { Button, Progress } from 'antd'
import { useEditor } from '../../context/EditorContext'
import type { ComponentItem, ComponentType } from '../../types'
import { defaultConfigs } from '../../config/defaultConfigs'
import BorderBox1 from './BorderBox1'
import BorderBox2 from './BorderBox2'
import BorderBox3 from './BorderBox3'
import FullscreenButton from './FullscreenButton'
import GradientText from './GradientText'
import FlipCountdown from './FlipCountdown'
import Carousel from './Carousel'
import CanvasItem from './CanvasItem'

// 懒加载地图组件
const MapChart = lazy(() => import('./MapChart'))
const CityMapChart = lazy(() => import('./CityMapChart'))
const ScrollRankList = lazy(() => import('./ScrollRankList'))
const CarouselList = lazy(() => import('./CarouselList'))
const WordCloudChart = lazy(() => import('./WordCloudChart'))

interface LayoutCellProps {
    layoutId: string
    cellIndex: number
    cellLabel: string
    className?: string
    cellConfig?: {
        flex?: number
        width?: string
        height?: string
        backgroundColor?: string
    }
    previewMode?: boolean
}

export default function LayoutCell({ layoutId, cellIndex, cellLabel, className = '', cellConfig, previewMode = false }: LayoutCellProps) {
    const { state, addComponent, selectComponent } = useEditor()
    const cellRef = useRef<HTMLDivElement>(null)

    // 获取该单元格中的所有子组件
    const cellChildren = state.components.filter(
        comp => comp.parentId === layoutId && comp.cellIndex === cellIndex
    )

    // 判断是否为布局组件
    const isLayoutComponent = (type: ComponentType) => {
        return ['layoutTwoColumn', 'layoutThreeColumn', 'layoutHeader', 'layoutSidebar'].includes(type)
    }

    // 检查单元格中是否已有布局组件
    const hasLayoutChild = cellChildren.some(child => isLayoutComponent(child.type))

    // 只在非预览模式下使用 useDrop
    const [{ isOver, canDrop }, dropRef] = !previewMode ? (() => {
        const [result, drop] = useDrop(() => ({
            accept: 'NEW_COMPONENT',
            drop: (item: { componentType: ComponentType; data?: any }, monitor) => {
                // 阻止冒泡，防止被画布捕获
                if (monitor.didDrop()) return

                const isLayoutType = isLayoutComponent(item.componentType)

                // 如果拖入的是布局组件
                if (isLayoutType) {
                    // 如果单元格已有任何组件，不允许添加布局
                    if (cellChildren.length > 0) return

                    const newComponent: ComponentItem = {
                        id: uuidv4(),
                        type: item.componentType,
                        name: `${item.componentType}_${Date.now()}`,
                        props: { ...item.data },
                        style: {
                            x: 0,
                            y: 0,
                            width: 0,  // 由 CSS 控制，填满单元格
                            height: 0,
                        },
                        visible: true,
                        locked: false,
                        parentId: layoutId,
                        cellIndex: cellIndex,
                    }

                    addComponent(newComponent)
                } else {
                    // 如果拖入的是普通组件
                    // 如果单元格已有布局组件，不允许添加
                    if (hasLayoutChild) return

                    // 获取鼠标在单元格内的相对位置
                    const offset = monitor.getClientOffset()
                    const cellRect = cellRef.current?.getBoundingClientRect()

                    if (offset && cellRect) {
                        const x = (offset.x - cellRect.left) / state.scale
                        const y = (offset.y - cellRect.top) / state.scale

                        const config = defaultConfigs[item.componentType] || { props: {}, style: { width: 200, height: 150 } }

                        const newComponent: ComponentItem = {
                            id: uuidv4(),
                            type: item.componentType,
                            name: `${item.componentType}_${Date.now()}`,
                            props: { ...config.props, ...item.data },
                            style: {
                                x,
                                y,
                                width: config.style.width || 200,
                                height: config.style.height || 150,
                                ...config.style,
                            },
                            visible: true,
                            locked: false,
                            parentId: layoutId,
                            cellIndex: cellIndex,
                        }

                        addComponent(newComponent)
                    }
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
                canDrop: monitor.canDrop(),
            }),
        }), [layoutId, cellIndex, addComponent, cellChildren, hasLayoutChild, state.scale])
        return [result, drop]
    })() : [{ isOver: false, canDrop: false }, undefined]

    // 连接 drop ref（只在非预览模式下）
    if (!previewMode && dropRef && cellRef.current) {
        dropRef(cellRef.current)
    }

    const handleChildClick = (e: React.MouseEvent, childId?: string) => {
        e.stopPropagation()
        if (childId) {
            selectComponent(childId)
        }
    }

    // 渲染单个组件
    const renderComponent = (item: ComponentItem) => {

        // 根据组件类型渲染
        switch (item.type) {
            // 图表类
            case 'singleLineChart':
            case 'doubleLineChart':
                return (
                    <ReactECharts
                        option={getLineChartOption(item)}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )
            case 'singleBarChart':
            case 'doubleBarChart':
            case 'horizontalBarChart':
                return (
                    <ReactECharts
                        option={getBarChartOption(item)}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )
            case 'pieChart':
            case 'halfPieChart':
                return (
                    <ReactECharts
                        option={getPieChartOption(item)}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )
            case 'gaugeChart':
                return (
                    <ReactECharts
                        option={getGaugeChartOption(item)}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )
            case 'radarChart':
                return (
                    <ReactECharts
                        option={getRadarChartOption(item)}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )
            case 'funnelChart':
                return (
                    <ReactECharts
                        option={getFunnelChartOption(item)}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )
            case 'scatterChart':
                return (
                    <ReactECharts
                        option={getScatterChartOption(item)}
                        style={{ width: '100%', height: '100%' }}
                        opts={{ renderer: 'svg' }}
                    />
                )
            case 'mapChart':
                return (
                    <Suspense fallback={<div className="layout-cell-placeholder">加载中...</div>}>
                        <MapChart
                            mapRegion={item.props.mapRegion || 'china'}
                            mapData={item.props.mapData || []}
                            chartTitle={item.props.chartTitle}
                        />
                    </Suspense>
                )
            case 'cityMapChart':
                return (
                    <Suspense fallback={<div className="layout-cell-placeholder">加载中...</div>}>
                        <CityMapChart
                            cityName={item.props.provinceName || item.props.selectedProvince || 'nanjing'}
                            mapData={item.props.mapData || []}
                            showBuiltinData={item.props.showBuiltinData}
                            colorScheme={item.props.colorScheme}
                            chartTitle={item.props.chartTitle}
                        />
                    </Suspense>
                )
            case 'wordCloudChart':
                return (
                    <Suspense fallback={<div className="layout-cell-placeholder">加载中...</div>}>
                        <WordCloudChart
                            data={item.props.wordCloudData || []}
                            width={0}
                            height={0}
                            config={item.props.wordCloudConfig}
                        />
                    </Suspense>
                )
            case 'scrollRankList':
                return (
                    <Suspense fallback={<div className="layout-cell-placeholder">加载中...</div>}>
                        <ScrollRankList
                            data={item.props.rankListData || []}
                            config={item.props.rankListConfig}
                        />
                    </Suspense>
                )
            case 'carouselList':
                return (
                    <Suspense fallback={<div className="layout-cell-placeholder">加载中...</div>}>
                        <CarouselList
                            data={item.props.carouselListData || []}
                            config={item.props.carouselListConfig}
                        />
                    </Suspense>
                )
            case 'text':
                const textShadowValue = item.props.textShadow
                    ? `${item.props.shadowOffsetX || 0}px ${item.props.shadowOffsetY || 0}px ${item.props.shadowBlur || 4}px ${item.props.shadowColor || 'rgba(0,0,0,0.5)'}`
                    : 'none'
                
                return (
                    <span style={{
                        color: item.props.color || '#ffffff',
                        fontSize: `${item.props.fontSize || 16}px`,
                        fontWeight: item.props.fontWeight || 'normal',
                        fontStyle: item.props.fontStyle || 'normal',
                        textDecoration: item.props.textDecoration || 'none',
                        textTransform: item.props.textTransform || 'none',
                        letterSpacing: `${item.props.letterSpacing || 0}px`,
                        lineHeight: item.props.lineHeight || 1.5,
                        textShadow: textShadowValue,
                        backgroundColor: item.props.backgroundColor || 'transparent',
                        borderRadius: `${item.props.borderRadius || 0}px`,
                        borderWidth: `${item.props.borderWidth || 0}px`,
                        borderStyle: item.props.borderWidth ? 'solid' : 'none',
                        borderColor: item.props.borderColor || '#000000',
                        padding: `${item.props.padding || 8}px`,
                        opacity: item.props.opacity || 1,
                        display: 'inline-block',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        boxSizing: 'border-box',
                    }}>
                        {item.props.content || '文本'}
                    </span>
                )
            case 'button':
                return (
                    <Button 
                        type={item.props.buttonType || 'primary'}
                        disabled={item.props.disabled || false}
                        loading={item.props.loading || false}
                        block={item.props.block || false}
                        danger={item.props.danger || false}
                        style={{
                            color: item.props.color || '#ffffff',
                            fontSize: `${item.props.fontSize || 14}px`,
                            fontWeight: item.props.fontWeight || 'normal',
                            backgroundColor: item.props.backgroundColor || 'transparent',
                            borderRadius: `${item.props.borderRadius || 4}px`,
                            borderWidth: `${item.props.borderWidth || 0}px`,
                            borderColor: item.props.borderColor || '#000000',
                            padding: `${item.props.padding || 8}px`,
                            width: item.props.block ? '100%' : 'auto',
                        }}
                    >
                        {item.props.content || '按钮'}
                    </Button>
                )
            case 'progress':
                return (
                    <Progress
                        percent={item.props.percent || 0}
                        style={{ width: '90%' }}
                    />
                )
            case 'image':
                return item.props.src ? (
                    <img src={item.props.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                    <div className="layout-cell-placeholder">图片</div>
                )
            case 'carousel':
                return (
                    <Carousel
                        images={item.props.carouselImages || []}
                        config={item.props.carouselConfig}
                    />
                )
            // 边框组件
            case 'borderBox1':
                return (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <BorderBox1
                            borderColor={item.props.borderColor}
                            glowColor={item.props.glowColor}
                            borderWidth={item.props.borderWidth}
                        />
                    </div>
                )
            case 'borderBox2':
                return (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <BorderBox2
                            borderColor={item.props.borderColor}
                            glowColor={item.props.glowColor}
                            borderWidth={item.props.borderWidth}
                        />
                    </div>
                )
            case 'borderBox3':
                return (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <BorderBox3
                            borderColor={item.props.borderColor}
                            glowColor={item.props.glowColor}
                            borderWidth={item.props.borderWidth}
                            animationDuration={item.props.animationDuration}
                        />
                    </div>
                )
            case 'fullscreenButton':
                return (
                    <FullscreenButton
                        buttonSize={item.props.buttonSize}
                        iconSize={item.props.iconSize}
                        buttonColor={item.props.buttonColor}
                        hoverColor={item.props.hoverColor}
                        position={item.props.position}
                        customIcon={item.props.customIcon}
                        showText={item.props.showText}
                    >
                        {item.props.showText ? (item.props.content || '点击全屏') : null}
                    </FullscreenButton>
                )
            case 'gradientText':
                return (
                    <GradientText
                        props={item.props}
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    />
                )
            case 'flipCountdown':
                return (
                    <FlipCountdown
                        countdownMode={item.props.countdownMode}
                        targetDate={item.props.targetDate}
                        countdownDuration={item.props.countdownDuration}
                        showDays={item.props.showDays}
                        showHours={item.props.showHours}
                        showMinutes={item.props.showMinutes}
                        showSeconds={item.props.showSeconds}
                        cardWidth={item.props.cardWidth}
                        cardHeight={item.props.cardHeight}
                        fontSize={item.props.fontSize}
                        cardColorType={item.props.cardColorType}
                        cardSolidColor={item.props.cardSolidColor}
                        cardGradientStart={item.props.cardGradientStart}
                        cardGradientEnd={item.props.cardGradientEnd}
                        textColor={item.props.textColor}
                        labelColor={item.props.labelColor}
                        showLabels={item.props.showLabels}
                        separator={item.props.separator}
                    />
                )
            case 'container':
                return (
                    <div 
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: item.style.backgroundColor || 'rgba(255,255,255,0.05)',
                            borderRadius: item.style.borderRadius || 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <span className="layout-cell-label">容器</span>
                    </div>
                )
            // 布局组件嵌套支持
            case 'layoutTwoColumn':
                return (
                    <div 
                        className="layout-component layout-two-column" 
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            flexDirection: item.props.layoutConfig?.direction === 'vertical' ? 'column' : 'row',
                            gap: item.props.layoutConfig?.gap ?? 8
                        }}
                    >
                        <LayoutCell previewMode={previewMode} layoutId={item.id} cellIndex={0} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '上方' : '左栏'} cellConfig={item.props.layoutConfig?.cells?.[0]} />
                        <LayoutCell previewMode={previewMode} layoutId={item.id} cellIndex={1} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '下方' : '右栏'} cellConfig={item.props.layoutConfig?.cells?.[1]} />
                    </div>
                )
            case 'layoutThreeColumn':
                return (
                    <div 
                        className="layout-component layout-three-column" 
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            flexDirection: item.props.layoutConfig?.direction === 'vertical' ? 'column' : 'row',
                            gap: item.props.layoutConfig?.gap ?? 8
                        }}
                    >
                        <LayoutCell previewMode={previewMode} layoutId={item.id} cellIndex={0} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '上方' : '左栏'} cellConfig={item.props.layoutConfig?.cells?.[0]} />
                        <LayoutCell previewMode={previewMode} layoutId={item.id} cellIndex={1} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '中间' : '中栏'} cellConfig={item.props.layoutConfig?.cells?.[1]} />
                        <LayoutCell previewMode={previewMode} layoutId={item.id} cellIndex={2} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '下方' : '右栏'} cellConfig={item.props.layoutConfig?.cells?.[2]} />
                    </div>
                )
            case 'layoutHeader':
                return (
                    <div 
                        className="layout-component layout-header" 
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            flexDirection: item.props.layoutConfig?.direction === 'horizontal' ? 'row' : 'column',
                            gap: item.props.layoutConfig?.gap ?? 8
                        }}
                    >
                        <LayoutCell previewMode={previewMode} layoutId={item.id} cellIndex={0} cellLabel={item.props.layoutConfig?.direction === 'horizontal' ? '侧栏' : '头部'} className="layout-header-top" cellConfig={item.props.layoutConfig?.cells?.[0]} />
                        <LayoutCell previewMode={previewMode} layoutId={item.id} cellIndex={1} cellLabel="内容区" className="layout-header-content" cellConfig={item.props.layoutConfig?.cells?.[1]} />
                    </div>
                )
            case 'layoutSidebar':
                return (
                    <div 
                        className="layout-component layout-sidebar" 
                        style={{ 
                            width: '100%', 
                            height: '100%',
                            flexDirection: item.props.layoutConfig?.direction === 'vertical' ? 'column' : 'row',
                            gap: item.props.layoutConfig?.gap ?? 8
                        }}
                    >
                        <LayoutCell previewMode={previewMode} layoutId={item.id} cellIndex={0} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '头部' : '侧栏'} className="layout-sidebar-left" cellConfig={item.props.layoutConfig?.cells?.[0]} />
                        <LayoutCell previewMode={previewMode} layoutId={item.id} cellIndex={1} cellLabel="内容区" className="layout-sidebar-content" cellConfig={item.props.layoutConfig?.cells?.[1]} />
                    </div>
                )
            default:
                return <div className="layout-cell-placeholder">{item.type}</div>
        }
    }

    // 渲染单元格内容
    const renderCellContent = () => {
        // 如果没有子组件，显示占位符
        if (cellChildren.length === 0) {
            return <span className="layout-cell-label">{cellLabel}</span>
        }

        // 如果有布局组件，直接渲染（填满整个单元格）
        const layoutChild = cellChildren.find(child => isLayoutComponent(child.type))
        if (layoutChild) {
            return (
                <div
                    className={`layout-cell-child ${state.selectedId === layoutChild.id ? 'selected' : ''}`}
                    onClick={(e) => handleChildClick(e, layoutChild.id)}
                    style={{
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                    }}
                >
                    {renderComponent(layoutChild)}
                </div>
            )
        }

        // 如果有普通组件，渲染为可拖拽调整大小的组件
        return (
            <>
                {cellChildren.map(child => (
                    <CanvasItem
                        key={child.id}
                        item={child}
                        previewMode={previewMode}
                        isInLayoutCell={true}
                    />
                ))}
            </>
        )
    }

    // 计算单元格样式
    const cellStyle: React.CSSProperties = {
        flex: cellConfig?.flex ?? 1,
        backgroundColor: cellConfig?.backgroundColor || undefined,
        ...(cellConfig?.width ? { flex: 'none', width: cellConfig.width } : {}),
        ...(cellConfig?.height ? { height: cellConfig.height } : {}),
    }

    return (
        <div
            ref={cellRef}
            className={`layout-cell ${className} ${isOver && canDrop ? 'layout-cell-hover' : ''} ${cellChildren.length > 0 ? 'has-child' : ''}`}
            style={{
                ...cellStyle,
                position: 'relative',
            }}
            onClick={(e) => {
                // 点击空白区域取消选择
                if (e.target === e.currentTarget) {
                    selectComponent(null)
                }
            }}
        >
            {renderCellContent()}
        </div>
    )
}

// 图表配置生成函数
function getLineChartOption(item: ComponentItem) {
    const isDouble = item.type === 'doubleLineChart'
    const defaultSeries = isDouble ? [
        { name: '访问量', data: [120, 132, 101, 134, 90, 230, 210], type: 'line', smooth: true },
        { name: '订单量', data: [220, 182, 191, 234, 290, 330, 310], type: 'line', smooth: true }
    ] : [
        { name: '访问量', data: [120, 132, 101, 134, 90, 230, 210], type: 'line', smooth: true }
    ]

    return {
        backgroundColor: 'transparent',
        grid: { top: 20, right: 20, bottom: 30, left: 40 },
        tooltip: { trigger: 'axis' },
        legend: isDouble ? { 
            data: item.props.seriesData?.map((s: any) => s.name) || ['访问量', '订单量'],
            textStyle: { color: '#aaa', fontSize: 10 },
            top: 0
        } : undefined,
        xAxis: {
            type: 'category',
            data: item.props.xAxisData || ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLabel: { color: '#aaa', fontSize: 10 },
            axisLine: { lineStyle: { color: '#444' } },
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#aaa', fontSize: 10 },
            splitLine: { lineStyle: { color: '#333' } },
        },
        series: item.props.seriesData?.map((s: any) => ({
            ...s,
            type: 'line',
            smooth: true,
        })) || defaultSeries,
    }
}

function getBarChartOption(item: ComponentItem) {
    const isHorizontal = item.type === 'horizontalBarChart'
    const isDouble = item.type === 'doubleBarChart' || item.type === 'horizontalBarChart'
    
    const defaultSeries = isDouble ? [
        { name: '销售额', data: [500, 300, 400, 600, 250], type: 'bar' },
        { name: '利润', data: [200, 150, 180, 280, 100], type: 'bar' }
    ] : [
        { name: '销售额', data: [500, 300, 400, 600, 250], type: 'bar' }
    ]

    return {
        backgroundColor: 'transparent',
        grid: { top: 20, right: 20, bottom: 30, left: 40 },
        tooltip: { trigger: 'axis' },
        legend: isDouble ? { 
            data: item.props.seriesData?.map((s: any) => s.name) || ['销售额', '利润'],
            textStyle: { color: '#aaa', fontSize: 10 },
            top: 0
        } : undefined,
        xAxis: isHorizontal ? { 
            type: 'value',
            axisLabel: { color: '#aaa', fontSize: 10 },
            splitLine: { lineStyle: { color: '#333' } }
        } : {
            type: 'category',
            data: item.props.xAxisData || ['产品A', '产品B', '产品C', '产品D', '产品E'],
            axisLabel: { color: '#aaa', fontSize: 10 },
        },
        yAxis: isHorizontal ? {
            type: 'category',
            data: item.props.xAxisData || ['产品A', '产品B', '产品C', '产品D', '产品E'],
            axisLabel: { color: '#aaa', fontSize: 10 },
        } : { 
            type: 'value', 
            axisLabel: { color: '#aaa', fontSize: 10 }, 
            splitLine: { lineStyle: { color: '#333' } } 
        },
        series: item.props.seriesData?.map((s: any) => ({
            ...s,
            type: 'bar',
        })) || defaultSeries,
    }
}

function getPieChartOption(item: ComponentItem) {
    const isHalf = item.type === 'halfPieChart'
    return {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item' },
        series: [{
            type: 'pie',
            radius: isHalf ? ['40%', '70%'] : ['0%', '70%'],
            center: isHalf ? ['50%', '70%'] : ['50%', '50%'],
            startAngle: isHalf ? 180 : 0,
            endAngle: isHalf ? 360 : 360,
            label: { color: '#fff', fontSize: 10 },
            data: item.props.pieData || [
                { value: 1048, name: 'A' },
                { value: 735, name: 'B' },
                { value: 580, name: 'C' },
                { value: 484, name: 'D' },
            ],
        }],
    }
}

function getGaugeChartOption(item: ComponentItem) {
    return {
        backgroundColor: 'transparent',
        series: [{
            type: 'gauge',
            progress: { show: true },
            detail: { formatter: '{value}%', fontSize: 14, color: '#fff' },
            axisLabel: { color: '#aaa', fontSize: 10 },
            data: [{ value: item.props.singleData ?? 70 }],
        }],
    }
}

function getRadarChartOption(item: ComponentItem) {
    return {
        backgroundColor: 'transparent',
        radar: {
            indicator: item.props.radarConfig?.indicator || [
                { name: '销售', max: 100 },
                { name: '管理', max: 100 },
                { name: '技术', max: 100 },
                { name: '客服', max: 100 },
                { name: '研发', max: 100 },
            ],
            axisName: { color: '#fff', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
            splitArea: { areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'] } },
        },
        series: [{
            type: 'radar',
            data: item.props.seriesData?.map((s: any) => ({
                name: s.name,
                value: Array.isArray(s.data[0]) ? s.data[0] : s.data,
            })) || [{ value: [80, 50, 90, 40, 60] }],
        }],
    }
}

function getFunnelChartOption(item: ComponentItem) {
    return {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'item', formatter: '{b}: {c}' },
        series: [{
            type: 'funnel',
            left: '10%',
            top: 20,
            bottom: 20,
            width: '80%',
            min: 0,
            max: 100,
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: { show: true, position: 'inside', color: '#fff', fontSize: 10 },
            itemStyle: { borderColor: '#fff', borderWidth: 1 },
            data: item.props.funnelData || [
                { value: 100, name: '展示' },
                { value: 80, name: '点击' },
                { value: 60, name: '访问' },
                { value: 40, name: '咨询' },
                { value: 20, name: '订单' },
            ],
        }],
    }
}

function getScatterChartOption(item: ComponentItem) {
    return {
        backgroundColor: 'transparent',
        grid: { top: 20, right: 20, bottom: 30, left: 40 },
        tooltip: { trigger: 'item' },
        xAxis: { type: 'value', axisLabel: { color: '#aaa', fontSize: 10 }, splitLine: { lineStyle: { color: '#333' } } },
        yAxis: { type: 'value', axisLabel: { color: '#aaa', fontSize: 10 }, splitLine: { lineStyle: { color: '#333' } } },
        series: item.props.seriesData?.map((s: any) => ({
            ...s,
            type: 'scatter',
            symbolSize: 10,
        })) || [{ 
            type: 'scatter', 
            symbolSize: 10,
            data: [[10, 20], [30, 40], [50, 60], [70, 80], [90, 100]] 
        }],
    }
}
