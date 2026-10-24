import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'

import socialLinks from '../data/socialLinks'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

function ContactPage() {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const links = useMemo(() => socialLinks, [])

  return (
    <div className="relative min-h-screen px-4 py-8 sm:py-12">
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      <main className="mx-auto w-full max-w-3xl">
        <Card className="relative overflow-hidden">
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-4 top-4"
            aria-label="Toggle theme"
            onClick={() => setIsDarkTheme((theme) => !theme)}
            type="button"
          >
            {isDarkTheme ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          <CardHeader className="items-center text-center">
            <img src="/img/profilepic.jpg" alt="Matvey Osipov" className="size-28 rounded-full border border-white/20 object-cover shadow-lg" />
            <Badge variant="secondary" className="mt-2">Learner · Developer · IT Enthusiast</Badge>
            <CardTitle className="text-3xl">Matvey Osipov</CardTitle>
            <CardDescription>This is my contact hub — pick your favorite platform below and say hello.</CardDescription>
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
                  className="group flex items-center gap-3 rounded-xl border border-indigo-200/25 bg-white/5 p-3 transition hover:bg-indigo-300/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                >
                  <img src={logoSrc} style={logoStyle} alt="" className="size-8 rounded-md object-contain" />
                  <span className="text-sm font-medium text-slate-100 group-hover:text-white">{item.label}</span>
                </a>
              )
            })}

            <Link to="/pong" className="sm:col-span-2">
              <Button className="w-full" size="lg">Play Pong</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default ContactPage
