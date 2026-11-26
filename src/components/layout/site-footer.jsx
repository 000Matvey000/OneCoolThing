import { CodeXml, Pause, Play } from 'lucide-react'

import { BrandMark } from '@/components/common/brand-mark'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { site } from '@/data/site'
import { usePreferences } from '@/hooks/use-preferences'

export function SiteFooter() {
  const { motionEnabled, setMotionEnabled } = usePreferences()

  return (
    <footer className="mx-auto w-full max-w-6xl px-4 pt-16 pb-10 sm:px-6">
      <Separator className="mb-6" />
      <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <p className="flex items-center gap-2 text-center sm:text-left">
          <BrandMark className="size-6 [&_svg]:size-3" />
          <span>
            © {new Date().getFullYear()} {site.name} · Built with React, shadcn/ui &amp; Tailwind CSS
          </span>
        </p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setMotionEnabled(!motionEnabled)}>
            {motionEnabled ? <Pause /> : <Play />}
            {motionEnabled ? 'Pause animations' : 'Play animations'}
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href={site.repo.sourceUrl} target="_blank" rel="noopener noreferrer">
              <CodeXml /> Source
            </a>
          </Button>
        </div>
      </div>
    </footer>
  )
}
