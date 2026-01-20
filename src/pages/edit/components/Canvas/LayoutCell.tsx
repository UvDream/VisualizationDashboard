import React, { useRef } from 'react'
import { useDrop } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import ReactECharts from 'echarts-for-react'
import { Button, Progress } from 'antd'
import { useEditor } from '../../context/EditorContext'
import type { ComponentItem, ComponentType } from '../../types'

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
}

export default function LayoutCell({ layoutId, cellIndex, cellLabel, className = '', cellConfig }: LayoutCellProps) {
    const { state, addComponent, selectComponent } = useEditor()
    const cellRef = useRef<HTMLDivElement>(null)

    // 获取该单元格中的子组件（只取第一个，每个单元格只放一个组件）
    const cellChild = state.components.find(
        comp => comp.parentId === layoutId && comp.cellIndex === cellIndex
    )

    const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
        accept: 'NEW_COMPONENT',
        drop: (item: { componentType: ComponentType; data?: any }, monitor) => {
            // 阻止冒泡，防止被画布捕获
            if (monitor.didDrop()) return

            // 如果单元格已有组件，不再添加
            if (cellChild) return

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
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
            canDrop: monitor.canDrop(),
        }),
    }), [layoutId, cellIndex, addComponent, cellChild])

    // 连接 drop ref
    dropRef(cellRef)

    const handleChildClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (cellChild) {
            selectComponent(cellChild.id)
        }
    }

    // 渲染单元格内的组件
    const renderCellContent = () => {
        if (!cellChild) {
            return <span className="layout-cell-label">{cellLabel}</span>
        }

        const item = cellChild

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
                    <Button type={item.props.buttonType || 'primary'}>
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
                        <LayoutCell layoutId={item.id} cellIndex={0} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '上方' : '左栏'} cellConfig={item.props.layoutConfig?.cells?.[0]} />
                        <LayoutCell layoutId={item.id} cellIndex={1} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '下方' : '右栏'} cellConfig={item.props.layoutConfig?.cells?.[1]} />
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
                        <LayoutCell layoutId={item.id} cellIndex={0} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '上方' : '左栏'} cellConfig={item.props.layoutConfig?.cells?.[0]} />
                        <LayoutCell layoutId={item.id} cellIndex={1} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '中间' : '中栏'} cellConfig={item.props.layoutConfig?.cells?.[1]} />
                        <LayoutCell layoutId={item.id} cellIndex={2} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '下方' : '右栏'} cellConfig={item.props.layoutConfig?.cells?.[2]} />
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
                        <LayoutCell layoutId={item.id} cellIndex={0} cellLabel={item.props.layoutConfig?.direction === 'horizontal' ? '侧栏' : '头部'} className="layout-header-top" cellConfig={item.props.layoutConfig?.cells?.[0]} />
                        <LayoutCell layoutId={item.id} cellIndex={1} cellLabel="内容区" className="layout-header-content" cellConfig={item.props.layoutConfig?.cells?.[1]} />
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
                        <LayoutCell layoutId={item.id} cellIndex={0} cellLabel={item.props.layoutConfig?.direction === 'vertical' ? '头部' : '侧栏'} className="layout-sidebar-left" cellConfig={item.props.layoutConfig?.cells?.[0]} />
                        <LayoutCell layoutId={item.id} cellIndex={1} cellLabel="内容区" className="layout-sidebar-content" cellConfig={item.props.layoutConfig?.cells?.[1]} />
                    </div>
                )
            default:
                return <div className="layout-cell-placeholder">{item.type}</div>
        }
    }

    const isSelected = cellChild && state.selectedId === cellChild.id

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
            className={`layout-cell ${className} ${isOver && canDrop ? 'layout-cell-hover' : ''} ${cellChild ? 'has-child' : ''} ${isSelected ? 'child-selected' : ''}`}
            style={cellStyle}
            onClick={handleChildClick}
        >
            {renderCellContent()}
        </div>
    )
}

// 图表配置生成函数
function getLineChartOption(item: ComponentItem) {
    return {
        backgroundColor: 'transparent',
        grid: { top: 20, right: 20, bottom: 30, left: 40 },
        tooltip: { trigger: 'axis' },
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
        })) || [{ data: [120, 132, 101, 134, 90, 230, 210], type: 'line', smooth: true }],
    }
}

function getBarChartOption(item: ComponentItem) {
    const isHorizontal = item.type === 'horizontalBarChart'
    return {
        backgroundColor: 'transparent',
        grid: { top: 20, right: 20, bottom: 30, left: 40 },
        tooltip: { trigger: 'axis' },
        xAxis: isHorizontal ? { type: 'value' } : {
            type: 'category',
            data: item.props.xAxisData || ['A', 'B', 'C', 'D', 'E'],
            axisLabel: { color: '#aaa', fontSize: 10 },
        },
        yAxis: isHorizontal ? {
            type: 'category',
            data: item.props.xAxisData || ['A', 'B', 'C', 'D', 'E'],
            axisLabel: { color: '#aaa', fontSize: 10 },
        } : { type: 'value', axisLabel: { color: '#aaa', fontSize: 10 }, splitLine: { lineStyle: { color: '#333' } } },
        series: item.props.seriesData?.map((s: any) => ({
            ...s,
            type: 'bar',
        })) || [{ data: [500, 300, 400, 600, 250], type: 'bar' }],
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
