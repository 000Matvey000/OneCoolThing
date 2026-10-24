import { Navigate, Route, Routes } from 'react-router-dom'

import ContactPage from './pages/ContactPage'
import EmojiFlapPage from './pages/EmojiFlapPage'
import PongPage from './pages/PongPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ContactPage />} />
      <Route path="/pong" element={<PongPage />} />
      <Route path="/emoji-flap" element={<EmojiFlapPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
