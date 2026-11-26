import { Bird, Pause, Play, RotateCcw, Wind } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { GameScreen, GameShell, Stat } from '@/components/games/game-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isEditableTarget } from '@/lib/dom'

const CANVAS = { width: 960, height: 540 }
const PLAYER_X = 220
const PLAYER_SIZE = 34
const PIPE_WIDTH = 84
const PIPE_GAP = 180
const PIPE_SPEED = 3.4
const PIPE_INTERVAL = 96
const GRAVITY = 0.42
const FLAP_VELOCITY = -8.1
const BEST_KEY = 'oct-emoji-flap-best'
const PRESETS = ['🐤', '🐟', '🚀', '👾', '🦄', '🐝']
const START_STATUS = 'Tap the board, press Space, or hit Flap to start.'
const FONT = '"Geist Variable", ui-sans-serif, system-ui, sans-serif'

function createInitialState() {
  return {
    y: CANVAS.height / 2,
    velocityY: 0,
    pipes: [],
    score: 0,
    frameCount: 0,
    started: false,
    paused: false,
    gameOver: false,
  }
}

function readBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function randomGapY() {
  return 140 + Math.random() * (CANVAS.height - 280)
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

export default function EmojiFlapPage() {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const stateRef = useRef(createInitialState())
  const cloudOffsetRef = useRef(0)
  const [emojiInput, setEmojiInput] = useState('🐤')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(readBest)
  const bestRef = useRef(best)
  const [status, setStatus] = useState(START_STATUS)
  const [paused, setPaused] = useState(false)

  const selectedEmoji = emojiInput.trim() || '🐤'

  const resetGame = useCallback(() => {
    stateRef.current = createInitialState()
    setScore(0)
    setPaused(false)
    setStatus(START_STATUS)
  }, [])

  const flap = useCallback(() => {
    const state = stateRef.current
    if (state.gameOver) return
    state.started = true
    state.velocityY = FLAP_VELOCITY
    if (state.paused) {
      state.paused = false
      setPaused(false)
    }
    setStatus('Keep flying!')
  }, [])

  const togglePause = useCallback(() => {
    const state = stateRef.current
    if (!state.started || state.gameOver) return
    state.paused = !state.paused
    setPaused(state.paused)
    setStatus(state.paused ? 'Paused.' : 'Keep flying!')
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Let people type in the emoji box without flapping, pausing or resetting.
      if (isEditableTarget(event.target)) return
      const key = event.key.toLowerCase()
      if (key === ' ' || key === 'arrowup' || key === 'w') {
        event.preventDefault()
        // Blur a focused button so the key-up doesn't "click" it as well.
        if (event.target instanceof HTMLButtonElement) event.target.blur()
        flap()
      }
      if (key === 'p') {
        event.preventDefault()
        togglePause()
      }
      if (key === 'r') {
        event.preventDefault()
        resetGame()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [flap, resetGame, togglePause])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const { width: W, height: H } = CANVAS

    const endGame = (state, message) => {
      state.gameOver = true
      setStatus(message)
      if (state.score > bestRef.current) {
        bestRef.current = state.score
        setBest(state.score)
        try {
          window.localStorage.setItem(BEST_KEY, String(state.score))
        } catch {
          // Best score just won't persist.
        }
      }
    }

    const drawBackground = () => {
      const sky = ctx.createLinearGradient(0, 0, 0, H)
      sky.addColorStop(0, '#36b6ff')
      sky.addColorStop(1, '#0a1c52')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, W, H)

      const sun = ctx.createRadialGradient(W * 0.82, 70, 0, W * 0.82, 70, 160)
      sun.addColorStop(0, 'rgba(255, 244, 214, 0.55)')
      sun.addColorStop(1, 'rgba(255, 244, 214, 0)')
      ctx.fillStyle = sun
      ctx.fillRect(0, 0, W, H)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      const span = W + 160
      for (let i = 0; i < 8; i += 1) {
        const x = ((((i * 150 + 60 - cloudOffsetRef.current) % span) + span) % span) - 80
        const y = 90 + (i % 3) * 44
        ctx.beginPath()
        ctx.ellipse(x, y, 52, 22, 0, 0, Math.PI * 2)
        ctx.ellipse(x + 30, y - 10, 34, 18, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawPipe = (x, y, height, capAtBottom) => {
      if (height <= 0) return
      const body = ctx.createLinearGradient(x, 0, x + PIPE_WIDTH, 0)
      body.addColorStop(0, '#15803d')
      body.addColorStop(0.45, '#4ade80')
      body.addColorStop(1, '#166534')
      ctx.fillStyle = body
      ctx.strokeStyle = 'rgba(5, 46, 22, 0.55)'
      ctx.lineWidth = 3
      ctx.fillRect(x, y, PIPE_WIDTH, height)
      ctx.strokeRect(x, y, PIPE_WIDTH, height)

      const capHeight = 24
      const capY = capAtBottom ? y + height - capHeight : y
      ctx.fillRect(x - 6, capY, PIPE_WIDTH + 12, capHeight)
      ctx.strokeRect(x - 6, capY, PIPE_WIDTH + 12, capHeight)
    }

    const drawPlayer = (state) => {
      ctx.save()
      ctx.translate(PLAYER_X + PLAYER_SIZE / 2, state.y)
      ctx.rotate(Math.max(-0.5, Math.min(1, state.velocityY * 0.06)))
      ctx.font = '40px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetY = 4
      ctx.fillText(selectedEmoji, 0, 0)
      ctx.restore()
    }

    const drawScore = (value) => {
      ctx.save()
      ctx.font = `700 64px ${FONT}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
      ctx.shadowColor = 'rgba(10, 28, 82, 0.5)'
      ctx.shadowBlur = 16
      ctx.fillText(String(value), W / 2, 24)
      ctx.restore()
    }

    const drawOverlay = (title, subtitle) => {
      ctx.fillStyle = 'rgba(10, 18, 52, 0.45)'
      ctx.fillRect(0, 0, W, H)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.font = `700 48px ${FONT}`
      ctx.fillText(title, W / 2, H / 2 - 16)
      if (subtitle) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
        ctx.font = `500 22px ${FONT}`
        ctx.fillText(subtitle, W / 2, H / 2 + 32)
      }
    }

    const tick = () => {
      const state = stateRef.current

      if (!state.paused && !state.gameOver) cloudOffsetRef.current += state.started ? 0.9 : 0.35

      if (state.started && !state.paused && !state.gameOver) {
        state.frameCount += 1
        state.velocityY += GRAVITY
        state.y += state.velocityY

        if (state.frameCount % PIPE_INTERVAL === 0) {
          state.pipes.push({ x: W + PIPE_WIDTH, gapY: randomGapY(), passed: false })
        }

        state.pipes.forEach((pipe) => {
          pipe.x -= PIPE_SPEED
        })
        state.pipes = state.pipes.filter((pipe) => pipe.x + PIPE_WIDTH > -20)

        const playerRect = {
          x: PLAYER_X + 3,
          y: state.y - PLAYER_SIZE / 2 + 3,
          width: PLAYER_SIZE - 6,
          height: PLAYER_SIZE - 6,
        }

        for (const pipe of state.pipes) {
          const topRect = { x: pipe.x, y: 0, width: PIPE_WIDTH, height: pipe.gapY - PIPE_GAP / 2 }
          const bottomRect = {
            x: pipe.x,
            y: pipe.gapY + PIPE_GAP / 2,
            width: PIPE_WIDTH,
            height: H - (pipe.gapY + PIPE_GAP / 2),
          }
          if (intersects(playerRect, topRect) || intersects(playerRect, bottomRect)) {
            endGame(state, 'Crashed! Press Reset to try again.')
            break
          }

          if (!pipe.passed && pipe.x + PIPE_WIDTH < PLAYER_X) {
            pipe.passed = true
            state.score += 1
            setScore(state.score)
          }
        }

        if (!state.gameOver && (state.y < PLAYER_SIZE / 2 || state.y > H - PLAYER_SIZE / 2)) {
          endGame(state, 'Out of bounds! Press Reset to try again.')
        }
      }

      drawBackground()
      state.pipes.forEach((pipe) => {
        drawPipe(pipe.x, 0, pipe.gapY - PIPE_GAP / 2, true)
        drawPipe(pipe.x, pipe.gapY + PIPE_GAP / 2, H - (pipe.gapY + PIPE_GAP / 2), false)
      })
      drawPlayer(state)
      if (state.started) drawScore(state.score)

      if (state.gameOver) {
        drawOverlay('Game over', `Score ${state.score} · Best ${bestRef.current} — press R or Reset`)
      } else if (state.paused) {
        drawOverlay('Paused', 'Press P or flap to continue')
      } else if (!state.started) {
        drawOverlay('Ready?', 'Tap the board or press Space to flap')
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [selectedEmoji])

  return (
    <GameShell
      title="Emoji Flap"
      description="A flappy-style flyer starring the emoji of your choice."
      icon={Bird}
      status={status}
      stats={
        <>
          <Stat label="Score" value={score} />
          <Stat label="Best" value={best} className="border-amber-400/30" />
        </>
      }
      actions={
        <>
          <Button variant="glow" size="lg" onClick={flap}>
            <Wind data-icon="inline-start" /> Flap
          </Button>
          <Button variant="secondary" size="lg" onClick={togglePause}>
            {paused ? <Play data-icon="inline-start" /> : <Pause data-icon="inline-start" />}
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="secondary" size="lg" onClick={resetGame}>
            <RotateCcw data-icon="inline-start" /> Reset
          </Button>
        </>
      }
      hints={[
        { keys: ['Space'], label: 'or ↑ / tap to flap' },
        { keys: ['P'], label: 'pause' },
        { keys: ['R'], label: 'reset' },
      ]}
    >
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="emoji-input" className="text-sm font-medium">
          Your flyer
        </label>
        <Input
          id="emoji-input"
          value={emojiInput}
          onChange={(event) => setEmojiInput(Array.from(event.target.value).slice(0, 4).join(''))}
          className="h-9 w-20 text-center text-lg"
          aria-label="Player emoji"
        />
        <div className="flex flex-wrap gap-1" role="group" aria-label="Emoji presets">
          {PRESETS.map((emoji) => (
            <Button
              key={emoji}
              type="button"
              variant={selectedEmoji === emoji ? 'secondary' : 'ghost'}
              size="icon-lg"
              aria-label={`Fly as ${emoji}`}
              aria-pressed={selectedEmoji === emoji}
              className="text-lg"
              onClick={() => setEmojiInput(emoji)}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>

      <GameScreen>
        <canvas
          ref={canvasRef}
          width={CANVAS.width}
          height={CANVAS.height}
          className="block h-auto w-full touch-none select-none"
          role="img"
          aria-label="Emoji Flap game board"
          onPointerDown={(event) => {
            event.preventDefault()
            flap()
          }}
        />
      </GameScreen>
    </GameShell>
  )
}
