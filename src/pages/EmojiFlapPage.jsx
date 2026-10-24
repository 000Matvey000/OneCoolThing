import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const CANVAS_SIZE = { width: 960, height: 540 }
const PLAYER_X = 220
const PLAYER_SIZE = 34
const PIPE_WIDTH = 84
const PIPE_GAP = 180
const PIPE_SPEED = 3.4
const PIPE_INTERVAL = 96
const GRAVITY = 0.42
const FLAP_VELOCITY = -8.1

function createInitialState() {
  return {
    y: CANVAS_SIZE.height / 2,
    velocityY: 0,
    pipes: [],
    score: 0,
    frameCount: 0,
    started: false,
    paused: false,
    gameOver: false,
  }
}

function randomGapY() {
  return 140 + Math.random() * (CANVAS_SIZE.height - 280)
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

function EmojiFlapPage() {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const stateRef = useRef(createInitialState())
  const [emojiInput, setEmojiInput] = useState('🐤')
  const [score, setScore] = useState(0)
  const [status, setStatus] = useState('Tap screen, press Space, or tap Flap to start.')
  const [paused, setPaused] = useState(false)

  const selectedEmoji = emojiInput.trim() || '🐤'

  const resetGame = useCallback(() => {
    stateRef.current = createInitialState()
    setScore(0)
    setPaused(false)
    setStatus('Tap screen, press Space, or tap Flap to start.')
  }, [])

  const flap = useCallback(() => {
    const state = stateRef.current
    if (state.gameOver) return
    state.started = true
    state.velocityY = FLAP_VELOCITY
    if (state.paused) {
      state.paused = false
      setPaused(false)
      setStatus('Keep flying!')
    } else {
      setStatus('Keep flying!')
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if (key === ' ' || key === 'arrowup' || key === 'w') {
        flap()
        event.preventDefault()
      }
      if (key === 'p' && !stateRef.current.gameOver && stateRef.current.started) {
        stateRef.current.paused = !stateRef.current.paused
        setPaused(stateRef.current.paused)
        setStatus(stateRef.current.paused ? 'Paused.' : 'Keep flying!')
        event.preventDefault()
      }
      if (key === 'r') {
        resetGame()
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [flap, resetGame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE.height)
      gradient.addColorStop(0, '#36b6ff')
      gradient.addColorStop(1, '#0a1c52')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      for (let i = 0; i < 8; i += 1) {
        const x = (i * 150 + 60) % CANVAS_SIZE.width
        ctx.beginPath()
        ctx.ellipse(x, 90 + (i % 3) * 44, 50, 22, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const drawPipes = (pipes) => {
      ctx.fillStyle = '#0a8f3f'
      ctx.strokeStyle = '#0f6728'
      ctx.lineWidth = 5

      pipes.forEach((pipe) => {
        const topHeight = pipe.gapY - PIPE_GAP / 2
        const bottomY = pipe.gapY + PIPE_GAP / 2
        const bottomHeight = CANVAS_SIZE.height - bottomY

        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topHeight)
        ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, topHeight)

        ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight)
        ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight)
      })
    }

    const drawPlayer = (playerY) => {
      ctx.save()
      ctx.font = '40px "Segoe UI Emoji", "Apple Color Emoji", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(selectedEmoji, PLAYER_X + PLAYER_SIZE / 2, playerY)
      ctx.restore()
    }

    const drawOverlay = (text) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.36)'
      ctx.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height)
      ctx.fillStyle = '#ffffff'
      ctx.font = '38px "Segoe UI", sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(text, CANVAS_SIZE.width / 2, CANVAS_SIZE.height / 2)
    }

    const tick = () => {
      const state = stateRef.current

      if (state.started && !state.paused && !state.gameOver) {
        state.frameCount += 1
        state.velocityY += GRAVITY
        state.y += state.velocityY

        if (state.frameCount % PIPE_INTERVAL === 0) {
          state.pipes.push({ x: CANVAS_SIZE.width + PIPE_WIDTH, gapY: randomGapY(), passed: false })
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
          const bottomRect = { x: pipe.x, y: pipe.gapY + PIPE_GAP / 2, width: PIPE_WIDTH, height: CANVAS_SIZE.height - (pipe.gapY + PIPE_GAP / 2) }
          if (intersects(playerRect, topRect) || intersects(playerRect, bottomRect)) {
            state.gameOver = true
            setStatus('Crashed! Press Reset to try again.')
            break
          }

          if (!pipe.passed && pipe.x + PIPE_WIDTH < PLAYER_X) {
            pipe.passed = true
            state.score += 1
            setScore(state.score)
          }
        }

        if (state.y < PLAYER_SIZE / 2 || state.y > CANVAS_SIZE.height - PLAYER_SIZE / 2) {
          state.gameOver = true
          setStatus('Out of bounds! Press Reset to try again.')
        }
      }

      drawBackground()
      drawPipes(state.pipes)
      drawPlayer(state.y)

      if (!state.started && !state.gameOver) {
        drawOverlay('Tap screen or press Space')
      } else if (state.paused && !state.gameOver) {
        drawOverlay('Paused')
      } else if (state.gameOver) {
        drawOverlay('Game Over')
      }

      frameRef.current = requestAnimationFrame(tick)
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameRef.current)
    }
  }, [selectedEmoji])

  return (
    <div className="min-h-screen px-3 py-6 sm:px-4 sm:py-10">
      <main className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Emoji Flap</CardTitle>
                <CardDescription>Flappy-style mode where you control the flyer with your own emoji.</CardDescription>
              </div>
              <Badge variant="secondary">Status: {status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Score {score}</Badge>
              <Badge>{paused ? 'Paused' : 'Live'}</Badge>
              <label className="text-sm text-slate-200" htmlFor="emoji-input">Player emoji</label>
              <input
                id="emoji-input"
                type="text"
                value={emojiInput}
                onChange={(event) => setEmojiInput(event.target.value.slice(0, 5))}
                maxLength={5}
                className="h-9 w-28 rounded-md border border-indigo-200/30 bg-black/30 px-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/70"
                aria-label="Player emoji text"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-cyan-300/45 bg-black">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE.width}
                height={CANVAS_SIZE.height}
                className="block h-auto w-full touch-none"
                role="img"
                aria-label="Emoji Flap game board"
                onPointerDown={(event) => {
                  event.preventDefault()
                  flap()
                }}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={flap}>Flap</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  const state = stateRef.current
                  if (!state.started || state.gameOver) return
                  state.paused = !state.paused
                  setPaused(state.paused)
                  setStatus(state.paused ? 'Paused.' : 'Keep flying!')
                }}
              >
                {paused ? 'Resume' : 'Pause'}
              </Button>
              <Button variant="secondary" onClick={resetGame}>Reset</Button>
              <Button variant="ghost" asChild>
                <Link to="/">Back to contact page</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default EmojiFlapPage
