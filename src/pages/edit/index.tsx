import { useEditor } from './context/EditorContext'
import Toolbar from './components/Toolbar'
import Canvas from './components/Canvas'
import ResponsiveLayout from './components/ResponsiveLayout'
import HistoryDebugger from './components/HistoryDebugger'
import './index.less'

export default function Edit() {
    const { state } = useEditor()

    return (
        <div className={`editor-container ${state.zenMode ? 'zen-mode' : ''}`}>
            {!state.zenMode && <Toolbar />}
            <div className="editor-main" style={state.zenMode ? { padding: 0 } : {}}>
                {state.zenMode ? (
                    // 禅模式：只显示画布
                    <Canvas />
                ) : (
                    // 正常模式：使用响应式布局
                    <ResponsiveLayout>
                        <Canvas />
                    </ResponsiveLayout>
                )}
            </div>
            
            {/* 历史记录调试器（仅开发环境） */}
            {process.env.NODE_ENV === 'development' && <HistoryDebugger />}
        </div>
    )
}
