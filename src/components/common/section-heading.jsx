import { cn } from '@/lib/utils'

import { Reveal } from './reveal'

export function SectionHeading({ eyebrow, title, description, icon: Icon, className }) {
  return (
    <Reveal className={cn('mx-auto mb-12 max-w-2xl text-center', className)}>
      <div className="glass mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
        {Icon ? <Icon className="size-3.5 text-brand-1" aria-hidden="true" /> : null}
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-balance text-muted-foreground sm:text-lg">{description}</p> : null}
    </Reveal>
  )
}
