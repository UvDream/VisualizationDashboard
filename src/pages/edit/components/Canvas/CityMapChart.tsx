import { useEffect, useState, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import { getMapRegionByName, getDistrictDataByCity, hasDistrictData } from '../../utils/mapData'

interface CityMapChartProps {
    cityName: string  // 城市名称
    mapData?: Array<{ name: string; value: number }>  // 自定义数据
    chartTitle?: string
    showBuiltinData?: boolean  // 是否显示内置数据
    colorScheme?: 'blue' | 'green' | 'red' | 'purple' | 'orange'  // 颜色主题
}

export default function CityMapChart({ 
    cityName = 'nanjing', 
    mapData, 
    chartTitle, 
    showBuiltinData = true,
    colorScheme = 'blue'
}: CityMapChartProps) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [mapReady, setMapReady] = useState(false)
    const loadedMapsRef = useRef<Set<string>>(new Set())

    // 颜色主题配置
    const colorSchemes = {
        blue: {
            colors: ['#e1f5fe', '#4fc3f7', '#29b6f6', '#0288d1', '#0277bd'],
            visualMap: ['#81d4fa', '#0288d1', '#01579b']
        },
        green: {
            colors: ['#e8f5e8', '#66bb6a', '#4caf50', '#388e3c', '#2e7d32'],
            visualMap: ['#a5d6a7', '#4caf50', '#1b5e20']
        },
        red: {
            colors: ['#ffebee', '#ef5350', '#f44336', '#d32f2f', '#c62828'],
            visualMap: ['#ffcdd2', '#f44336', '#b71c1c']
        },
        purple: {
            colors: ['#f3e5f5', '#ab47bc', '#9c27b0', '#7b1fa2', '#6a1b9a'],
            visualMap: ['#ce93d8', '#9c27b0', '#4a148c']
        },
        orange: {
            colors: ['#fff3e0', '#ffa726', '#ff9800', '#f57c00', '#ef6c00'],
            visualMap: ['#ffcc02', '#ff9800', '#e65100']
        }
    }

    useEffect(() => {
        let cancelled = false

        const loadMap = async () => {
            setLoading(true)
            setError(null)
            setMapReady(false)

            const regionConfig = getMapRegionByName(cityName)
            if (!regionConfig) {
                setError('未找到城市配置')
                setLoading(false)
                return
            }

            try {
                // 添加时间戳防止缓存
                const timestamp = new Date().getTime()
                const url = `/map/${cityName}.json?t=${timestamp}`
                const response = await fetch(url, {
                    cache: 'no-cache',
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
                
                if (!response.ok) {
                    throw new Error(`加载失败: ${response.status}`)
                }
                
                const geoJson = await response.json()

                if (cancelled) return

                // 验证数据
                console.log(`${cityName} 地图数据:`, {
                    type: geoJson.type,
                    features: geoJson.features?.length,
                    firstFeature: geoJson.features?.[0]?.properties?.name,
                    geometryType: geoJson.features?.[0]?.geometry?.type
                })

                // 强制重新注册地图（即使已经加载过）
                echarts.registerMap(cityName, geoJson)
                loadedMapsRef.current.add(cityName)

                setMapReady(true)
                setLoading(false)
            } catch (err) {
                if (cancelled) return
                console.error('城市地图加载失败:', err)
                setError('城市地图数据加载失败')
                setLoading(false)
            }
        }

        loadMap()

        return () => {
            cancelled = true
        }
    }, [cityName])

    const getDisplayData = () => {
        if (mapData && mapData.length > 0) {
            return mapData
        }
        
        if (showBuiltinData && hasDistrictData(cityName)) {
            return getDistrictDataByCity(cityName)
        }
        
        return []
    }

    const getOption = () => {
        const displayData = getDisplayData()
        const scheme = colorSchemes[colorScheme]

        // 计算数据范围
        const values = displayData.map(item => item.value)
        const minValue = values.length > 0 ? Math.min(...values) : 0
        const maxValue = values.length > 0 ? Math.max(...values) : 100

        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    return `${params.name}: ${params.value || '暂无数据'}`
                },
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                borderColor: scheme.visualMap[1],
                borderWidth: 1,
                textStyle: {
                    color: '#fff'
                }
            },
            visualMap: displayData.length > 0 ? {
                min: minValue,
                max: maxValue,
                left: 20,
                bottom: 30,
                text: ['高', '低'],
                calculable: true,
                inRange: {
                    color: scheme.visualMap
                },
                textStyle: { 
                    color: '#fff',
                    fontSize: 12
                },
                itemWidth: 15,
                itemHeight: 100
            } : undefined,
            series: [{
                name: '区县数据',
                type: 'map',
                map: cityName,
                roam: true,
                scaleLimit: {
                    min: 0.8,
                    max: 3
                },
                data: displayData,
                label: {
                    show: true,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 'normal'
                },
                itemStyle: {
                    areaColor: '#1e3a5f',
                    borderColor: '#4a90e2',
                    borderWidth: 1
                },
                emphasis: {
                    label: { 
                        show: true,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 'bold'
                    },
                    itemStyle: { 
                        areaColor: '#2d5aa0',
                        borderColor: '#66b3ff',
                        borderWidth: 2
                    }
                },
                select: {
                    label: {
                        show: true,
                        color: '#fff'
                    },
                    itemStyle: {
                        areaColor: '#2d5aa0'
                    }
                }
            }]
        }
    }

    if (loading) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4a90e2',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏙️</div>
                <div>加载城市地图中...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff6b6b',
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
                <div>{error}</div>
                <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
                    请检查 {cityName} 的地图数据文件
                </div>
            </div>
        )
    }

    if (!mapReady) {
        return null
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <ReactECharts
                key={`${cityName}-${colorScheme}`}
                option={getOption()}
                style={{ width: '100%', height: '100%' }}
                opts={{ renderer: 'svg' }}
            />
        </div>
    )
}