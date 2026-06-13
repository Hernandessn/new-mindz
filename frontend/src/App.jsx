import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Upload } from './pages/Upload'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<div>Dashboard</div>} />
        <Route path='/register' element={<Register />} />
        <Route path='/upload' element={<Upload />} />
      </Routes>
    </Router>
  )
}

export default App
