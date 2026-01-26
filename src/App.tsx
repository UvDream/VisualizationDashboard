import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { EditorProvider } from './pages/edit/context/EditorContext'
import Edit from './pages/edit'
import Preview from './pages/preview'
import ColorPreview from './components/ColorPreview'
import './App.less'



function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1E40AF',
          colorInfo: '#3B82F6',
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorBgBase: '#0F172A',
          colorBgContainer: '#1E293B',
          colorBgElevated: '#334155',
          colorBorder: '#334155',
          colorBorderSecondary: '#475569',
          colorText: '#F8FAFC',
          colorTextSecondary: '#E2E8F0',
          colorTextTertiary: '#94A3B8',
          borderRadius: 6,
        },
      }}
    >
      <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          <EditorProvider>
            <Routes>
              <Route path="/" element={<Edit />} />
              <Route path="/edit" element={<Edit />} />
              <Route path="/preview" element={<Preview />} />
              <Route path="/colors" element={<ColorPreview />} />
            </Routes>
          </EditorProvider>
        </DndProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
