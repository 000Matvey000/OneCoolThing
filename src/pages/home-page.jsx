import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { ArcadeSection } from '@/components/home/arcade-section'
import { Hero } from '@/components/home/hero'
import { LinksSection } from '@/components/home/links-section'
import { RepoSection } from '@/components/home/repo-section'
import { scrollToSection } from '@/hooks/use-section-nav'

export default function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const target = location.state?.scrollTo

  // Arriving from another page via the header / command menu: scroll to the requested section.
  useEffect(() => {
    if (!target) return undefined
    const id = window.setTimeout(() => {
      scrollToSection(target)
      navigate('.', { replace: true, state: null })
    }, 80)
    return () => window.clearTimeout(id)
  }, [navigate, target])

  return (
    <>
      <Hero />
      <LinksSection />
      <ArcadeSection />
      <RepoSection />
    </>
  )
}
