import {
    FontSizeOutlined,
    BorderOutlined,
    PictureOutlined,
    BarChartOutlined,
    ContainerOutlined,
} from '@ant-design/icons'
import DraggableItem from './DraggableItem'
import { ComponentType } from '../../types'
import './index.less'

interface ComponentConfig {
    type: ComponentType
    name: string
    icon: React.ReactNode
}

const componentList: ComponentConfig[] = [
    {
        type: 'text',
        name: '文本',
        icon: <FontSizeOutlined />,
    },
    {
        type: 'button',
        name: '按钮',
        icon: <BorderOutlined />,
    },
    {
        type: 'image',
        name: '图片',
        icon: <PictureOutlined />,
    },
    {
        type: 'chart',
        name: '图表',
        icon: <BarChartOutlined />,
    },
    {
        type: 'container',
        name: '容器',
        icon: <ContainerOutlined />,
    },
]

export default function ComponentPanel() {
    return (
        <div className="component-panel">
            <div className="component-panel-header">组件库</div>
            <div className="component-panel-list">
                {componentList.map((item) => (
                    <DraggableItem
                        key={item.type}
                        type={item.type}
                        name={item.name}
                        icon={item.icon}
                    />
                ))}
            </div>
        </div>
    )
}
