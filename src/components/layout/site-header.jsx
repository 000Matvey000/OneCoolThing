import { Search } from 'lucide-react'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { BrandMark } from '@/components/common/brand-mark'
import { easeOutExpo } from '@/components/common/reveal'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { Separator } from '@/components/ui/separator'
import { useSectionNav } from '@/hooks/use-section-nav'
import { isMac } from '@/lib/dom'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { id: 'links', label: 'Links' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'repo', label: 'Repo' },
]

export function SiteHeader({ onOpenCommand }) {
  const goTo = useSectionNav()
  const [hovered, setHovered] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (value) => setScrolled(value > 24))

  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 sm:top-4">
      <motion.nav
        aria-label="Main"
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: easeOutExpo }}
        className={cn(
          'glass flex h-13 w-full max-w-3xl items-center gap-1 rounded-full border px-2 transition-shadow duration-300',
          scrolled && 'shadow-xl shadow-black/10 dark:shadow-black/30',
        )}
      >
        <Link to="/" className="flex items-center gap-2 rounded-full py-1 pr-3 pl-1 font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <BrandMark />
          <span>
            matveyao<span className="text-muted-foreground">.io</span>
          </span>
        </Link>

        <ul className="ml-auto hidden items-center sm:flex" onMouseLeave={() => setHovered(null)}>
          {NAV_ITEMS.map((item) => (
            <li key={item.id} className="relative">
              {hovered === item.id ? (
                <motion.span
                  layoutId="nav-hover"
                  className="absolute inset-0 rounded-full bg-muted"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              ) : null}
              <button
                type="button"
                onMouseEnter={() => setHovered(item.id)}
                onFocus={() => setHovered(item.id)}
                onBlur={() => setHovered(null)}
                onClick={() => goTo(item.id)}
                className="relative z-10 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:text-foreground"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <Separator orientation="vertical" className="mx-1 hidden h-5 sm:block" />

        <Button
          variant="ghost"
          size="lg"
          onClick={onOpenCommand}
          className="ml-auto rounded-full text-muted-foreground sm:ml-0"
          aria-label="Open command menu"
        >
          <Search />
          <span className="hidden md:inline">Search</span>
          <KbdGroup className="hidden md:inline-flex">
            <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Button>
        <ThemeToggle />
      </motion.nav>
    </header>
  )
}
