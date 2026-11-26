import { ChevronDown, Gamepad2, MousePointer2, Send, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

import profilePic from '@/assets/img/profilepic.jpg'
import { easeOutExpo } from '@/components/common/reveal'
import { RotatingWords } from '@/components/common/rotating-words'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { site } from '@/data/site'
import { usePreferences } from '@/hooks/use-preferences'
import { useSectionNav } from '@/hooks/use-section-nav'
import { cn } from '@/lib/utils'

const isCoarsePointer = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

function AnimatedWords({ text, delay = 0, wordClassName }) {
  const words = text.split(' ')
  return words.map((word, index) => (
    <span key={`${word}-${index}`}>
      <motion.span
        className={cn('inline-block', wordClassName)}
        initial={{ opacity: 0, y: '0.35em', filter: 'blur(12px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, delay: delay + index * 0.09, ease: easeOutExpo }}
      >
        {word}
      </motion.span>
      {index < words.length - 1 ? ' ' : null}
    </span>
  ))
}

function fadeUp(delay) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: easeOutExpo },
  }
}

export function Hero() {
  const goTo = useSectionNav()
  const { motionEnabled } = usePreferences()

  return (
    <section className="relative mx-auto flex min-h-svh max-w-4xl flex-col items-center justify-center px-4 pt-28 pb-24 text-center">
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, delay: 0.05 }}
      >
        <div className="avatar-ring absolute -inset-6 rounded-full opacity-45 blur-2xl" aria-hidden="true" />
        <div className="avatar-ring absolute -inset-[3px] rounded-full" aria-hidden="true" />
        <img
          src={profilePic}
          alt={site.name}
          width={128}
          height={128}
          className="relative size-28 rounded-full border-4 border-background object-cover sm:size-32"
        />
        <span className="absolute right-1 bottom-1 flex size-5" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex size-5 rounded-full border-[3px] border-background bg-emerald-400" />
        </span>
      </motion.div>

      <motion.div {...fadeUp(0.1)}>
        <Badge variant="outline" className="glass mb-6 h-7 gap-1.5 px-3 text-xs">
          <Sparkles className="text-brand-1" />
          {site.tagline}
        </Badge>
      </motion.div>

      <h1 className="text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl">
        <AnimatedWords text="Hey, I'm" delay={0.15} />{' '}
        <AnimatedWords text={site.name} delay={0.35} wordClassName="text-gradient pb-2" />
      </h1>

      <motion.p className="mt-5 text-lg text-muted-foreground sm:text-xl" {...fadeUp(0.6)}>
        I like building <RotatingWords words={site.rotatingWords} />
      </motion.p>

      <motion.p className="mt-3 max-w-xl text-balance text-muted-foreground" {...fadeUp(0.7)}>
        {site.intro}
      </motion.p>

      <motion.div className="mt-10 flex flex-wrap items-center justify-center gap-3" {...fadeUp(0.85)}>
        <Button variant="glow" size="xl" onClick={() => goTo('links')}>
          <Send data-icon="inline-start" /> Say hello
        </Button>
        <Button variant="glass" size="xl" onClick={() => goTo('arcade')}>
          <Gamepad2 data-icon="inline-start" /> Play a game
        </Button>
      </motion.div>

      {motionEnabled ? (
        <motion.p
          className="mt-10 inline-flex items-center gap-2 text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 1 }}
        >
          <MousePointer2 className="size-3.5" aria-hidden="true" />
          {isCoarsePointer
            ? 'Drag through the water · tap to make a splash'
            : 'Move your cursor through the water · click to make a splash'}
        </motion.p>
      ) : null}

      <motion.button
        type="button"
        onClick={() => goTo('links')}
        aria-label="Scroll to links"
        className="absolute bottom-8 left-1/2 grid size-10 -translate-x-1/2 place-items-center rounded-full border text-muted-foreground transition-colors hover:text-foreground glass"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: motionEnabled ? [0, 6, 0] : 0 }}
        transition={{ opacity: { delay: 1.4 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
      >
        <ChevronDown className="size-4" />
      </motion.button>
    </section>
  )
}
