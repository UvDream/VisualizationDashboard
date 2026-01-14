import { useRef, useState } from 'react'
import { useDrop } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import { useEditor } from '../../context/EditorContext'
import Ruler from '../Ruler'
import type { ComponentType, ComponentItem } from '../../types'
import CanvasItem from './CanvasItem'
import './index.less'

// 默认组件配置
const defaultConfigs: Record<ComponentType, { props: ComponentItem['props']; style: Partial<ComponentItem['style']> }> = {
    // 图表类
    singleLineChart: {
        props: {
            xAxisData: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            seriesData: [
                { name: '访问量', data: [120, 132, 101, 134, 90, 230, 210] },
            ]
        },
        style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    doubleLineChart: {
        props: {
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
            xAxisData: ['产品A', '产品B', '产品C', '产品D', '产品E'],
            seriesData: [
                { name: '销售额', data: [500, 300, 400, 600, 250] }
            ]
        },
        style: { width: 400, height: 300, backgroundColor: 'rgba(0,0,0,0.3)' }
    },
    doubleBarChart: {
        props: {
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
                for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
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

    // 小组件
    borderBox1: { props: {}, style: { width: 300, height: 200 } },
    borderBox2: { props: {}, style: { width: 300, height: 200 } },
    borderBox3: { props: {}, style: { width: 300, height: 200 } },
    decoration1: { props: {}, style: { width: 200, height: 60 } },
    decoration2: { props: {}, style: { width: 200, height: 60 } },
    container: { props: {}, style: { width: 300, height: 200, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 } },

    // 图片
    image: { props: { alt: '图片' }, style: { width: 200, height: 150, backgroundColor: '#2a2a2a' } },
    carousel: { props: {}, style: { width: 400, height: 200, backgroundColor: '#2a2a2a' } },

    // 图标
    icon: { props: { iconType: 'smile' }, style: { width: 60, height: 60, fontSize: 32, color: '#1890ff' } },
}

interface CanvasProps {
    previewMode?: boolean
}

export default function Canvas({ previewMode = false }: CanvasProps) {
    const { state, addComponent, selectComponent, deleteComponent, bringForward, sendBackward, bringToFront, sendToBack } = useEditor()
    const customCanvasRef = useRef<HTMLDivElement>(null)
    
    // 右键菜单状态
    const [menuVisible, setMenuVisible] = useState(false)
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

    // 只有在非预览模式下才使用useDrop
    const [dropRef, isOver] = !previewMode ? (() => {
        const [{ isOver }, drop] = useDrop(() => ({
            accept: 'NEW_COMPONENT',
            drop: (item: { componentType: ComponentType; data?: any }, monitor) => {
                const offset = monitor.getClientOffset()
                const canvasRect = customCanvasRef.current?.getBoundingClientRect()

                if (offset && canvasRect) {
                    // 计算缩放后的坐标 [Logic X = (Screen X - Canvas Left) / Scale]
                    const x = (offset.x - canvasRect.left) / state.scale
                    const y = (offset.y - canvasRect.top) / state.scale

                    const config = defaultConfigs[item.componentType] || { props: {}, style: { width: 100, height: 100 } }
                    const newComponent: ComponentItem = {
                        id: uuidv4(),
                        type: item.componentType,
                        name: `${item.componentType}_${Date.now()}`,
                        props: { ...config.props, ...item.data }, // 合并拖拽携带的数据
                        style: {
                            x,
                            y,
                            width: config.style.width || 100,
                            height: config.style.height || 100,
                            ...config.style,
                        },
                        visible: true,
                        locked: false,
                    }

                    addComponent(newComponent)
                }
            },
            collect: (monitor) => ({
                isOver: monitor.isOver(),
            }),
        }))
        return [drop, isOver]
    })() : [undefined, false]

    const handleCanvasClick = () => {
        if (!previewMode) {
            selectComponent(null)
            // 点击画布关闭右键菜单
            setMenuVisible(false)
        }
    }
    
    // 右键菜单事件处理
    const handleContextMenu = (e: React.MouseEvent, componentId: string) => {
        if (previewMode) return
        
        e.preventDefault()
        e.stopPropagation()
        
        // 设置菜单位置
        setMenuPosition({ x: e.clientX, y: e.clientY })
        setSelectedComponentId(componentId)
        setMenuVisible(true)
        
        // 点击外部关闭菜单
        document.addEventListener('click', handleClickOutside)
    }
    
    const handleClickOutside = () => {
        setMenuVisible(false)
        document.removeEventListener('click', handleClickOutside)
    }
    
    // 关闭菜单
    const closeMenu = () => {
        setMenuVisible(false)
        document.removeEventListener('click', handleClickOutside)
    }
    
    // 菜单项点击处理
    const handleMenuClick = (action: string) => {
        closeMenu()
        if (!selectedComponentId) return
        
        switch (action) {
            case 'bringForward':
                bringForward(selectedComponentId)
                break
            case 'sendBackward':
                sendBackward(selectedComponentId)
                break
            case 'bringToFront':
                bringToFront(selectedComponentId)
                break
            case 'sendToBack':
                sendToBack(selectedComponentId)
                break
            case 'delete':
                deleteComponent(selectedComponentId)
                break
        }
    }

    // 合并 refs
    const setRefs = (el: HTMLDivElement | null) => {
        (customCanvasRef as React.MutableRefObject<HTMLDivElement | null>).current = el
        if (dropRef && el) {
            dropRef(el)
        }
    }

    return (
        <div className="canvas-wrapper">
            {!previewMode && (
                <>
                    <div className="ruler-corner" />
                    <Ruler type="horizontal" />
                    <Ruler type="vertical" />
                </>
            )}

            <div
                ref={!previewMode ? setRefs : undefined}
                className={`canvas-area ${isOver && !previewMode ? 'drag-over' : ''}`}
                style={{
                    width: state.canvasConfig?.width || 1920,
                    height: state.canvasConfig?.height || 1080,
                    backgroundColor: state.canvasConfig?.backgroundColor || '#000000',
                    transform: `scale(${state.scale}) translate(0px, 0px)`,
                    top: !previewMode ? 40 : 0,
                    left: !previewMode ? 40 : 0,
                }}
                onClick={handleCanvasClick}
            >
                {state.components.map((item) => (
                    <CanvasItem 
                        key={item.id} 
                        item={item} 
                        onContextMenu={!previewMode ? (e) => handleContextMenu(e, item.id) : undefined} 
                        previewMode={previewMode}
                    />
                ))}

                {/* 渲染吸附辅助线 */}
                {!previewMode && state.snapLines.map((line, index) => (
                    <div
                        key={index}
                        className={`snap-line snap-line-${line.type}`}
                        style={{
                            left: line.type === 'v' ? line.position : 0,
                            top: line.type === 'h' ? line.position : 0,
                        }}
                    />
                ))}
            </div>
            
            {/* 右键菜单 */}
            {!previewMode && menuVisible && (
                <div
                    className="canvas-context-menu"
                    style={{
                        left: menuPosition.x,
                        top: menuPosition.y,
                    }}
                >
                    <div
                        className="context-menu-item"
                        onClick={() => handleMenuClick('bringForward')}
                    >
                        上移一层
                    </div>
                    <div
                        className="context-menu-item"
                        onClick={() => handleMenuClick('sendBackward')}
                    >
                        下移一层
                    </div>
                    <div
                        className="context-menu-item"
                        onClick={() => handleMenuClick('bringToFront')}
                    >
                        置顶
                    </div>
                    <div
                        className="context-menu-item"
                        onClick={() => handleMenuClick('sendToBack')}
                    >
                        置底
                    </div>
                    <div className="context-menu-divider" />
                    <div
                        className="context-menu-item context-menu-item-delete"
                        onClick={() => handleMenuClick('delete')}
                    >
                        删除
                    </div>
                </div>
            )}
        </div>
    )
}
