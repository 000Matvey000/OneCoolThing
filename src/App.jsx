import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { SiteLayout } from '@/components/layout/site-layout'
import HomePage from '@/pages/home-page'

// The games are only downloaded when someone opens them.
const PongPage = lazy(() => import('@/pages/pong-page'))
const EmojiFlapPage = lazy(() => import('@/pages/emoji-flap-page'))

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="pong" element={<PongPage />} />
        <Route path="emoji-flap" element={<EmojiFlapPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
