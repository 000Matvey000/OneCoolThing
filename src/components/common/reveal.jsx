import { motion } from 'motion/react'

export const easeOutExpo = [0.22, 1, 0.36, 1]

/**
 * Fades + slides its children in the first time they scroll into view.
 * (No blur filter here on purpose: a filtered ancestor would stop the glass
 * cards inside from blurring the animated background.)
 */
export function Reveal({ delay = 0, y = 28, className, children, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: easeOutExpo }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}
