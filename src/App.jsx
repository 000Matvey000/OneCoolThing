import { Navigate, Route, Routes } from 'react-router-dom'

import ContactPage from './pages/ContactPage'
import PongPage from './pages/PongPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ContactPage />} />
      <Route path="/pong" element={<PongPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
