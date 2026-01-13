import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Edit from './pages/edit'
import Preview from './pages/preview'
import './App.less'



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Edit />} />
        <Route path="/edit" element={<Edit />} />
        <Route path="/preview" element={<Preview />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
