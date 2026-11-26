import { Bird, BookOpen, Gamepad2, House, Link2, Moon, Pause, Play, Sun } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { LinkLogo } from '@/components/common/link-logo'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
import { socialLinks } from '@/data/social-links'
import { usePreferences } from '@/hooks/use-preferences'
import { useSectionNav } from '@/hooks/use-section-nav'

/** ⌘K / Ctrl+K palette: navigate, open links and flip preferences from the keyboard. */
export function CommandMenu({ open, onOpenChange }) {
  const navigate = useNavigate()
  const goTo = useSectionNav()
  const { theme, toggleTheme, motionEnabled, setMotionEnabled } = usePreferences()

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpenChange((current) => !current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onOpenChange])

  // Close first, then act — scrolling is blocked while the dialog holds the scroll lock.
  const run = (action) => {
    onOpenChange(false)
    window.setTimeout(action, 60)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command menu"
      description="Jump to a page, open a link or change a setting."
      className="sm:max-w-lg"
    >
      <Command>
        <CommandInput placeholder="Where to?" />
        <CommandList className="max-h-[min(24rem,60vh)]">
          <CommandEmpty>Nothing found — the fish ate it.</CommandEmpty>

          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => run(() => navigate('/'))}>
              <House /> Home
            </CommandItem>
            <CommandItem onSelect={() => run(() => goTo('links'))}>
              <Link2 /> Links
            </CommandItem>
            <CommandItem onSelect={() => run(() => goTo('arcade'))}>
              <Gamepad2 /> Arcade
            </CommandItem>
            <CommandItem onSelect={() => run(() => goTo('repo'))}>
              <BookOpen /> The OneCoolThing repo
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Play">
            <CommandItem onSelect={() => run(() => navigate('/pong'))}>
              <Gamepad2 /> Arcade Pong
            </CommandItem>
            <CommandItem onSelect={() => run(() => navigate('/emoji-flap'))}>
              <Bird /> Emoji Flap
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Say hello">
            {socialLinks.map((link) => (
              <CommandItem
                key={link.id}
                value={`${link.label} ${link.handle}`}
                onSelect={() => run(() => window.open(link.href, '_blank', 'noopener,noreferrer'))}
              >
                <LinkLogo link={link} className="size-4" />
                {link.label}
                <CommandShortcut className="tracking-normal">{link.handle}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Preferences">
            <CommandItem onSelect={() => run(() => toggleTheme())}>
              {theme === 'dark' ? <Sun /> : <Moon />}
              Switch to {theme === 'dark' ? 'light' : 'dark'} theme
            </CommandItem>
            <CommandItem onSelect={() => run(() => setMotionEnabled(!motionEnabled))}>
              {motionEnabled ? <Pause /> : <Play />}
              {motionEnabled ? 'Pause' : 'Resume'} background animations
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
