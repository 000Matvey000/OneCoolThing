import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'

import socialLinks from '../data/socialLinks'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { cn } from '../lib/utils'

function ContactPage() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const links = useMemo(() => socialLinks, [])

  return (
    <div
      className={cn(
        'relative min-h-screen px-4 py-8 transition-colors sm:py-12',
        isDarkTheme
          ? 'text-slate-100'
          : 'text-slate-900',
      )}
      style={{
        background: isDarkTheme
          ? 'radial-gradient(circle at 15% 15%, #0f2b52, transparent 34%), radial-gradient(circle at 85% 20%, #4e1455, transparent 38%), linear-gradient(170deg, #04040d, #090b1a 55%, #030309)'
          : 'radial-gradient(circle at 10% 15%, #dbeafe, transparent 42%), radial-gradient(circle at 90% 10%, #e9d5ff, transparent 36%), linear-gradient(170deg, #f8fafc, #eef2ff 55%, #f1f5f9)',
      }}
    >
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      <main className="mx-auto w-full max-w-3xl">
        <Card
          className={cn(
            'relative overflow-hidden transition-colors',
            !isDarkTheme && 'bg-white/90 text-slate-900 border-slate-300/80 shadow-[0_0_30px_rgba(100,116,139,0.2)]',
          )}
        >
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              'absolute right-4 top-4',
              !isDarkTheme && 'bg-slate-900/10 text-slate-900 hover:bg-slate-900/20 border-slate-300',
            )}
            aria-label="Toggle theme"
            onClick={() => setIsDarkTheme((theme) => !theme)}
            type="button"
          >
            {isDarkTheme ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <CardHeader className="items-center justify-items-center text-center">
            <img src="/img/profilepic.jpg" alt="Matvey Osipov" className="size-28 rounded-full border border-white/20 object-cover shadow-lg" />
            <Badge variant="secondary" className={cn('mt-2', !isDarkTheme && 'bg-cyan-600/15 text-cyan-900 border-cyan-800/30')}>Learner · Developer · IT Enthusiast</Badge>
            <CardTitle className="text-3xl">Matvey Osipov</CardTitle>
            <CardDescription className={cn('text-center', !isDarkTheme && 'text-slate-700')}>This is my contact hub — pick your favorite platform below and say hello.</CardDescription>
          </CardHeader>

          <CardContent className="grid gap-3 sm:grid-cols-2">
            {links.map((item) => {
              const logoSrc = !isDarkTheme && item.logoSrcLight ? item.logoSrcLight : item.logoSrc
              const logoStyle = !isDarkTheme && item.logoFilterLight ? { filter: item.logoFilterLight } : undefined

              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'group flex items-center gap-3 rounded-xl border p-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70',
                    isDarkTheme
                      ? 'border-indigo-200/25 bg-white/5 hover:bg-indigo-300/15'
                      : 'border-indigo-200/80 bg-white/80 hover:bg-indigo-100/80',
                  )}
                >
                  <img src={logoSrc} style={logoStyle} alt="" className="size-8 rounded-md object-contain" />
                  <span className={cn('text-sm font-medium', isDarkTheme ? 'text-slate-100 group-hover:text-white' : 'text-slate-900 group-hover:text-slate-950')}>{item.label}</span>
                </a>
              )
            })}

            <Link to="/pong">
              <Button className="w-full" size="lg">Play Pong</Button>
            </Link>
            <Link to="/emoji-flap">
              <Button
                className={cn('w-full', !isDarkTheme && 'bg-slate-900 text-white hover:bg-slate-800 border-transparent')}
                size="lg"
                variant={isDarkTheme ? 'secondary' : 'default'}
              >
                Play Emoji Flap
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default ContactPage
