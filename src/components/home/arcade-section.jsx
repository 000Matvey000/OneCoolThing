import { Bird, Gamepad2, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Reveal } from '@/components/common/reveal'
import { SectionHeading } from '@/components/common/section-heading'
import { SpotlightCard } from '@/components/common/spotlight-card'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'

function PongPreview() {
  return (
    <div className="absolute inset-0 bg-[#060816]">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(rgba(94,234,212,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(94,234,212,.07) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="absolute inset-y-4 left-1/2 -translate-x-1/2 border-l-2 border-dashed border-cyan-300/30" />
      <div className="absolute top-3 left-1/2 -translate-x-1/2 font-mono text-2xl font-bold tracking-[0.6em] text-white/25">
        3 2
      </div>
      <div className="pong-paddle left-[6%] bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,.85)]" />
      <div
        className="pong-paddle right-[6%] bg-fuchsia-400 shadow-[0_0_16px_rgba(232,121,249,.85)]"
        style={{ animationDuration: '1.25s', animationDelay: '-0.7s' }}
      />
      <div className="pong-ball-x">
        <div className="pong-ball" />
      </div>
    </div>
  )
}

const PIPE_TOPS = [0.15, 0.4, 0.25, 0.45, 0.3, 0.2]
const PIPE_GAP = 0.36
const CLOUDS = [
  { left: '6%', top: '14%', width: '18%' },
  { left: '38%', top: '8%', width: '14%' },
  { left: '66%', top: '20%', width: '20%' },
]

function FlapPreview() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,#36b6ff,#0a1c52)]">
      <div className="flap-clouds absolute inset-y-0 left-0 flex w-[200%]">
        {[0, 1].map((copy) => (
          <div key={copy} className="relative h-full flex-1">
            {CLOUDS.map((cloud) => (
              <div
                key={cloud.left}
                className="absolute aspect-[3/1] rounded-full bg-white/35 blur-[2px]"
                style={{ left: cloud.left, top: cloud.top, width: cloud.width }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flap-track absolute inset-y-0 left-0 flex w-[200%]">
        {[...PIPE_TOPS, ...PIPE_TOPS].map((top, index) => (
          <div key={index} className="relative h-full flex-1">
            <div
              className="absolute top-0 left-1/2 w-7 -translate-x-1/2 rounded-b-md border-2 border-t-0 border-emerald-950/40 bg-[linear-gradient(90deg,#16a34a,#4ade80_45%,#15803d)]"
              style={{ height: `${top * 100}%` }}
            />
            <div
              className="absolute bottom-0 left-1/2 w-7 -translate-x-1/2 rounded-t-md border-2 border-b-0 border-emerald-950/40 bg-[linear-gradient(90deg,#16a34a,#4ade80_45%,#15803d)]"
              style={{ height: `${(1 - top - PIPE_GAP) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="absolute top-1/2 left-[22%] -translate-y-1/2 text-4xl drop-shadow-lg">
        <span className="flap-emoji inline-block">🐤</span>
      </div>
    </div>
  )
}

const GAMES = [
  {
    to: '/pong',
    title: 'Arcade Pong',
    description: 'The classic paddle battle against a CPU that never gets tired. First to 7 wins.',
    icon: Gamepad2,
    preview: PongPreview,
    cta: 'Play Pong',
    hints: [
      { keys: ['W', 'S'], label: 'or mouse to move' },
      { keys: ['Space'], label: 'pause' },
    ],
  },
  {
    to: '/emoji-flap',
    title: 'Emoji Flap',
    description: 'Pick any emoji and flap it through the pipes. How far can you get?',
    icon: Bird,
    preview: FlapPreview,
    cta: 'Play Emoji Flap',
    hints: [
      { keys: ['Space'], label: 'or tap to flap' },
      { keys: ['P'], label: 'pause' },
      { keys: ['R'], label: 'reset' },
    ],
  },
]

export function ArcadeSection() {
  return (
    <section id="arcade" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Mini arcade"
        icon={Gamepad2}
        title="Take a quick break"
        description="Two tiny games that run right in your browser — keyboard, mouse and touch friendly."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {GAMES.map((game, index) => {
          const Preview = game.preview
          const Icon = game.icon
          return (
            <Reveal key={game.to} delay={index * 0.1}>
              <SpotlightCard tilt={false} className="group flex h-full flex-col overflow-hidden">
                <Link
                  to={game.to}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="relative block aspect-video overflow-hidden border-b"
                >
                  <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                    <Preview />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{game.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{game.description}</p>
                    </div>
                    <Icon className="mt-1 size-5 shrink-0 text-brand-1" aria-hidden="true" />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                    {game.hints.map((hint) => (
                      <span key={hint.label} className="inline-flex items-center gap-1.5">
                        <KbdGroup>
                          {hint.keys.map((key) => (
                            <Kbd key={key}>{key}</Kbd>
                          ))}
                        </KbdGroup>
                        {hint.label}
                      </span>
                    ))}
                  </div>
                  <Button asChild variant="glow" size="lg" className="mt-auto w-fit px-4">
                    <Link to={game.to}>
                      <Play data-icon="inline-start" /> {game.cta}
                    </Link>
                  </Button>
                </div>
              </SpotlightCard>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
