import { Fish } from 'lucide-react'

import { cn } from '@/lib/utils'

export function BrandMark({ className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative grid size-8 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--glow-from),var(--glow-to))] text-white shadow-[0_0_18px_-4px_var(--glow-to)] [&_svg]:size-4',
        className,
      )}
    >
      <Fish />
    </span>
  )
}
