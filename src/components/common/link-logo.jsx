import { usePreferences } from '@/hooks/use-preferences'
import { cn } from '@/lib/utils'

/** Brand logo (theme-aware) or fallback icon for an entry from social-links.js. */
export function LinkLogo({ link, className }) {
  const { theme } = usePreferences()

  if (link.icon) {
    const Icon = link.icon
    return <Icon aria-hidden="true" className={className} />
  }

  const isLight = theme === 'light'
  return (
    <img
      src={isLight ? link.logo.light : link.logo.dark}
      alt=""
      draggable="false"
      className={cn('object-contain', className)}
      style={isLight && link.logo.lightFilter ? { filter: link.logo.lightFilter } : undefined}
    />
  )
}
