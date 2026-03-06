/**
 * LinkageLines - 画布上的联动关系连线可视化
 * 
 * 使用 SVG overlay 叠加在画布上方，当选中有联动配置的组件时，
 * 显示它与其他组件之间的关系连线。
 */

import { useMemo, useState } from 'react'
import { useEditor } from '../../context/EditorContext'
import type { InteractionAction } from '../../types'
import './LinkageLines.less'

// 不同动作类型对应的连线颜色
const actionColorMap: Record<InteractionAction, string> = {
    filterData: '#3B82F6',    // 蓝色
    refreshData: '#10B981',   // 绿色
    setValue: '#F59E0B',      // 琥珀色
    toggleVisible: '#8B5CF6', // 紫色
    highlight: '#EC4899',     // 粉色
}

// 动作描述
const actionLabelMap: Record<InteractionAction, string> = {
    filterData: '过滤数据',
    refreshData: '刷新数据',
    setValue: '设置值',
    toggleVisible: '切换显隐',
    highlight: '高亮数据',
}

interface LinkageLine {
    sourceId: string
    targetId: string
    action: InteractionAction
    sourceCenter: { x: number; y: number }
    targetCenter: { x: number; y: number }
    sourceName: string
    targetName: string
}

export default function LinkageLines() {
    const { state } = useEditor()
    const [hoveredLine, setHoveredLine] = useState<string | null>(null)
    const selectedId = state.selectedId
    const selectedIds = state.selectedIds || []

    // 收集所有与选中组件相关的联动关系
    const lines = useMemo((): LinkageLine[] => {
        if (!selectedId && selectedIds.length === 0) return []

        const activeIds = selectedId ? [selectedId] : selectedIds

        const result: LinkageLine[] = []

        state.components.forEach(source => {
            if (!source.interactions?.length) return

            source.interactions.forEach(interaction => {
                if (interaction.enabled === false) return

                const target = state.components.find(c => c.id === interaction.targetId)
                if (!target) return

                // 只显示与选中组件相关的连线
                const isRelated = activeIds.includes(source.id) || activeIds.includes(target.id)
                if (!isRelated) return

                result.push({
                    sourceId: source.id,
                    targetId: target.id,
                    action: interaction.action,
                    sourceCenter: {
                        x: source.style.x + source.style.width / 2,
                        y: source.style.y + source.style.height / 2,
                    },
                    targetCenter: {
                        x: target.style.x + target.style.width / 2,
                        y: target.style.y + target.style.height / 2,
                    },
                    sourceName: source.name || source.type,
                    targetName: target.name || target.type,
                })
            })
        })

        return result
    }, [state.components, selectedId, selectedIds])

    if (lines.length === 0) return null

    // 计算 SVG 画布尺寸
    const canvasWidth = state.canvasConfig?.width || 1920
    const canvasHeight = state.canvasConfig?.height || 1080

    return (
        <svg
            className="linkage-lines-overlay"
            width={canvasWidth}
            height={canvasHeight}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 9998,
            }}
        >
            {/* 定义箭头 marker */}
            <defs>
                {Object.entries(actionColorMap).map(([action, color]) => (
                    <marker
                        key={action}
                        id={`arrow-${action}`}
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                    >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
                    </marker>
                ))}
            </defs>

            {lines.map((line) => {
                const key = `${line.sourceId}-${line.targetId}-${line.action}`
                const color = actionColorMap[line.action] || '#3B82F6'
                const isHovered = hoveredLine === key

                // 计算贝塞尔曲线控制点
                const dx = line.targetCenter.x - line.sourceCenter.x
                const dy = line.targetCenter.y - line.sourceCenter.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                const curvature = Math.min(dist * 0.3, 100) // 曲线弯曲程度

                // 垂直方向偏移，让曲线有弧度
                const midX = (line.sourceCenter.x + line.targetCenter.x) / 2
                const midY = (line.sourceCenter.y + line.targetCenter.y) / 2 - curvature

                const pathD = `M ${line.sourceCenter.x} ${line.sourceCenter.y} Q ${midX} ${midY} ${line.targetCenter.x} ${line.targetCenter.y}`

                return (
                    <g key={key}>
                        {/* 不可见的更宽路径用于鼠标事件 */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="transparent"
                            strokeWidth={16}
                            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredLine(key)}
                            onMouseLeave={() => setHoveredLine(null)}
                        />

                        {/* 连线光晕效果 */}
                        {isHovered && (
                            <path
                                d={pathD}
                                fill="none"
                                stroke={color}
                                strokeWidth={4}
                                strokeOpacity={0.2}
                                strokeLinecap="round"
                            />
                        )}

                        {/* 主连线 */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke={color}
                            strokeWidth={isHovered ? 2.5 : 1.5}
                            strokeDasharray={isHovered ? 'none' : '6 4'}
                            strokeOpacity={isHovered ? 1 : 0.7}
                            markerEnd={`url(#arrow-${line.action})`}
                            strokeLinecap="round"
                            style={{ transition: 'all 0.2s' }}
                        />

                        {/* 连线中间的图标 */}
                        <g transform={`translate(${midX}, ${midY})`}>
                            <circle
                                r={isHovered ? 12 : 10}
                                fill={`${color}22`}
                                stroke={color}
                                strokeWidth={1.5}
                                style={{ transition: 'all 0.2s' }}
                            />
                            <text
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontSize={isHovered ? 12 : 10}
                                fill={color}
                                style={{ pointerEvents: 'none' }}
                            >
                                ⚡
                            </text>
                        </g>

                        {/* Hover 时显示的标签 */}
                        {isHovered && (
                            <g transform={`translate(${midX}, ${midY - 22})`}>
                                <rect
                                    x={-60}
                                    y={-12}
                                    width={120}
                                    height={24}
                                    rx={4}
                                    fill="rgba(15, 23, 42, 0.9)"
                                    stroke={color}
                                    strokeWidth={1}
                                />
                                <text
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    fontSize={11}
                                    fill="#E2E8F0"
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {actionLabelMap[line.action]}
                                </text>
                            </g>
                        )}
                    </g>
                )
            })}
        </svg>
    )
}
