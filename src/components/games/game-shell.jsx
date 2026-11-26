import { ArrowLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'

/** Page chrome shared by the games: back link, glass card, header, stats, canvas, controls, hints. */
export function GameShell({ title, description, icon: Icon, stats, status, actions, hints, children }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 pt-24 pb-6 sm:px-6 sm:pt-28">
      <Button variant="ghost" size="sm" asChild className="mb-4 text-muted-foreground">
        <Link to="/">
          <ArrowLeft /> Back home
        </Link>
      </Button>

      <Card className="glass gap-0 py-0 shadow-2xl shadow-black/10 dark:shadow-black/40">
        <CardHeader className="border-b p-4 sm:p-6 [.border-b]:pb-4 sm:[.border-b]:pb-6">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,var(--glow-from),var(--glow-to))] text-white shadow-[0_0_24px_-6px_var(--glow-to)]">
              <Icon className="size-5" />
            </span>
            <div>
              <CardTitle className="text-xl font-semibold tracking-tight">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-3 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            {stats}
            <p className="ml-auto text-sm text-muted-foreground" role="status" aria-live="polite">
              {status}
            </p>
          </div>
          {children}
          <div className="flex flex-wrap gap-2">{actions}</div>
        </CardContent>

        {hints?.length ? (
          <CardFooter className="flex-wrap gap-x-5 gap-y-2 border-t bg-transparent p-4 text-xs text-muted-foreground sm:px-6">
            {hints.map((hint) => (
              <span key={hint.label} className="inline-flex items-center gap-1.5">
                {hint.keys.length ? (
                  <KbdGroup>
                    {hint.keys.map((key) => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </KbdGroup>
                ) : null}
                {hint.label}
              </span>
            ))}
          </CardFooter>
        ) : null}
      </Card>
    </div>
  )
}

/** A small score tile whose number pops when it changes. */
export function Stat({ label, value, className }) {
  return (
    <div className={cn('flex items-baseline gap-2 rounded-xl border bg-background/40 px-3 py-1.5', className)}>
      <span className="text-[0.7rem] font-medium tracking-wider text-muted-foreground uppercase">{label}</span>
      <span className="relative inline-flex min-w-[1.5ch] justify-center text-lg font-semibold tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: -12, opacity: 0, scale: 1.4 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  )
}

/** Rounded, glowing frame around a game canvas. */
export function GameScreen({ className, children }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border shadow-[0_24px_60px_-24px_var(--glow-to)] ring-1 ring-brand-1/20',
        className,
      )}
    >
      {children}
    </div>
  )
}
