import { motion, useSpring } from 'motion/react'
import { useRef } from 'react'

import { usePreferences } from '@/hooks/use-preferences'
import { cn } from '@/lib/utils'

const TILT_DEGREES = 7
const tiltSpring = { stiffness: 220, damping: 22, mass: 0.6 }

/**
 * Glass card with a cursor-following spotlight, a glowing border highlight and a subtle 3D tilt.
 * Renders a <div> by default, or an <a> with `as="a"`.
 */
export function SpotlightCard({ as = 'div', tilt = true, className, children, onPointerMove, onPointerLeave, ...props }) {
  const ref = useRef(null)
  const rotateX = useSpring(0, tiltSpring)
  const rotateY = useSpring(0, tiltSpring)
  const { motionEnabled } = usePreferences()
  const Component = as === 'a' ? motion.a : motion.div

  const handlePointerMove = (event) => {
    const element = ref.current
    if (element) {
      const rect = element.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      element.style.setProperty('--spot-x', `${x}px`)
      element.style.setProperty('--spot-y', `${y}px`)
      if (tilt && motionEnabled && event.pointerType === 'mouse') {
        rotateY.set((x / rect.width - 0.5) * TILT_DEGREES)
        rotateX.set((0.5 - y / rect.height) * TILT_DEGREES)
      }
    }
    onPointerMove?.(event)
  }

  const handlePointerLeave = (event) => {
    rotateX.set(0)
    rotateY.set(0)
    onPointerLeave?.(event)
  }

  return (
    <Component
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className={cn('spotlight-card glass rounded-2xl border shadow-sm', className)}
      {...props}
    >
      <div className="spotlight-glow" aria-hidden="true" />
      {children}
    </Component>
  )
}
