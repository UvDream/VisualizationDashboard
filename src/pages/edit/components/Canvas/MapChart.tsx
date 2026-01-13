import { useEffect, useState, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { getMapRegionByName, getMapGeoJsonUrls } from '../../utils/mapData'

interface MapChartProps {
    mapRegion: string
    mapData?: Array<{ name: string; value: number }>
    chartTitle?: string
}

export default function MapChart({ mapRegion = 'china', mapData, chartTitle }: MapChartProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [mapReady, setMapReady] = useState(false)
    const loadedMapsRef = useRef<Set<string>>(new Set())

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

            // 如果已经加载过，直接使用
            if (loadedMapsRef.current.has(mapRegion)) {
                setMapReady(true)
                setLoading(false)
                return
            }

            // 获取所有可能的 URL
            const urls = getMapGeoJsonUrls(regionConfig.adcode)
            let geoJson: any = null
            let lastError: Error | null = null

            // 依次尝试每个 URL
            for (const url of urls) {
                if (cancelled) return
                
                try {
                    const response = await fetch(url)
                    if (response.ok) {
                        geoJson = await response.json()
                        break
                    }
                } catch (err) {
                    lastError = err instanceof Error ? err : new Error('Unknown error')
                }
            }

            if (cancelled) return

            if (!geoJson) {
                console.error('所有地图源加载失败:', lastError)
                setError('地图数据加载失败')
                setLoading(false)
                return
            }

            try {
                // 注册地图
                echarts.registerMap(mapRegion, geoJson)
                loadedMapsRef.current.add(mapRegion)

                setMapReady(true)
                setLoading(false)
            } catch (err) {
                console.error('地图注册失败:', err)
                setError('地图注册失败')
                setLoading(false)
            }
        }

        loadMap()

        return () => {
            cancelled = true
        }
    }, [mapRegion])

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
                formatter: '{b}: {c}'
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
                    label: { color: '#fff' },
                    itemStyle: { areaColor: '#2a333d' }
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
            key={mapRegion}
            option={getOption()}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'svg' }}
        />
    )
}
