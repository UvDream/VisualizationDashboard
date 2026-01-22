import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ConfigProvider, theme } from 'antd'
import { EditorProvider, useEditor } from './context/EditorContext'
import Toolbar from './components/Toolbar'
import ComponentPanel from './components/ComponentPanel'
import Canvas from './components/Canvas'
import PropertyPanel from './components/PropertyPanel'
import LayerPanel from './components/LayerPanel'
import './index.less'

function EditorContent() {
    const { state } = useEditor()

    return (
        <div className="editor-container">
            {!state.zenMode && <Toolbar />}
            <div className="editor-main" style={state.zenMode ? { padding: 0 } : {}}>
                {!state.zenMode && <ComponentPanel />}
                {!state.zenMode && <LayerPanel />}
                <Canvas />
                {!state.zenMode && <PropertyPanel />}
            </div>
        </div>
    )
}

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
                    <EditorContent />
                </EditorProvider>
            </DndProvider>
        </ConfigProvider>
    )
}
