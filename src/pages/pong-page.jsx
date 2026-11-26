import { ChevronDown, ChevronUp, Gamepad2, Pause, Play, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { GameScreen, GameShell, Stat } from '@/components/games/game-shell'
import { Button } from '@/components/ui/button'
import { isEditableTarget } from '@/lib/dom'

const WIN_SCORE = 7
const CANVAS = { width: 960, height: 540 }
const PADDLE = { width: 14, height: 108, speed: 8, inset: 32 }
const BALL_RADIUS = 10
const TRAIL_LENGTH = 10
const TAU = Math.PI * 2
const DEFAULT_STATUS = `First to ${WIN_SCORE} wins.`
const FONT = '"Geist Variable", ui-sans-serif, system-ui, sans-serif'
const COLORS = {
  background: '#060816',
  grid: 'rgba(94, 234, 212, 0.05)',
  line: 'rgba(93, 238, 255, 0.28)',
  player: '#47f8ff',
  cpu: '#ff4fd8',
  ball: '#ffffff',
}

function createInitialState() {
  return {
    playerY: CANVAS.height / 2 - PADDLE.height / 2,
    cpuY: CANVAS.height / 2 - PADDLE.height / 2,
    ballX: CANVAS.width / 2,
    ballY: CANVAS.height / 2,
    ballVX: 6,
    ballVY: 3,
    playerScore: 0,
    cpuScore: 0,
    paused: false,
    gameOver: false,
    keys: { up: false, down: false },
    trail: [],
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

export default function PongPage() {
  const canvasRef = useRef(null)
  const frameRef = useRef(0)
  const stateRef = useRef(createInitialState())
  const [score, setScore] = useState({ player: 0, cpu: 0 })
  const [status, setStatus] = useState(DEFAULT_STATUS)
  const [paused, setPaused] = useState(false)

  const resetBall = useCallback((direction = 1) => {
    const state = stateRef.current
    state.ballX = CANVAS.width / 2
    state.ballY = CANVAS.height / 2
    state.ballVX = 6 * direction
    state.ballVY = (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 2.2)
    state.trail = []
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
    setStatus(DEFAULT_STATUS)
  }, [resetBall, syncScore])

  const togglePause = useCallback(() => {
    const state = stateRef.current
    if (state.gameOver) return
    state.paused = !state.paused
    setPaused(state.paused)
    setStatus(state.paused ? 'Paused.' : DEFAULT_STATUS)
  }, [])

  const movePaddleTo = useCallback((clientY, element) => {
    const rect = element.getBoundingClientRect()
    const y = ((clientY - rect.top) / rect.height) * CANVAS.height
    stateRef.current.playerY = clamp(y - PADDLE.height / 2, 0, CANVAS.height - PADDLE.height)
  }, [])

  useEffect(() => {
    const setKey = (event, pressed) => {
      if (isEditableTarget(event.target)) return
      const key = event.key.toLowerCase()
      if (key === 'w' || key === 'arrowup') {
        stateRef.current.keys.up = pressed
        event.preventDefault()
      }
      if (key === 's' || key === 'arrowdown') {
        stateRef.current.keys.down = pressed
        event.preventDefault()
      }
      if (pressed && key === ' ') {
        event.preventDefault()
        // Blur a focused button so the key-up doesn't "click" it as well.
        if (event.target instanceof HTMLButtonElement) event.target.blur()
        if (!event.repeat) togglePause()
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
  }, [togglePause])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    const { width: W, height: H } = CANVAS

    const fillRoundedRect = (x, y, w, h, r) => {
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, r)
      else ctx.rect(x, y, w, h)
      ctx.fill()
    }

    const drawOverlay = (title, subtitle) => {
      ctx.fillStyle = 'rgba(6, 8, 22, 0.62)'
      ctx.fillRect(0, 0, W, H)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#f6f8ff'
      ctx.font = `700 56px ${FONT}`
      ctx.fillText(title, W / 2, H / 2 - 18)
      ctx.fillStyle = 'rgba(246, 248, 255, 0.65)'
      ctx.font = `500 22px ${FONT}`
      ctx.fillText(subtitle, W / 2, H / 2 + 34)
    }

    const drawScene = () => {
      const state = stateRef.current
      ctx.fillStyle = COLORS.background
      ctx.fillRect(0, 0, W, H)

      ctx.strokeStyle = COLORS.grid
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x <= W; x += 40) {
        ctx.moveTo(x + 0.5, 0)
        ctx.lineTo(x + 0.5, H)
      }
      for (let y = 0; y <= H; y += 40) {
        ctx.moveTo(0, y + 0.5)
        ctx.lineTo(W, y + 0.5)
      }
      ctx.stroke()

      ctx.fillStyle = COLORS.line
      for (let y = 10; y < H; y += 34) ctx.fillRect(W / 2 - 2, y, 4, 18)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)'
      ctx.font = `700 120px ${FONT}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(String(state.playerScore), W / 4, 36)
      ctx.fillText(String(state.cpuScore), (W * 3) / 4, 36)

      ctx.shadowBlur = 24
      ctx.shadowColor = COLORS.player
      ctx.fillStyle = COLORS.player
      fillRoundedRect(PADDLE.inset, state.playerY, PADDLE.width, PADDLE.height, 7)
      ctx.shadowColor = COLORS.cpu
      ctx.fillStyle = COLORS.cpu
      fillRoundedRect(W - PADDLE.inset - PADDLE.width, state.cpuY, PADDLE.width, PADDLE.height, 7)
      ctx.shadowBlur = 0

      state.trail.forEach((point, index) => {
        const t = (index + 1) / state.trail.length
        ctx.fillStyle = `rgba(125, 211, 252, ${t * 0.28})`
        ctx.beginPath()
        ctx.arc(point.x, point.y, BALL_RADIUS * t, 0, TAU)
        ctx.fill()
      })

      ctx.shadowBlur = 28
      ctx.shadowColor = '#7dd3fc'
      ctx.fillStyle = COLORS.ball
      ctx.beginPath()
      ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, TAU)
      ctx.fill()
      ctx.shadowBlur = 0

      if (state.gameOver) {
        drawOverlay(state.playerScore > state.cpuScore ? 'YOU WIN' : 'CPU WINS', 'Press “Reset match” to play again')
      } else if (state.paused) {
        drawOverlay('PAUSED', 'Press Space or “Resume” to continue')
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
        state.playerY = clamp(state.playerY, 0, H - PADDLE.height)

        const cpuDelta = state.ballY - (state.cpuY + PADDLE.height / 2)
        if (Math.abs(cpuDelta) > 10) {
          state.cpuY += Math.sign(cpuDelta) * Math.min(5.2, Math.abs(cpuDelta))
        }
        state.cpuY = clamp(state.cpuY, 0, H - PADDLE.height)

        state.ballX += state.ballVX
        state.ballY += state.ballVY
        state.trail.push({ x: state.ballX, y: state.ballY })
        if (state.trail.length > TRAIL_LENGTH) state.trail.shift()

        if (state.ballY <= BALL_RADIUS || state.ballY >= H - BALL_RADIUS) {
          state.ballVY *= -1
          state.ballY = clamp(state.ballY, BALL_RADIUS, H - BALL_RADIUS)
        }

        const playerEdge = PADDLE.inset + PADDLE.width
        if (
          state.ballX - BALL_RADIUS <= playerEdge &&
          state.ballY >= state.playerY &&
          state.ballY <= state.playerY + PADDLE.height &&
          state.ballVX < 0
        ) {
          state.ballX = playerEdge + BALL_RADIUS
          bounceFromPaddle(state.playerY, true)
        }

        const cpuX = W - PADDLE.inset - PADDLE.width
        if (
          state.ballX + BALL_RADIUS >= cpuX &&
          state.ballY >= state.cpuY &&
          state.ballY <= state.cpuY + PADDLE.height &&
          state.ballVX > 0
        ) {
          state.ballX = cpuX - BALL_RADIUS
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

        if (state.ballX > W + 20) {
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
    return () => cancelAnimationFrame(frameRef.current)
  }, [resetBall, resetMatch, syncScore])

  const holdKey = (key, pressed) => () => {
    stateRef.current.keys[key] = pressed
  }

  return (
    <GameShell
      title="Arcade Pong"
      description={`Keyboard, mouse and touch controls. First to ${WIN_SCORE} wins.`}
      icon={Gamepad2}
      status={status}
      stats={
        <>
          <Stat label="You" value={score.player} className="border-cyan-400/30" />
          <Stat label="CPU" value={score.cpu} className="border-fuchsia-400/30" />
        </>
      }
      actions={
        <>
          <Button variant="secondary" size="lg" onClick={togglePause}>
            {paused ? <Play data-icon="inline-start" /> : <Pause data-icon="inline-start" />}
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="glow" size="lg" onClick={resetMatch}>
            <RotateCcw data-icon="inline-start" /> Reset match
          </Button>
        </>
      }
      hints={[
        { keys: ['W', 'S'], label: 'or ↑ ↓ to move' },
        { keys: ['Space'], label: 'pause / resume' },
        { keys: [], label: 'Mouse or touch: drag over the board to steer' },
      ]}
    >
      <GameScreen>
        <canvas
          ref={canvasRef}
          width={CANVAS.width}
          height={CANVAS.height}
          className="block h-auto w-full touch-none select-none"
          role="img"
          aria-label="Arcade Pong game board"
          onPointerDown={(event) => {
            if (event.pointerType !== 'mouse') event.currentTarget.setPointerCapture?.(event.pointerId)
            movePaddleTo(event.clientY, event.currentTarget)
          }}
          onPointerMove={(event) => movePaddleTo(event.clientY, event.currentTarget)}
        />
      </GameScreen>

      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {[
          { key: 'up', label: 'Up', Icon: ChevronUp },
          { key: 'down', label: 'Down', Icon: ChevronDown },
        ].map(({ key, label, Icon }) => (
          <Button
            key={key}
            variant="secondary"
            size="xl"
            className="select-none"
            onPointerDown={holdKey(key, true)}
            onPointerUp={holdKey(key, false)}
            onPointerCancel={holdKey(key, false)}
            onPointerLeave={holdKey(key, false)}
          >
            <Icon /> {label}
          </Button>
        ))}
      </div>
    </GameShell>
  )
}
