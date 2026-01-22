import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { EditorProvider } from './pages/edit/context/EditorContext'
import Edit from './pages/edit'
import Preview from './pages/preview'
import './App.less'



function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
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
            </Routes>
          </EditorProvider>
        </DndProvider>
      </BrowserRouter>
    </ConfigProvider>
  )
}

export default App
