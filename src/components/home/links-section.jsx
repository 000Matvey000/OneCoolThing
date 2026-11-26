import { ArrowUpRight, Waves } from 'lucide-react'

import { LinkLogo } from '@/components/common/link-logo'
import { Reveal } from '@/components/common/reveal'
import { SectionHeading } from '@/components/common/section-heading'
import { SpotlightCard } from '@/components/common/spotlight-card'
import { Badge } from '@/components/ui/badge'
import { socialLinks } from '@/data/social-links'
import { cn } from '@/lib/utils'

function LinkCard({ link }) {
  return (
    <SpotlightCard
      as="a"
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group flex h-full items-center gap-4 p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:p-5',
        link.featured && 'sm:min-h-28',
      )}
    >
      <span className="grid size-12 shrink-0 place-items-center rounded-xl border bg-background/50 shadow-inner transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6">
        <LinkLogo link={link} className="size-6" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-medium">{link.label}</span>
          {link.featured ? (
            <Badge variant="outline" className="hidden sm:inline-flex">
              {link.group}
            </Badge>
          ) : null}
        </span>
        <span className="block truncate text-sm text-muted-foreground">{link.handle}</span>
        {link.description ? (
          <span className="mt-1 hidden text-sm text-muted-foreground/80 sm:block">{link.description}</span>
        ) : null}
      </span>

      <ArrowUpRight
        aria-hidden="true"
        className="size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
      />
      <span className="sr-only">(opens in a new tab)</span>
    </SpotlightCard>
  )
}

export function LinksSection() {
  return (
    <section id="links" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Say hello"
        icon={Waves}
        title="Find me around the web"
        description="Pick whichever platform you like best — I'm reachable on all of them."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {socialLinks.map((link, index) => (
          <Reveal key={link.id} delay={index * 0.05} className={cn(link.featured && 'sm:col-span-2')}>
            <LinkCard link={link} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
