import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Edit from './pages/edit'
import './App.less'



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Edit />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
