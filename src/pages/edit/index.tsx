import { useEditor } from './context/EditorContext'
import Toolbar from './components/Toolbar'
import ComponentPanel from './components/ComponentPanel'
import Canvas from './components/Canvas'
import PropertyPanel from './components/PropertyPanel'
import LayerPanel from './components/LayerPanel'
import './index.less'

export default function Edit() {
    const { state } = useEditor()

    return (
        <div className="editor-container">
            {!state.zenMode && <Toolbar />}
            <div className="editor-main" style={state.zenMode ? { padding: 0 } : {}}>
                {!state.zenMode && state.showComponentPanel !== false && <ComponentPanel />}
                {!state.zenMode && state.showLayerPanel !== false && <LayerPanel />}
                <Canvas />
                {!state.zenMode && state.showPropertyPanel !== false && <PropertyPanel />}
            </div>
        </div>
    )
}
