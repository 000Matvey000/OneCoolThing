import { AnimatePresence, motion } from 'motion/react'
import { Suspense, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

import { OceanBackground } from '@/components/background/OceanBackground'
import { easeOutExpo } from '@/components/common/reveal'

import { CommandMenu } from './command-menu'
import { SiteFooter } from './site-footer'
import { SiteHeader } from './site-header'

export function SiteLayout() {
  const [commandOpen, setCommandOpen] = useState(false)
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <>
      <OceanBackground />
      <SiteHeader onOpenCommand={() => setCommandOpen(true)} />
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />

      <div className="relative z-10 flex min-h-svh flex-col">
        <AnimatePresence
          mode="wait"
          initial={false}
          onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}
        >
          <motion.main
            key={location.pathname}
            className="flex-1"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
          >
            <Suspense fallback={<div className="min-h-svh" />}>{outlet}</Suspense>
          </motion.main>
        </AnimatePresence>
        <SiteFooter />
      </div>
    </>
  )
}
