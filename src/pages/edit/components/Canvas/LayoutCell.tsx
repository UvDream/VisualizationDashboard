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
}

export default function LayoutCell({ layoutId, cellIndex, cellLabel, className = '' }: LayoutCellProps) {
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
            case 'text':
                return (
                    <span style={{
                        color: item.style.color || '#fff',
                        fontSize: item.style.fontSize || 16
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
            default:
                return <div className="layout-cell-placeholder">{item.type}</div>
        }
    }

    const isSelected = cellChild && state.selectedId === cellChild.id

    return (
        <div
            ref={cellRef}
            className={`layout-cell ${className} ${isOver && canDrop ? 'layout-cell-hover' : ''} ${cellChild ? 'has-child' : ''} ${isSelected ? 'child-selected' : ''}`}
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
