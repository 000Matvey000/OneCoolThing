import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import App from '@/App'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PreferencesProvider, usePreferences } from '@/hooks/use-preferences'

import './index.css'

/** Turns every `motion` animation off when the visitor has paused animations. */
function MotionPreference({ children }) {
  const { motionEnabled } = usePreferences()
  return <MotionConfig reducedMotion={motionEnabled ? 'never' : 'always'}>{children}</MotionConfig>
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PreferencesProvider>
      <MotionPreference>
        <TooltipProvider delayDuration={150}>
          <HashRouter>
            <App />
          </HashRouter>
        </TooltipProvider>
      </MotionPreference>
    </PreferencesProvider>
  </StrictMode>,
)
