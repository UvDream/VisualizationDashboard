import { useState } from 'react'
import { Form, Select, Input, InputNumber, Button, Space, Collapse, message } from 'antd'
import { PlayCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import type { DataSourceConfig } from '../../types'
import { fetchChartData, API_RESPONSE_EXAMPLES } from '../../utils/dataSource'

interface DataSourceEditorProps {
    value?: DataSourceConfig
    onChange?: (value: DataSourceConfig) => void
    onDataFetch?: (data: any) => void
    componentType?: string // 新增：当前组件类型
}

export default function DataSourceEditor({ value, onChange, onDataFetch, componentType }: DataSourceEditorProps) {
    const [loading, setLoading] = useState(false)
    const [showExamples, setShowExamples] = useState(false)

    const dataSource = value || { type: 'mock' }

    const handleChange = (field: string, val: any) => {
        const newDataSource = { ...dataSource }

        if (field.startsWith('apiConfig.')) {
            const apiField = field.replace('apiConfig.', '')
            newDataSource.apiConfig = {
                ...newDataSource.apiConfig,
                [apiField]: val
            }
        } else {
            (newDataSource as any)[field] = val
        }

        onChange?.(newDataSource)
    }

    const handleTestApi = async () => {
        if (dataSource.type !== 'api' || !dataSource.apiConfig?.url) {
            message.warning('请先配置接口地址')
            return
        }

        setLoading(true)
        try {
            const data = await fetchChartData(dataSource)
            message.success('接口测试成功')
            onDataFetch?.(data)
        } catch (error) {
            message.error('接口测试失败: ' + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    // 根据组件类型获取对应的示例
    const getExampleForComponent = () => {
        if (!componentType) return null

        if (['singleLineChart', 'doubleLineChart', 'singleBarChart', 'doubleBarChart', 'horizontalBarChart', 'scatterChart'].includes(componentType)) {
            return {
                key: 'chartData',
                label: '折线图/柱状图数据格式',
                example: API_RESPONSE_EXAMPLES.chartData
            }
        } else if (['pieChart', 'halfPieChart'].includes(componentType)) {
            return {
                key: 'pieData',
                label: '饼图数据格式',
                example: API_RESPONSE_EXAMPLES.pieData
            }
        } else if (componentType === 'mapChart') {
            return {
                key: 'mapData',
                label: '地图数据格式',
                example: API_RESPONSE_EXAMPLES.mapData
            }
        } else if (componentType === 'funnelChart') {
            return {
                key: 'funnelData',
                label: '漏斗图数据格式',
                example: {
                    code: 200,
                    data: [
                        { value: 100, name: '展示' },
                        { value: 80, name: '点击' },
                        { value: 60, name: '访问' },
                        { value: 40, name: '咨询' },
                        { value: 20, name: '订单' }
                    ],
                    message: 'success'
                }
            }
        } else if (componentType === 'wordCloudChart') {
            return {
                key: 'wordCloudData',
                label: '词云数据格式',
                example: {
                    code: 200,
                    data: [
                        { name: '数据可视化', value: 100 },
                        { name: '大数据', value: 90 },
                        { name: '人工智能', value: 85 },
                        { name: '云计算', value: 80 }
                    ],
                    message: 'success'
                }
            }
        } else if (componentType === 'scrollRankList') {
            return {
                key: 'rankListData',
                label: '排名列表数据格式',
                example: {
                    code: 200,
                    data: [
                        { name: '北京市', value: 9850 },
                        { name: '上海市', value: 8720 },
                        { name: '广州市', value: 7650 },
                        { name: '深圳市', value: 6890 }
                    ],
                    message: 'success'
                }
            }
        } else if (componentType === 'carouselList') {
            return {
                key: 'carouselListData',
                label: '轮播列表数据格式',
                example: {
                    code: 200,
                    data: [
                        { id: '001', name: '张三', dept: '技术部', status: '在线' },
                        { id: '002', name: '李四', dept: '销售部', status: '离线' },
                        { id: '003', name: '王五', dept: '市场部', status: '在线' }
                    ],
                    message: 'success'
                }
            }
        } else if (componentType === 'table') {
            return {
                key: 'tableData',
                label: '表格数据格式',
                example: {
                    code: 200,
                    data: {
                        tableColumns: [
                            { title: '姓名', dataIndex: 'name', key: 'name' },
                            { title: '部门', dataIndex: 'dept', key: 'dept' },
                            { title: '销售额', dataIndex: 'sales', key: 'sales' }
                        ],
                        tableData: [
                            { key: '1', name: '张三', dept: '销售一部', sales: 12000 },
                            { key: '2', name: '李四', dept: '销售二部', sales: 15000 },
                            { key: '3', name: '王五', dept: '市场部', sales: 9000 }
                        ]
                    },
                    message: 'success'
                }
            }
        } else if (['progress', 'gaugeChart'].includes(componentType)) {
            return {
                key: 'singleValue',
                label: '数值/百分比数据格式',
                example: API_RESPONSE_EXAMPLES.singleValue
            }
        } else if (componentType === 'calendarChart') {
            return {
                key: 'calendarData',
                label: '日历热力图数据格式',
                example: API_RESPONSE_EXAMPLES.calendarData
            }
        }

        return null
    }

    const currentExample = getExampleForComponent()

    return (
        <div>
            <Form layout="vertical" size="small">
                <Form.Item label="数据源类型">
                    <Select
                        value={dataSource.type}
                        onChange={(v) => handleChange('type', v)}
                        options={[
                            { value: 'mock', label: '模拟数据' },
                            { value: 'api', label: '接口数据' }
                        ]}
                    />
                </Form.Item>

                {dataSource.type === 'api' && (
                    <>
                        <Form.Item label="接口地址" required>
                            <Input
                                value={dataSource.apiConfig?.url || ''}
                                onChange={(e) => handleChange('apiConfig.url', e.target.value)}
                                placeholder="https://api.example.com/chart-data"
                            />
                        </Form.Item>

                        <div className="form-row">
                            <Form.Item label="请求方法">
                                <Select
                                    value={dataSource.apiConfig?.method || 'GET'}
                                    onChange={(v) => handleChange('apiConfig.method', v)}
                                    options={[
                                        { value: 'GET', label: 'GET' },
                                        { value: 'POST', label: 'POST' },
                                        { value: 'PUT', label: 'PUT' },
                                        { value: 'DELETE', label: 'DELETE' }
                                    ]}
                                />
                            </Form.Item>
                            <Form.Item label="数据路径">
                                <Input
                                    value={dataSource.apiConfig?.dataPath || 'data'}
                                    onChange={(e) => handleChange('apiConfig.dataPath', e.target.value)}
                                    placeholder="data 或 data.result"
                                />
                            </Form.Item>
                        </div>

                        <Form.Item label="自动刷新间隔（秒）">
                            <InputNumber
                                value={dataSource.apiConfig?.refreshInterval || 0}
                                onChange={(v) => handleChange('apiConfig.refreshInterval', v || 0)}
                                placeholder="0表示不自动刷新"
                                min={0}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item label="请求头（JSON格式）">
                            <Input.TextArea
                                value={dataSource.apiConfig?.headers ? JSON.stringify(dataSource.apiConfig.headers, null, 2) : ''}
                                onChange={(e) => {
                                    try {
                                        const headers = e.target.value ? JSON.parse(e.target.value) : undefined
                                        handleChange('apiConfig.headers', headers)
                                    } catch (error) {
                                        // 忽略JSON解析错误，用户输入过程中可能不完整
                                    }
                                }}
                                placeholder='{"Authorization": "Bearer token"}'
                                rows={2}
                            />
                        </Form.Item>

                        {(dataSource.apiConfig?.method === 'GET') && (
                            <Form.Item label="请求参数（JSON格式）">
                                <Input.TextArea
                                    value={dataSource.apiConfig?.params ? JSON.stringify(dataSource.apiConfig.params, null, 2) : ''}
                                    onChange={(e) => {
                                        try {
                                            const params = e.target.value ? JSON.parse(e.target.value) : undefined
                                            handleChange('apiConfig.params', params)
                                        } catch (error) {
                                            // 忽略JSON解析错误
                                        }
                                    }}
                                    placeholder='{"page": 1, "size": 10}'
                                    rows={2}
                                />
                            </Form.Item>
                        )}

                        {(dataSource.apiConfig?.method === 'POST' || dataSource.apiConfig?.method === 'PUT') && (
                            <Form.Item label="请求体（JSON格式）">
                                <Input.TextArea
                                    value={dataSource.apiConfig?.body ? JSON.stringify(dataSource.apiConfig.body, null, 2) : ''}
                                    onChange={(e) => {
                                        try {
                                            const body = e.target.value ? JSON.parse(e.target.value) : undefined
                                            handleChange('apiConfig.body', body)
                                        } catch (error) {
                                            // 忽略JSON解析错误
                                        }
                                    }}
                                    placeholder='{"chartType": "line", "dateRange": "7d"}'
                                    rows={3}
                                />
                            </Form.Item>
                        )}

                        <Form.Item>
                            <Space>
                                <Button
                                    type="primary"
                                    icon={<PlayCircleOutlined />}
                                    onClick={handleTestApi}
                                    loading={loading}
                                    size="small"
                                >
                                    测试接口
                                </Button>
                                {currentExample && (
                                    <Button
                                        icon={<QuestionCircleOutlined />}
                                        onClick={() => setShowExamples(!showExamples)}
                                        size="small"
                                    >
                                        查看示例
                                    </Button>
                                )}
                            </Space>
                        </Form.Item>

                        {showExamples && currentExample && (
                            <Form.Item>
                                <Collapse
                                    items={[{
                                        key: currentExample.key,
                                        label: currentExample.label,
                                        children: (
                                            <pre style={{
                                                fontSize: 12,
                                                background: '#1f1f1f',
                                                color: '#d4d4d4',
                                                padding: 12,
                                                borderRadius: 4,
                                                border: '1px solid #333',
                                                margin: 0,
                                                overflow: 'auto'
                                            }}>
                                                {JSON.stringify(currentExample.example, null, 2)}
                                            </pre>
                                        )
                                    }]}
                                    size="small"
                                    ghost
                                />
                            </Form.Item>
                        )}
                    </>
                )}
            </Form>
        </div>
    )
}