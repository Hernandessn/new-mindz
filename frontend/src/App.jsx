import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Upload } from './pages/Upload'
import { Network } from './pages/Network'
import { Session } from './pages/Session'

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<div>Dashboard</div>} />
        <Route path='/register' element={<Register />} />
        <Route path='/upload' element={<Upload />} />
        <Route path='/network/:contentId' element={<Network />} />
        <Route path='/session/:contentId' element={<Session />} />
      </Routes>
    </Router>
  )
}

export default App
