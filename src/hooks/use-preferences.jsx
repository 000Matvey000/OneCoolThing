import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

const THEME_KEY = 'oct-theme'
const MOTION_KEY = 'oct-motion'

const PreferencesContext = createContext(null)

function readStorage(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Storage can be unavailable (private mode, blocked cookies) — preferences just won't persist.
  }
}

function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}

function applyTheme(theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function PreferencesProvider({ children }) {
  // Dark is the default look of the site; an explicit choice is remembered.
  const [theme, setThemeState] = useState(() => (readStorage(THEME_KEY) === 'light' ? 'light' : 'dark'))
  const [motionChoice, setMotionChoice] = useState(() => readStorage(MOTION_KEY))
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const motionEnabled = motionChoice ? motionChoice === 'on' : !prefersReducedMotion

  useLayoutEffect(() => {
    applyTheme(theme)
  }, [theme])

  useLayoutEffect(() => {
    document.documentElement.dataset.motion = motionEnabled ? 'on' : 'off'
  }, [motionEnabled])

  const setTheme = useCallback((next) => {
    writeStorage(THEME_KEY, next)
    setThemeState(next)
  }, [])

  /**
   * Toggle the theme. When an origin point is given (e.g. the click position) and the browser
   * supports View Transitions, the new theme is revealed as a growing circle from that point.
   */
  const toggleTheme = useCallback(
    (origin) => {
      const next = theme === 'dark' ? 'light' : 'dark'
      const canAnimate = motionEnabled && typeof document.startViewTransition === 'function'

      if (!canAnimate) {
        setTheme(next)
        return
      }

      const x = origin?.x ?? window.innerWidth / 2
      const y = origin?.y ?? 0
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

      const transition = document.startViewTransition(() => {
        flushSync(() => setTheme(next))
        applyTheme(next)
      })

      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
          )
        })
        .catch(() => {})
    },
    [motionEnabled, setTheme, theme],
  )

  const setMotionEnabled = useCallback((enabled) => {
    const value = enabled ? 'on' : 'off'
    writeStorage(MOTION_KEY, value)
    setMotionChoice(value)
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, motionEnabled, setMotionEnabled }),
    [theme, setTheme, toggleTheme, motionEnabled, setMotionEnabled],
  )

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) throw new Error('usePreferences must be used inside <PreferencesProvider>')
  return context
}
