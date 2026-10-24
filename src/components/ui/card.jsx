import { cn } from '../../lib/utils'

function Card({ className, ...props }) {
  return (
    <div
      data-slot="card"
      className={cn('bg-slate-900/65 text-slate-50 flex flex-col gap-5 rounded-2xl border border-indigo-200/20 p-4 sm:p-6 shadow-[0_0_30px_rgba(76,99,255,0.2)] backdrop-blur', className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return <div data-slot="card-header" className={cn('grid gap-1.5', className)} {...props} />
}

function CardTitle({ className, ...props }) {
  return (
    <h2
      data-slot="card-title"
      className={cn('text-xl font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <p
      data-slot="card-description"
      className={cn('text-sm text-slate-300', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }) {
  return <div data-slot="card-content" className={cn(className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
