import { useState, useEffect } from 'react'
import { Button, Drawer } from 'antd'
import { 
    AppstoreOutlined, 
    BarsOutlined, 
    ControlOutlined,
    CloseOutlined 
} from '@ant-design/icons'
import { useEditor } from '../../context/EditorContext'
import ComponentPanel from '../ComponentPanel'
import LayerPanel from '../LayerPanel'
import PropertyPanel from '../PropertyPanel'
import './index.less'

interface ResponsiveLayoutProps {
    children: React.ReactNode
}

// 响应式断点
const BREAKPOINTS = {
    mobile: 768,
    tablet: 1024,
    desktop: 1440
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
    const { state } = useEditor()
    const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
    const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)
    const [activeDrawerPanel, setActiveDrawerPanel] = useState<'component' | 'layer' | 'property' | null>(null)

    // 监听屏幕尺寸变化
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth
            if (width < BREAKPOINTS.mobile) {
                setScreenSize('mobile')
            } else if (width < BREAKPOINTS.tablet) {
                setScreenSize('tablet')
            } else {
                setScreenSize('desktop')
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // 移动端打开抽屉
    const handleMobileDrawerOpen = (panel: 'component' | 'layer' | 'property') => {
        setActiveDrawerPanel(panel)
        setMobileDrawerVisible(true)
    }

    // 移动端关闭抽屉
    const handleMobileDrawerClose = () => {
        setMobileDrawerVisible(false)
        setActiveDrawerPanel(null)
    }

    // 渲染抽屉内容
    const renderDrawerContent = () => {
        switch (activeDrawerPanel) {
            case 'component':
                return <ComponentPanel />
            case 'layer':
                return <LayerPanel />
            case 'property':
                return <PropertyPanel />
            default:
                return null
        }
    }

    // 桌面端布局
    if (screenSize === 'desktop') {
        return (
            <div className="responsive-layout desktop">
                {/* 左侧面板组 */}
                <div className="layout-left-panels">
                    {/* 组件面板 */}
                    {state.showComponentPanel && (
                        <div className="layout-panel left-panel component-panel">
                            <ComponentPanel />
                        </div>
                    )}

                    {/* 图层面板 */}
                    {state.showLayerPanel && (
                        <div className="layout-panel left-panel layer-panel">
                            <LayerPanel />
                        </div>
                    )}
                </div>

                {/* 中间内容区域 */}
                <div className="layout-content">
                    {children}
                </div>

                {/* 右侧属性面板 */}
                {state.showPropertyPanel && (
                    <div className="layout-panel right-panel property-panel">
                        <PropertyPanel />
                    </div>
                )}
            </div>
        )
    }

    // 平板端布局
    if (screenSize === 'tablet') {
        return (
            <div className="responsive-layout tablet">
                {/* 左侧组件面板（可折叠） */}
                {state.showComponentPanel && (
                    <div className="layout-panel left-panel collapsible">
                        <ComponentPanel />
                    </div>
                )}

                {/* 中间内容区域 */}
                <div className="layout-content">
                    {children}
                </div>

                {/* 右侧面板（合并图层和属性） */}
                {(state.showLayerPanel || state.showPropertyPanel) && (
                    <div className="layout-panel right-panel combined">
                        {state.showLayerPanel && (
                            <div className="panel-section">
                                <LayerPanel />
                            </div>
                        )}
                        {state.showPropertyPanel && (
                            <div className="panel-section">
                                <PropertyPanel />
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    // 移动端布局
    return (
        <div className="responsive-layout mobile">
            {/* 移动端浮动按钮组 */}
            <div className="mobile-fab-group">
                <Button
                    type="primary"
                    shape="circle"
                    icon={<AppstoreOutlined />}
                    onClick={() => handleMobileDrawerOpen('component')}
                    className="fab-button"
                    title="组件库"
                />
                <Button
                    type="primary"
                    shape="circle"
                    icon={<BarsOutlined />}
                    onClick={() => handleMobileDrawerOpen('layer')}
                    className="fab-button"
                    title="图层"
                />
                <Button
                    type="primary"
                    shape="circle"
                    icon={<ControlOutlined />}
                    onClick={() => handleMobileDrawerOpen('property')}
                    className="fab-button"
                    title="属性"
                />
            </div>

            {/* 全屏内容区域 */}
            <div className="layout-content fullscreen">
                {children}
            </div>

            {/* 移动端抽屉 */}
            <Drawer
                title={
                    <div className="drawer-title">
                        {activeDrawerPanel === 'component' && (
                            <>
                                <AppstoreOutlined />
                                <span>组件库</span>
                            </>
                        )}
                        {activeDrawerPanel === 'layer' && (
                            <>
                                <BarsOutlined />
                                <span>图层管理</span>
                            </>
                        )}
                        {activeDrawerPanel === 'property' && (
                            <>
                                <ControlOutlined />
                                <span>属性设置</span>
                            </>
                        )}
                    </div>
                }
                placement="bottom"
                height="70vh"
                open={mobileDrawerVisible}
                onClose={handleMobileDrawerClose}
                closeIcon={<CloseOutlined />}
                className="mobile-drawer"
                bodyStyle={{ padding: 0 }}
            >
                {renderDrawerContent()}
            </Drawer>
        </div>
    )
}