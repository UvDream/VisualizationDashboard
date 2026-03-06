import { useEffect, useState, useRef, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { getMapRegionByName, getMapJsonPath } from '../../utils/mapData'

interface MapChartProps {
    mapRegion: string
    mapData?: Array<{ name: string; value: number }>
    chartTitle?: string
    // 轮播高亮配置
    autoHighlight?: boolean
    highlightInterval?: number
    highlightColor?: string
    highlightBorderColor?: string
    highlightBorderWidth?: number
    highlightShowTooltip?: boolean
    highlightPauseOnHover?: boolean
    highlightLabelColor?: string
    highlightLabelFontSize?: number
    highlightShadowBlur?: number
    highlightShadowColor?: string
    // 轮播高亮联动回调
    onHighlightChange?: (data: { name: string; value: any; dataIndex: number; mapRegion: string }) => void
}

export default function MapChart({
    mapRegion = 'china',
    mapData,
    chartTitle,
    autoHighlight = false,
    highlightInterval = 2000,
    highlightColor = '#FFD700',
    highlightBorderColor = '#FFA500',
    highlightBorderWidth = 2,
    highlightShowTooltip = true,
    highlightPauseOnHover = true,
    highlightLabelColor = '#fff',
    highlightLabelFontSize = 14,
    highlightShadowBlur = 10,
    highlightShadowColor = 'rgba(255, 215, 0, 0.6)',
    onHighlightChange,
}: MapChartProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [mapReady, setMapReady] = useState(false)
    const loadedMapsRef = useRef<Set<string>>(new Set())
    const chartRef = useRef<ReactECharts>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const currentIndexRef = useRef(-1)
    const isPausedRef = useRef(false)
    const dataLengthRef = useRef(0)
    const regionNamesRef = useRef<string[]>([])
    const onHighlightChangeRef = useRef(onHighlightChange)
    onHighlightChangeRef.current = onHighlightChange

    useEffect(() => {
        let cancelled = false

        const loadMap = async () => {
            setLoading(true)
            setError(null)
            setMapReady(false)

            const regionConfig = getMapRegionByName(mapRegion)
            if (!regionConfig) {
                setError('未找到地图区域配置')
                setLoading(false)
                return
            }

            if (loadedMapsRef.current.has(mapRegion)) {
                setMapReady(true)
                setLoading(false)
                return
            }

            try {
                const url = getMapJsonPath(mapRegion)
                const response = await fetch(url)

                if (!response.ok) {
                    throw new Error(`加载失败: ${response.status}`)
                }

                const geoJson = await response.json()

                if (cancelled) return

                echarts.registerMap(mapRegion, geoJson)
                loadedMapsRef.current.add(mapRegion)

                // 记录地图区域数量和名称列表（用于轮播联动）
                dataLengthRef.current = geoJson.features?.length || 0
                regionNamesRef.current = (geoJson.features || []).map((f: any) => f.properties?.name || '')

                setMapReady(true)
                setLoading(false)
            } catch (err) {
                if (cancelled) return
                console.error('地图加载失败:', err)
                setError('地图数据加载失败')
                setLoading(false)
            }
        }

        loadMap()

        return () => {
            cancelled = true
        }
    }, [mapRegion])

    // 轮播高亮逻辑
    const doHighlight = useCallback(() => {
        const chart = chartRef.current?.getEchartsInstance()
        if (!chart) return

        const totalRegions = dataLengthRef.current || (mapData?.length || 0)
        if (totalRegions === 0) return

        // 取消上一次高亮
        if (currentIndexRef.current >= 0) {
            chart.dispatchAction({
                type: 'downplay',
                seriesIndex: 0,
                dataIndex: currentIndexRef.current,
            })
            if (highlightShowTooltip) {
                chart.dispatchAction({
                    type: 'hideTip',
                })
            }
        }

        // 移到下一个
        currentIndexRef.current = (currentIndexRef.current + 1) % totalRegions

        // 高亮当前
        chart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: currentIndexRef.current,
        })

        if (highlightShowTooltip) {
            chart.dispatchAction({
                type: 'showTip',
                seriesIndex: 0,
                dataIndex: currentIndexRef.current,
            })
        }

        // 触发联动回调
        if (onHighlightChangeRef.current) {
            const idx = currentIndexRef.current
            const regionName = regionNamesRef.current[idx] || ''
            const matchedData = mapData?.find(d => d.name === regionName)
            onHighlightChangeRef.current({
                name: regionName,
                value: matchedData?.value ?? null,
                dataIndex: idx,
                mapRegion,
            })
        }
    }, [mapData, highlightShowTooltip, mapRegion])

    // 启动/停止轮播
    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        if (!autoHighlight || !mapReady) {
            // 清除残留高亮
            const chart = chartRef.current?.getEchartsInstance()
            if (chart && currentIndexRef.current >= 0) {
                chart.dispatchAction({ type: 'downplay', seriesIndex: 0, dataIndex: currentIndexRef.current })
                chart.dispatchAction({ type: 'hideTip' })
            }
            currentIndexRef.current = -1
            return
        }

        const interval = Math.max(500, highlightInterval)

        timerRef.current = setInterval(() => {
            if (!isPausedRef.current) {
                doHighlight()
            }
        }, interval)

        // 初始触发一次
        setTimeout(() => doHighlight(), 300)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }
    }, [autoHighlight, highlightInterval, mapReady, doHighlight])

    // 鼠标悬停暂停处理
    const handleChartEvents = useCallback((): Record<string, Function> | undefined => {
        if (!highlightPauseOnHover || !autoHighlight) return undefined

        return {
            mouseover: () => {
                isPausedRef.current = true
            },
            mouseout: () => {
                isPausedRef.current = false
            },
        }
    }, [highlightPauseOnHover, autoHighlight])

    const getOption = () => {
        const regionConfig = getMapRegionByName(mapRegion)

        return {
            backgroundColor: 'transparent',
            title: chartTitle ? {
                text: chartTitle,
                left: 'center',
                textStyle: { color: '#fff', fontSize: 16 }
            } : undefined,
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const val = params.value
                    return `${params.name}: ${val != null && !isNaN(val) ? val : '暂无数据'}`
                }
            },
            visualMap: {
                min: 0,
                max: 100,
                left: 'left',
                top: 'bottom',
                text: ['高', '低'],
                calculable: true,
                inRange: {
                    color: ['#50a3ba', '#eac736', '#d94e5d']
                },
                textStyle: { color: '#fff' }
            },
            series: [{
                name: regionConfig?.label || '数据',
                type: 'map',
                map: mapRegion,
                roam: true,
                label: {
                    show: true,
                    color: '#fff',
                    fontSize: 10
                },
                itemStyle: {
                    areaColor: '#323c48',
                    borderColor: '#111'
                },
                emphasis: {
                    label: {
                        color: highlightLabelColor,
                        fontSize: highlightLabelFontSize,
                        fontWeight: 'bold',
                    },
                    itemStyle: {
                        areaColor: highlightColor,
                        borderColor: highlightBorderColor,
                        borderWidth: highlightBorderWidth,
                        shadowBlur: highlightShadowBlur,
                        shadowColor: highlightShadowColor,
                    }
                },
                data: mapData || []
            }]
        }
    }

    if (loading) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999'
            }}>
                加载地图中...
            </div>
        )
    }

    if (error) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff4d4f'
            }}>
                {error}
            </div>
        )
    }

    if (!mapReady) {
        return null
    }

    return (
        <ReactECharts
            ref={chartRef}
            key={mapRegion}
            option={getOption()}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'svg' }}
            onEvents={handleChartEvents()}
        />
    )
}
