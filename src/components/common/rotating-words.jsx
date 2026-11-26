import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { usePreferences } from '@/hooks/use-preferences'
import { cn } from '@/lib/utils'

export function RotatingWords({ words, interval = 2600, className }) {
  const [index, setIndex] = useState(0)
  const { motionEnabled } = usePreferences()

  useEffect(() => {
    if (!motionEnabled || words.length < 2) return undefined
    const id = window.setInterval(() => setIndex((current) => (current + 1) % words.length), interval)
    return () => window.clearInterval(id)
  }, [interval, motionEnabled, words.length])

  return (
    <span className={cn('relative inline-flex', className)}>
      <span className="sr-only">{words.join(', ')}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[index]}
          aria-hidden="true"
          initial={{ y: '0.5em', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-0.5em', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-gradient inline-block font-medium"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
