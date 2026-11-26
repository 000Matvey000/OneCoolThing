import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

export function scrollToSection(id) {
  const behavior = document.documentElement.dataset.motion === 'off' ? 'auto' : 'smooth'
  document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
}

/**
 * Returns a function that scrolls to a section on the home page, navigating home first
 * when needed. (Routing is hash-based, so plain "#section" links can't be used.)
 */
export function useSectionNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return useCallback(
    (id) => {
      if (pathname !== '/') {
        navigate('/', { state: { scrollTo: id } })
        return
      }
      scrollToSection(id)
    },
    [navigate, pathname],
  )
}
