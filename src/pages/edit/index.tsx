import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ConfigProvider, theme } from 'antd'
import { EditorProvider } from './context/EditorContext'
import Toolbar from './components/Toolbar'
import ComponentPanel from './components/ComponentPanel'
import Canvas from './components/Canvas'
import PropertyPanel from './components/PropertyPanel'
import LayerPanel from './components/LayerPanel'
import './index.less'

export default function Edit() {
    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#1890ff',
                },
            }}
        >
            <DndProvider backend={HTML5Backend}>
                <EditorProvider>
                    <div className="editor-container">
                        <Toolbar />
                        <div className="editor-main">
                            <ComponentPanel />
                            <LayerPanel />
                            <Canvas />
                            <PropertyPanel />
                        </div>
                    </div>
                </EditorProvider>
            </DndProvider>
        </ConfigProvider>
    )
}
