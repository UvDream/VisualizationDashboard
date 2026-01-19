import type { ComponentType, ComponentItem } from '../types'

// 默认组件配置
export const defaultConfigs: Record<ComponentType, { props: ComponentItem['props']; style: Partial<ComponentItem['style']> }> = {
    // 图表类
    singleLineChart: {
        props: {
            dataSource: { type: 'mock' },
            xAxisData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            seriesData: [
                { name: '访问量', data: [120, 132, 101, 134, 90, 230, 210] },
            ]
        },
        style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    doubleLineChart: {
        props: {
            dataSource: { type: 'mock' },
            xAxisData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            seriesData: [
                { name: '访问量', data: [120, 132, 101, 134, 90, 230, 210] },
                { name: '订单量', data: [220, 182, 191, 234, 290, 330, 310] },
            ]
        },
        style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    singleBarChart: {
        props: {
            dataSource: { type: 'mock' },
            xAxisData: ['产品A', '产品B', '产品C', '产品D', '产品E'],
            seriesData: [
                { name: '销售额', data: [500, 300, 400, 600, 250] }
            ]
        },
        style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    doubleBarChart: {
        props: {
            dataSource: { type: 'mock' },
            xAxisData: ['产品A', '产品B', '产品C', '产品D', '产品E'],
            seriesData: [
                { name: '销售额', data: [500, 300, 400, 600, 250] },
                { name: '利润', data: [200, 150, 180, 280, 100] }
            ]
        },
        style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    horizontalBarChart: {
        props: {
            dataSource: { type: 'mock' },
            xAxisData: ['产品A', '产品B', '产品C', '产品D', '产品E'],
            seriesData: [
                { name: '销售额', data: [500, 300, 400, 600, 250] },
                { name: '利润', data: [200, 150, 180, 280, 100] }
            ]
        },
        style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    pieChart: {
        props: {
            dataSource: { type: 'mock' },
            pieData: [
                { value: 1048, name: '搜索引擎' },
                { value: 735, name: '直接访问' },
                { value: 580, name: '邮件营销' },
                { value: 484, name: '联盟广告' },
                { value: 300, name: '视频广告' }
            ],
            pieConfig: {
                radius: ['0%', '70%'],
                center: ['50%', '50%'],
                roseType: false,
                borderRadius: 0,
                borderWidth: 0,
                borderColor: '#000',
                label: {
                    show: true,
                    position: 'outside',
                    color: '#fff',
                    fontSize: 12,
                    formatter: '{b}: {d}%'
                },
                labelLine: {
                    show: true,
                    length: 10,
                    length2: 10,
                    lineStyle: { color: '#fff', width: 1 }
                },
                itemStyle: {
                    shadowBlur: 0,
                    shadowColor: 'rgba(0,0,0,0.5)'
                }
            }
        },
        style: { width: 350, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    halfPieChart: {
        props: {
            dataSource: { type: 'mock' },
            pieData: [
                { value: 1048, name: '搜索引擎' },
                { value: 735, name: '直接访问' },
                { value: 580, name: '邮件营销' },
                { value: 484, name: '联盟广告' },
                { value: 300, name: '视频广告' }
            ],
            pieConfig: {
                radius: ['40%', '70%'],
                center: ['50%', '70%'],
                roseType: false,
                borderRadius: 0,
                borderWidth: 0,
                borderColor: '#000',
                label: {
                    show: true,
                    position: 'outside',
                    color: '#fff',
                    fontSize: 12,
                    formatter: '{b}: {d}%'
                },
                labelLine: {
                    show: true,
                    length: 10,
                    length2: 10,
                    lineStyle: { color: '#fff', width: 1 }
                },
                itemStyle: {
                    shadowBlur: 0,
                    shadowColor: 'rgba(0,0,0,0.5)'
                }
            }
        },
        style: { width: 350, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    funnelChart: {
        props: {
            dataSource: { type: 'mock' },
            funnelData: [
                { value: 100, name: '展示' },
                { value: 80, name: '点击' },
                { value: 60, name: '访问' },
                { value: 40, name: '咨询' },
                { value: 20, name: '订单' }
            ]
        },
        style: { width: 350, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    wordCloudChart: {
        props: {
            wordCloudData: [
                { name: '数据可视化', value: 100 },
                { name: '大数据', value: 90 },
                { name: '人工智能', value: 85 },
                { name: '云计算', value: 80 },
                { name: '物联网', value: 75 },
                { name: '区块链', value: 70 },
                { name: '机器学习', value: 65 },
                { name: '深度学习', value: 60 },
                { name: '数据分析', value: 55 },
                { name: '数据挖掘', value: 50 },
                { name: '前端开发', value: 45 },
                { name: '后端开发', value: 40 },
                { name: '全栈开发', value: 35 },
                { name: '移动开发', value: 30 },
                { name: '微服务', value: 25 }
            ],
            wordCloudConfig: {
                shape: 'circle',
                colorScheme: 'default',
                minFontSize: 12,
                maxFontSize: 48,
                fontFamily: 'Arial, sans-serif',
                fontWeight: 'bold',
                rotation: false,
                rotationRange: [-90, 90],
                gridSize: 8
            }
        },
        style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    gaugeChart: {
        props: {
            singleData: 75,
            chartTitle: '完成率'
        },
        style: { width: 300, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    radarChart: {
        props: {
            radarConfig: {
                shape: 'polygon',
                radius: 65,
                indicator: [
                    { name: '销售', max: 100 },
                    { name: '管理', max: 100 },
                    { name: '技术', max: 100 },
                    { name: '客服', max: 100 },
                    { name: '研发', max: 100 },
                    { name: '市场', max: 100 },
                ],
                axisLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.3)', width: 1 } },
                splitLine: { show: true, lineStyle: { color: 'rgba(255,255,255,0.3)', width: 1 } },
                splitArea: { show: true, areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'] } },
                axisName: { color: '#fff', fontSize: 12, fontWeight: 'normal' },
            },
            radarSeriesConfig: {
                areaStyle: { show: true, opacity: 0.3 },
                lineStyle: { width: 2 },
                symbol: 'circle',
                symbolSize: 6,
            },
            seriesData: [
                { name: '预算分配', data: [80, 50, 90, 40, 60, 70] },
                { name: '实际开销', data: [60, 70, 80, 50, 80, 60] },
            ]
        },
        style: { width: 350, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    scatterChart: {
        props: {
            dataSource: { type: 'mock' },
            seriesData: [
                {
                    name: '样本A',
                    data: [
                        [10.0, 8.04], [8.0, 6.95], [13.0, 7.58], [9.0, 8.81], [11.0, 8.33],
                        [14.0, 9.96], [6.0, 7.24], [4.0, 4.26], [12.0, 10.84], [7.0, 4.82], [5.0, 5.68]
                    ]
                }
            ]
        },
        style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    mapChart: {
        props: {
            dataSource: { type: 'mock' },
            mapRegion: 'china',
            mapData: [
                { name: '北京', value: 100 },
                { name: '上海', value: 90 },
                { name: '广东', value: 85 },
                { name: '浙江', value: 75 },
                { name: '江苏', value: 70 },
            ]
        },
        style: { width: 500, height: 400, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    calendarChart: {
        props: {
            calendarYear: 2025,
            calendarData: (() => {
                // 生成示例数据
                const data: Array<[string, number]> = []
                const start = new Date('2025-01-01')
                const end = new Date('2025-12-31')
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0]
                    data.push([dateStr, Math.floor(Math.random() * 100)])
                }
                return data
            })()
        },
        style: { width: 900, height: 220, backgroundColor: 'rgba(0,0,0,0.3)' }
    },

    // Antd 组件
    text: { props: { content: '请输入文本内容' }, style: { width: 140, height: 40, color: '#ffffff', fontSize: 16 } },
    button: { props: { content: '点击按钮', buttonType: 'primary' }, style: { width: 100, height: 40 } },
    input: { props: { content: '' }, style: { width: 200, height: 40 } },
    select: {
        props: {
            selectOptions: [
                { value: '1', label: '全部' },
                { value: '2', label: '已完成' },
                { value: '3', label: '进行中' },
            ],
            content: '1'
        },
        style: { width: 200, height: 40 }
    },
    switch: { props: { checked: true }, style: { width: 60, height: 30 } },
    progress: { props: { percent: 70 }, style: { width: 200, height: 30 } },
    tag: { props: { content: 'Project A', tagColor: 'green' }, style: { width: 80, height: 30 } },
    badge: { props: { content: '99+' }, style: { width: 60, height: 60 } },
    avatar: { props: {}, style: { width: 64, height: 64 } },
    card: { props: { content: '这是一个卡片容器，可以展示详细信息。' }, style: { width: 300, height: 200, backgroundColor: 'rgba(255,255,255,0.1)' } },
    table: {
        props: {
            dataSource: { type: 'mock' },
            tableColumns: [
                { title: '姓名', dataIndex: 'name', key: 'name' },
                { title: '部门', dataIndex: 'dept', key: 'dept' },
                { title: '销售额', dataIndex: 'sales', key: 'sales' },
            ],
            tableData: [
                { key: '1', name: '张三', dept: '销售一部', sales: 12000 },
                { key: '2', name: '李四', dept: '销售二部', sales: 15000 },
                { key: '3', name: '王五', dept: '市场部', sales: 9000 },
                { key: '4', name: '赵六', dept: '技术部', sales: 18000 },
            ]
        },
        style: { width: 450, height: 250, backgroundColor: 'rgba(255,255,255,0.05)' }
    },
    scrollRankList: {
        props: {
            dataSource: { type: 'mock' },
            rankListData: [
                { name: '北京市', value: 9850 },
                { name: '上海市', value: 8720 },
                { name: '广州市', value: 7650 },
                { name: '深圳市', value: 6890 },
                { name: '杭州市', value: 5430 },
                { name: '成都市', value: 4980 },
                { name: '武汉市', value: 4560 },
                { name: '南京市', value: 4120 },
                { name: '重庆市', value: 3890 },
                { name: '西安市', value: 3450 },
            ],
            rankListConfig: {
                rowHeight: 36,
                barHeight: 12,
                barColor: '#1890ff',
                barBgColor: 'rgba(255,255,255,0.1)',
                textColor: '#fff',
                valueColor: '#1890ff',
                fontSize: 14,
                showIndex: true,
                indexColor: '#1890ff',
                scrollSpeed: 3000,
                showBar: true,
            }
        },
        style: { width: 320, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    carouselList: {
        props: {
            dataSource: { type: 'mock' },
            carouselListData: [
                { id: '001', name: '张三', dept: '技术部', status: '在线' },
                { id: '002', name: '李四', dept: '销售部', status: '离线' },
                { id: '003', name: '王五', dept: '市场部', status: '在线' },
                { id: '004', name: '赵六', dept: '财务部', status: '在线' },
                { id: '005', name: '钱七', dept: '人事部', status: '离线' },
                { id: '006', name: '孙八', dept: '技术部', status: '在线' },
                { id: '007', name: '周九', dept: '销售部', status: '在线' },
                { id: '008', name: '吴十', dept: '市场部', status: '离线' },
            ],
            carouselListConfig: {
                columns: [
                    { title: '编号', key: 'id', width: 60 },
                    { title: '姓名', key: 'name', width: 80 },
                    { title: '部门', key: 'dept', width: 80 },
                    { title: '状态', key: 'status', width: 60 },
                ],
                rowHeight: 36,
                headerHeight: 40,
                headerBgColor: 'rgba(24, 144, 255, 0.3)',
                headerTextColor: '#1890ff',
                rowBgColor: 'rgba(255,255,255,0.02)',
                rowAltBgColor: 'rgba(255,255,255,0.05)',
                textColor: '#fff',
                fontSize: 14,
                scrollSpeed: 3000,
                showHeader: true,
                pageSize: 5,
            }
        },
        style: { width: 320, height: 260, backgroundColor: 'rgba(0,0,0,0.3)' }
    },

    // 3D 组件
    threeEarth: {
        props: {},
        style: { width: 400, height: 400, backgroundColor: 'rgba(0,0,0,0.5)' }
    },
    threeParticles: {
        props: {},
        style: { width: 500, height: 300, backgroundColor: '#000000' }
    },
    threeCube: {
        props: {},
        style: { width: 300, height: 300, backgroundColor: 'rgba(0,0,0,0.8)' }
    },
    threeDNA: {
        props: {},
        style: { width: 300, height: 400, backgroundColor: 'rgba(0,0,0,0.8)' }
    },
    threeWave: {
        props: {},
        style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.8)' }
    },
    threeTorus: {
        props: {},
        style: { width: 300, height: 300, backgroundColor: 'rgba(0,0,0,0.8)' }
    },
    threeGalaxy: {
        props: {},
        style: { width: 400, height: 400, backgroundColor: '#000000' }
    },
    threeTunnel: {
        props: {},
        style: { width: 350, height: 350, backgroundColor: '#000000' }
    },
    threeMatrix: {
        props: {},
        style: { width: 400, height: 300, backgroundColor: '#000000' }
    },
    threePlasma: {
        props: {},
        style: { width: 350, height: 350, backgroundColor: '#000000' }
    },

    // 小组件
    borderBox1: { props: {}, style: { width: 300, height: 200 } },
    borderBox2: { props: {}, style: { width: 300, height: 200 } },
    borderBox3: { props: {}, style: { width: 300, height: 200 } },
    decoration1: { props: {}, style: { width: 200, height: 60 } },
    decoration2: { props: {}, style: { width: 200, height: 60 } },
    container: { props: {}, style: { width: 300, height: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 } },
    
    // 布局组件
    layoutTwoColumn: { 
        props: { 
            layoutConfig: { 
                direction: 'horizontal', 
                gap: 8, 
                cells: [{ flex: 1 }, { flex: 1 }] 
            } 
        }, 
        style: { width: 600, height: 300, backgroundColor: 'transparent' } 
    },
    layoutThreeColumn: { 
        props: { 
            layoutConfig: { 
                direction: 'horizontal', 
                gap: 8, 
                cells: [{ flex: 1 }, { flex: 1 }, { flex: 1 }] 
            } 
        }, 
        style: { width: 900, height: 300, backgroundColor: 'transparent' } 
    },
    layoutHeader: { 
        props: { 
            layoutConfig: { 
                direction: 'vertical', 
                gap: 8, 
                cells: [{ flex: 0.3 }, { flex: 1 }] 
            } 
        }, 
        style: { width: 600, height: 400, backgroundColor: 'transparent' } 
    },
    layoutSidebar: { 
        props: { 
            layoutConfig: { 
                direction: 'horizontal', 
                gap: 8, 
                cells: [{ flex: 0.3 }, { flex: 1 }] 
            } 
        }, 
        style: { width: 600, height: 400, backgroundColor: 'transparent' } 
    },

    // 图片
    image: { props: { alt: '图片' }, style: { width: 200, height: 150, backgroundColor: '#2a2a2a' } },
    carousel: { 
        props: { 
            carouselImages: [],
            carouselConfig: {
                autoplay: true,
                interval: 3000,
                showDots: true,
                showArrows: true,
                effect: 'slide'
            }
        }, 
        style: { width: 400, height: 200, backgroundColor: '#2a2a2a' } 
    },

    // 图标
    icon: { props: { iconType: 'smile' }, style: { width: 60, height: 60, fontSize: 32, color: '#1890ff' } },
}
