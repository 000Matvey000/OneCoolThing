import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

const WIN_SCORE = 7
const CANVAS_SIZE = { width: 960, height: 540 }
const PADDLE = { width: 16, height: 108, speed: 8 }

function createInitialState() {
  return {
    playerY: CANVAS_SIZE.height / 2 - PADDLE.height / 2,
    cpuY: CANVAS_SIZE.height / 2 - PADDLE.height / 2,
    ballX: CANVAS_SIZE.width / 2,
    ballY: CANVAS_SIZE.height / 2,
    ballVX: 6,
    ballVY: 3,
    playerScore: 0,
    cpuScore: 0,
    paused: false,
    gameOver: false,
    keys: {
      up: false,
      down: false,
    },
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function PongPage() {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const stateRef = useRef(createInitialState())
  const [score, setScore] = useState({ player: 0, cpu: 0 })
  const [status, setStatus] = useState('First to 7 wins.')
  const [paused, setPaused] = useState(false)

  const resetBall = useCallback((direction = 1) => {
    const state = stateRef.current
    state.ballX = CANVAS_SIZE.width / 2
    state.ballY = CANVAS_SIZE.height / 2
    state.ballVX = 6 * direction
    state.ballVY = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2.2)
  }, [])

  const syncScore = useCallback(() => {
    const state = stateRef.current
    setScore({ player: state.playerScore, cpu: state.cpuScore })
  }, [])

  const resetMatch = useCallback(() => {
    stateRef.current = createInitialState()
    resetBall(Math.random() > 0.5 ? 1 : -1)
    syncScore()
    setPaused(false)
    setStatus('First to 7 wins.')
  }, [resetBall, syncScore])

  const updateFromTouch = useCallback((clientY, target) => {
    const rect = target.getBoundingClientRect()
    const normalizedY = ((clientY - rect.top) / rect.height) * CANVAS_SIZE.height
    stateRef.current.playerY = clamp(normalizedY - PADDLE.height / 2, 0, CANVAS_SIZE.height - PADDLE.height)
  }, [])

  useEffect(() => {
    const setKey = (event, isPressed) => {
      const key = event.key.toLowerCase()
      if (key === 'w' || key === 'arrowup') {
        stateRef.current.keys.up = isPressed
        event.preventDefault()
      }
      if (key === 's' || key === 'arrowdown') {
        stateRef.current.keys.down = isPressed
        event.preventDefault()
      }
      if (isPressed && key === ' ' && !stateRef.current.gameOver) {
        stateRef.current.paused = !stateRef.current.paused
        setPaused(stateRef.current.paused)
        setStatus(stateRef.current.paused ? 'Paused.' : 'First to 7 wins.')
        event.preventDefault()
      }
    }

    const down = (event) => setKey(event, true)
    const up = (event) => setKey(event, false)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const drawCenterLine = () => {
      ctx.fillStyle = '#5deeff'
      for (let y = 0; y < CANVAS_SIZE.height; y += 34) {
        ctx.fillRect(CANVAS_SIZE.width / 2 - 3, y, 6, 20)
      }
    }

    const drawScene = () => {
      const state = stateRef.current
      ctx.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height)
      ctx.fillStyle = '#020202'
      ctx.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height)

      drawCenterLine()

      ctx.fillStyle = '#47f8ff'
      ctx.fillRect(32, state.playerY, PADDLE.width, PADDLE.height)
      ctx.fillStyle = '#ff4fd8'
      ctx.fillRect(CANVAS_SIZE.width - 32 - PADDLE.width, state.cpuY, PADDLE.width, PADDLE.height)

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(state.ballX, state.ballY, 10, 0, Math.PI * 2)
      ctx.fill()

      if (state.paused && !state.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
        ctx.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height)
        ctx.fillStyle = '#f6f8ff'
        ctx.font = '44px "Courier New", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('PAUSED', CANVAS_SIZE.width / 2, CANVAS_SIZE.height / 2)
      }

      if (state.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
        ctx.fillRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height)
        ctx.fillStyle = '#f6f8ff'
        ctx.font = '44px "Courier New", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(state.playerScore > state.cpuScore ? 'YOU WIN' : 'CPU WINS', CANVAS_SIZE.width / 2, CANVAS_SIZE.height / 2 - 12)
        ctx.font = '24px "Courier New", monospace'
        ctx.fillText('Press Reset Match', CANVAS_SIZE.width / 2, CANVAS_SIZE.height / 2 + 36)
      }
    }

    const bounceFromPaddle = (paddleY, isPlayerSide) => {
      const state = stateRef.current
      const center = paddleY + PADDLE.height / 2
      const relativeIntersect = (state.ballY - center) / (PADDLE.height / 2)
      const bounceAngle = relativeIntersect * (Math.PI / 3)
      const speed = Math.min(13, Math.hypot(state.ballVX, state.ballVY) + 0.5)
      const direction = isPlayerSide ? 1 : -1
      state.ballVX = Math.cos(bounceAngle) * speed * direction
      state.ballVY = Math.sin(bounceAngle) * speed
    }

    const tick = () => {
      const state = stateRef.current
      if (!state.paused && !state.gameOver) {
        if (state.keys.up) state.playerY -= PADDLE.speed
        if (state.keys.down) state.playerY += PADDLE.speed
        state.playerY = clamp(state.playerY, 0, CANVAS_SIZE.height - PADDLE.height)

        const cpuDelta = state.ballY - (state.cpuY + PADDLE.height / 2)
        if (Math.abs(cpuDelta) > 10) {
          state.cpuY += Math.sign(cpuDelta) * Math.min(5.2, Math.abs(cpuDelta))
        }
        state.cpuY = clamp(state.cpuY, 0, CANVAS_SIZE.height - PADDLE.height)

        state.ballX += state.ballVX
        state.ballY += state.ballVY

        if (state.ballY <= 10 || state.ballY >= CANVAS_SIZE.height - 10) {
          state.ballVY *= -1
          state.ballY = clamp(state.ballY, 10, CANVAS_SIZE.height - 10)
        }

        if (state.ballX - 10 <= 32 + PADDLE.width && state.ballY >= state.playerY && state.ballY <= state.playerY + PADDLE.height && state.ballVX < 0) {
          state.ballX = 32 + PADDLE.width + 10
          bounceFromPaddle(state.playerY, true)
        }

        const cpuX = CANVAS_SIZE.width - 32 - PADDLE.width
        if (state.ballX + 10 >= cpuX && state.ballY >= state.cpuY && state.ballY <= state.cpuY + PADDLE.height && state.ballVX > 0) {
          state.ballX = cpuX - 10
          bounceFromPaddle(state.cpuY, false)
        }

        if (state.ballX < -20) {
          state.cpuScore += 1
          syncScore()
          if (state.cpuScore >= WIN_SCORE) {
            state.gameOver = true
            setStatus('CPU wins the match.')
          } else {
            resetBall(1)
          }
        }

        if (state.ballX > CANVAS_SIZE.width + 20) {
          state.playerScore += 1
          syncScore()
          if (state.playerScore >= WIN_SCORE) {
            state.gameOver = true
            setStatus('You win the match!')
          } else {
            resetBall(-1)
          }
        }
      }

      drawScene()
      frameRef.current = requestAnimationFrame(tick)
    }

    resetMatch()
    frameRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameRef.current)
    }
  }, [resetBall, resetMatch, syncScore])

  const controls = useMemo(
    () => [
      { label: 'Up', onPointerDown: () => (stateRef.current.keys.up = true), onPointerUp: () => (stateRef.current.keys.up = false) },
      { label: 'Down', onPointerDown: () => (stateRef.current.keys.down = true), onPointerUp: () => (stateRef.current.keys.down = false) },
    ],
    [],
  )

  return (
    <div className="min-h-screen px-3 py-6 sm:px-4 sm:py-10">
      <main className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Arcade Pong</CardTitle>
                <CardDescription>Desktop + mobile controls. First to {WIN_SCORE} wins.</CardDescription>
              </div>
              <Badge variant="secondary">Status: {status}</Badge>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge>Player {score.player}</Badge>
              <Badge>CPU {score.cpu}</Badge>
              <Badge>{paused ? 'Paused' : 'Live'}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div
              className="overflow-hidden rounded-xl border border-fuchsia-300/45 bg-black"
              onTouchStart={(event) => updateFromTouch(event.touches[0].clientY, event.currentTarget)}
              onTouchMove={(event) => {
                updateFromTouch(event.touches[0].clientY, event.currentTarget)
                event.preventDefault()
              }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE.width}
                height={CANVAS_SIZE.height}
                className="block h-auto w-full touch-none"
                role="img"
                aria-label="Arcade Pong game board"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:hidden">
              {controls.map((control) => (
                <Button
                  key={control.label}
                  variant="secondary"
                  onPointerDown={control.onPointerDown}
                  onPointerUp={control.onPointerUp}
                  onPointerCancel={control.onPointerUp}
                >
                  {control.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  if (!stateRef.current.gameOver) {
                    stateRef.current.paused = !stateRef.current.paused
                    setPaused(stateRef.current.paused)
                    setStatus(stateRef.current.paused ? 'Paused.' : 'First to 7 wins.')
                  }
                }}
              >
                {paused ? 'Resume' : 'Pause'}
              </Button>
              <Button onClick={resetMatch}>Reset match</Button>
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

export default PongPage
