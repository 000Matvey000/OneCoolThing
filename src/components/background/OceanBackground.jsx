import { useEffect, useRef } from 'react'

import { usePreferences } from '@/hooks/use-preferences'

import { OceanScene } from './ocean-scene'

const BLOB_COLORS = ['var(--blob-1)', 'var(--blob-2)', 'var(--blob-3)', 'var(--blob-4)']

/**
 * Full-screen interactive backdrop. Sits behind all content (pointer-events: none) —
 * the scene listens to pointer movement on the window so creatures still flee
 * from the cursor while it hovers over cards.
 */
export function OceanBackground() {
  const canvasRef = useRef(null)
  const blobRefs = useRef([])
  const sceneRef = useRef(null)
  const { theme, motionEnabled } = usePreferences()

  // Create the scene once; the two effects below keep it in sync with preferences.
  useEffect(() => {
    const scene = new OceanScene(canvasRef.current, blobRefs.current, {
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      animated: document.documentElement.dataset.motion !== 'off',
    })
    sceneRef.current = scene
    return () => {
      scene.destroy()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    sceneRef.current?.setTheme(theme)
  }, [theme])

  useEffect(() => {
    sceneRef.current?.setAnimated(motionEnabled)
  }, [motionEnabled])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {BLOB_COLORS.map((color, index) => (
        <div
          key={color}
          ref={(element) => {
            blobRefs.current[index] = element
          }}
          className="ocean-blob"
          style={{ background: `radial-gradient(circle closest-side, ${color}, transparent)` }}
        />
      ))}
      <div className="light-rays" />
      <div className="light-rays light-rays-alt" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
      <div className="vignette" />
      <div className="grain" />
    </div>
  )
}
