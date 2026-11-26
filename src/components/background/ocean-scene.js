/**
 * OceanScene — a lightweight canvas simulation of an underwater scene.
 *
 *  - Fish swim in colour-coded schools (boids: separation / alignment / cohesion).
 *  - Plankton drift upwards and sway.
 *  - Jellyfish pulse their way through the water.
 *  - Large nebula "blobs" (DOM elements) slowly wander.
 *
 * Everything flees from the pointer, and clicking makes a splash that scatters
 * whatever is nearby. The scene is framework-agnostic: React only mounts the
 * canvas/blob elements and forwards theme + motion preferences.
 */

const TAU = Math.PI * 2
const SCHOOLS = 4
const FLEE_RADIUS = 150
const SPLASH_RADIUS = 280

const rand = (min, max) => min + Math.random() * (max - min)
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const rgba = ([r, g, b], a) => `rgba(${r}, ${g}, ${b}, ${a})`

const PALETTES = {
  dark: {
    fish: [
      [94, 234, 212],
      [125, 211, 252],
      [167, 139, 250],
      [240, 171, 252],
    ],
    jelly: [
      [196, 181, 253],
      [249, 168, 212],
      [103, 232, 249],
    ],
    plankton: [186, 230, 253],
    fishAlpha: [0.45, 0.92],
    planktonAlpha: 0.8,
    jellyAlpha: 1,
    glow: true,
    cursor: [125, 211, 252],
    cursorAlpha: 0.13,
    ripple: [186, 230, 253],
    blend: 'lighter',
  },
  light: {
    fish: [
      [13, 148, 136],
      [37, 99, 235],
      [124, 58, 237],
      [219, 39, 119],
    ],
    jelly: [
      [139, 92, 246],
      [236, 72, 153],
      [8, 145, 178],
    ],
    plankton: [30, 64, 175],
    fishAlpha: [0.28, 0.62],
    planktonAlpha: 0.32,
    jellyAlpha: 0.8,
    glow: false,
    cursor: [56, 189, 248],
    cursorAlpha: 0.14,
    ripple: [14, 116, 144],
    blend: 'source-over',
  },
}

const BLOB_LAYOUT = [
  { ax: 0.14, ay: 0.2, scale: 0.6, fx: 0.7, fy: 0.9, amp: 0.08 },
  { ax: 0.86, ay: 0.16, scale: 0.52, fx: 0.9, fy: 0.6, amp: 0.07 },
  { ax: 0.72, ay: 0.86, scale: 0.58, fx: 0.5, fy: 0.8, amp: 0.09 },
  { ax: 0.22, ay: 0.88, scale: 0.48, fx: 0.8, fy: 0.5, amp: 0.08 },
]

function createGlowSprite(color) {
  const size = 64
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const ctx = sprite.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, rgba(color, 0.85))
  gradient.addColorStop(0.3, rgba(color, 0.28))
  gradient.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return sprite
}

export class OceanScene {
  constructor(canvas, blobElements = [], { theme = 'dark', animated = true } = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.blobs = blobElements
      .filter(Boolean)
      .map((el, index) => ({ el, ...BLOB_LAYOUT[index % BLOB_LAYOUT.length], size: 0, ox: 0, oy: 0 }))

    this.pointer = { x: 0, y: 0, active: false, strength: 0 }
    this.fish = []
    this.plankton = []
    this.jellies = []
    this.ripples = []
    this.time = 0
    this.last = 0
    this.raf = 0
    this.running = false
    this.animated = animated
    this.w = 0
    this.h = 0

    this.tick = this.tick.bind(this)
    this.onResize = this.onResize.bind(this)
    this.onPointerMove = this.onPointerMove.bind(this)
    this.onPointerDown = this.onPointerDown.bind(this)
    this.onPointerUp = this.onPointerUp.bind(this)
    this.onPointerOut = this.onPointerOut.bind(this)
    this.onBlur = this.onBlur.bind(this)

    this.applyPalette(theme)
    this.resize()
    this.populate()

    window.addEventListener('resize', this.onResize)
    window.addEventListener('pointermove', this.onPointerMove, { passive: true })
    window.addEventListener('pointerdown', this.onPointerDown, { passive: true })
    window.addEventListener('pointerup', this.onPointerUp, { passive: true })
    window.addEventListener('pointercancel', this.onBlur, { passive: true })
    window.addEventListener('pointerout', this.onPointerOut, { passive: true })
    window.addEventListener('blur', this.onBlur)

    if (animated) this.start()
    else this.renderStill()
  }

  /* ---------------------------------------------------------------- */
  /* Public API                                                        */
  /* ---------------------------------------------------------------- */

  setTheme(theme) {
    this.applyPalette(theme)
    if (!this.running) this.renderStill()
  }

  setAnimated(animated) {
    this.animated = animated
    if (animated) {
      this.start()
    } else {
      this.stop()
      this.ripples = []
      this.pointer.strength = 0
      this.renderStill()
    }
  }

  start() {
    if (this.running) return
    this.running = true
    this.last = 0
    this.raf = requestAnimationFrame(this.tick)
  }

  stop() {
    this.running = false
    cancelAnimationFrame(this.raf)
  }

  destroy() {
    this.stop()
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('pointercancel', this.onBlur)
    window.removeEventListener('pointerout', this.onPointerOut)
    window.removeEventListener('blur', this.onBlur)
  }

  /** Scatter everything around (x, y) and draw a ripple. */
  splash(x, y) {
    this.ripples.push({ x, y, r: 0, life: 1 })
    if (this.ripples.length > 6) this.ripples.shift()

    const push = (entity, strength, panic) => {
      const dx = entity.x - x
      const dy = entity.y - y
      const d = Math.hypot(dx, dy)
      if (d > SPLASH_RADIUS || d < 0.01) return
      const k = (1 - d / SPLASH_RADIUS) ** 1.5 * strength
      entity.vx += (dx / d) * k
      entity.vy += (dy / d) * k
      if (panic) entity.panic = 1
    }

    for (const f of this.fish) push(f, 7, true)
    for (const p of this.plankton) push(p, 3.5, false)
    for (const j of this.jellies) push(j, 1.6, false)
  }

  /* ---------------------------------------------------------------- */
  /* Setup                                                             */
  /* ---------------------------------------------------------------- */

  applyPalette(theme) {
    this.palette = PALETTES[theme] ?? PALETTES.dark
    this.fishColors = this.palette.fish.map((c) => rgba(c, 1))
    this.fishSprites = this.palette.glow ? this.palette.fish.map(createGlowSprite) : []
    this.jellySprites = this.palette.glow ? this.palette.jelly.map(createGlowSprite) : []
  }

  resize() {
    const w = window.innerWidth
    const h = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    if (this.w && this.h) {
      const sx = w / this.w
      const sy = h / this.h
      for (const group of [this.fish, this.plankton, this.jellies]) {
        for (const e of group) {
          e.x *= sx
          e.y *= sy
        }
      }
    }

    this.w = w
    this.h = h
    this.dpr = dpr
    this.canvas.width = Math.round(w * dpr)
    this.canvas.height = Math.round(h * dpr)

    const longest = Math.max(w, h)
    for (const blob of this.blobs) {
      blob.size = blob.scale * longest
      blob.el.style.width = `${blob.size}px`
      blob.el.style.height = `${blob.size}px`
    }
  }

  populate() {
    const { w, h } = this
    const area = w * h
    const fishTarget = clamp(Math.round(area / 24000), 16, 72)
    const planktonTarget = clamp(Math.round(area / 8000), 40, 200)
    const jellyTarget = w < 640 ? 2 : w < 1200 ? 3 : 4

    const schoolSpawns = Array.from({ length: SCHOOLS }, () => ({
      x: rand(0.1, 0.9) * w,
      y: rand(0.1, 0.9) * h,
      angle: rand(0, TAU),
    }))

    while (this.fish.length < fishTarget) {
      const school = this.fish.length % SCHOOLS
      const spawn = schoolSpawns[school]
      const angle = spawn.angle + rand(-0.4, 0.4)
      const cruise = rand(0.8, 1.35)
      this.fish.push({
        x: spawn.x + rand(-90, 90),
        y: spawn.y + rand(-60, 60),
        vx: Math.cos(angle) * cruise,
        vy: Math.sin(angle) * cruise,
        school,
        size: rand(2.6, 5.2),
        depth: rand(0.5, 1),
        cruise,
        phase: rand(0, TAU),
        wander: rand(0, TAU),
        panic: 0,
      })
    }
    this.fish.length = fishTarget

    while (this.plankton.length < planktonTarget) {
      this.plankton.push({
        x: rand(0, w),
        y: rand(0, h),
        vx: 0,
        vy: 0,
        r: rand(0.5, 1.9),
        depth: rand(0.25, 1),
        drift: rand(0.05, 0.28),
        sway: rand(0, TAU),
        swaySpeed: rand(0.004, 0.012),
        twinkle: rand(0, TAU),
      })
    }
    this.plankton.length = planktonTarget

    while (this.jellies.length < jellyTarget) {
      const index = this.jellies.length
      this.jellies.push({
        x: rand(0.08, 0.92) * w,
        y: rand(0.25, 1) * h,
        vx: rand(-0.1, 0.1),
        vy: -0.2,
        size: rand(18, 32) * (w < 640 ? 0.8 : 1),
        color: index % 3,
        phase: rand(0, TAU),
        pulseSpeed: rand(0.018, 0.028),
        tilt: 0,
        depth: rand(0.65, 1),
        seed: rand(0, 100),
      })
    }
    this.jellies.length = jellyTarget
  }

  /* ---------------------------------------------------------------- */
  /* Events                                                            */
  /* ---------------------------------------------------------------- */

  onResize() {
    this.resize()
    this.populate()
    if (!this.running) this.renderStill()
  }

  onPointerMove(event) {
    this.pointer.x = event.clientX
    this.pointer.y = event.clientY
    this.pointer.active = true
  }

  onPointerDown(event) {
    this.pointer.x = event.clientX
    this.pointer.y = event.clientY
    this.pointer.active = true
    if (this.running) this.splash(event.clientX, event.clientY)
  }

  onPointerUp(event) {
    if (event.pointerType !== 'mouse') this.pointer.active = false
  }

  onPointerOut(event) {
    if (!event.relatedTarget) this.pointer.active = false
  }

  onBlur() {
    this.pointer.active = false
  }

  /* ---------------------------------------------------------------- */
  /* Simulation                                                        */
  /* ---------------------------------------------------------------- */

  tick(now) {
    if (!this.running) return
    this.raf = requestAnimationFrame(this.tick)
    const dt = this.last ? Math.min((now - this.last) / 16.667, 3) : 1
    this.last = now
    this.time += dt
    this.update(dt)
    this.draw()
  }

  update(dt) {
    const pointer = this.pointer
    pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * Math.min(1, 0.08 * dt)

    this.updateFish(dt)
    this.updatePlankton(dt)
    this.updateJellies(dt)
    this.updateBlobs(dt)

    for (const ripple of this.ripples) {
      ripple.r += 4.5 * dt
      ripple.life -= 0.018 * dt
    }
    this.ripples = this.ripples.filter((ripple) => ripple.life > 0)
  }

  updateFish(dt) {
    const fish = this.fish
    const count = fish.length
    const { x: px, y: py, strength } = this.pointer
    const neighbour = 64
    const neighbour2 = neighbour * neighbour
    const separation2 = 20 * 20
    const flee2 = FLEE_RADIUS * FLEE_RADIUS

    for (let i = 0; i < count; i += 1) {
      const f = fish[i]
      let ax = 0
      let ay = 0
      let alignX = 0
      let alignY = 0
      let cohX = 0
      let cohY = 0
      let sepX = 0
      let sepY = 0
      let n = 0

      for (let j = 0; j < count; j += 1) {
        if (i === j) continue
        const o = fish[j]
        const dx = o.x - f.x
        if (dx > neighbour || dx < -neighbour) continue
        const dy = o.y - f.y
        if (dy > neighbour || dy < -neighbour) continue
        const d2 = dx * dx + dy * dy
        if (d2 < separation2 && d2 > 0.0001) {
          sepX -= dx / d2
          sepY -= dy / d2
        }
        if (o.school === f.school && d2 < neighbour2) {
          alignX += o.vx
          alignY += o.vy
          cohX += dx
          cohY += dy
          n += 1
        }
      }

      if (n) {
        ax += (alignX / n - f.vx) * 0.045 + (cohX / n) * 0.0009
        ay += (alignY / n - f.vy) * 0.045 + (cohY / n) * 0.0009
      }
      ax += sepX * 0.9
      ay += sepY * 0.9

      // Gentle wandering plus a bias towards horizontal swimming.
      f.wander += (Math.random() - 0.5) * 0.3 * dt
      ax += Math.cos(f.wander) * 0.012
      ay += Math.sin(f.wander) * 0.012 - f.vy * 0.004

      if (strength > 0.01) {
        const dx = f.x - px
        const dy = f.y - py
        const d2 = dx * dx + dy * dy
        if (d2 < flee2) {
          const d = Math.sqrt(d2) || 1
          const k = 1 - d / FLEE_RADIUS
          const force = k * k * 1.4 * strength
          ax += (dx / d) * force
          ay += (dy / d) * force
          if (k > f.panic) f.panic = k
        }
      }

      f.vx += ax * dt
      f.vy += ay * dt

      const speed = Math.hypot(f.vx, f.vy)
      const target = f.cruise * (1 + f.panic * 2.2)
      const eased = speed + (target - speed) * Math.min(1, 0.04 * dt)
      const next = clamp(eased, 0.3, 1.8 + f.panic * 4.5)
      if (speed > 0.0001) {
        f.vx = (f.vx / speed) * next
        f.vy = (f.vy / speed) * next
      } else {
        f.vx = next
      }

      f.panic *= 0.965 ** dt
      f.x += f.vx * dt
      f.y += f.vy * dt
      f.phase += (0.15 + next * 0.14) * dt
      this.wrap(f, 40)
    }
  }

  updatePlankton(dt) {
    const { x: px, y: py, strength } = this.pointer
    const radius = 120
    const radius2 = radius * radius
    const relax = Math.min(1, 0.025 * dt)

    for (const p of this.plankton) {
      p.sway += p.swaySpeed * dt
      p.twinkle += 0.025 * dt
      const baseX = Math.sin(p.sway) * 0.18 * p.depth
      const baseY = -p.drift * p.depth

      if (strength > 0.01) {
        const dx = p.x - px
        const dy = p.y - py
        const d2 = dx * dx + dy * dy
        if (d2 < radius2) {
          const d = Math.sqrt(d2) || 1
          const k = 1 - d / radius
          const force = k * k * 1.2 * strength * dt
          p.vx += (dx / d) * force
          p.vy += (dy / d) * force
        }
      }

      p.vx += (baseX - p.vx) * relax
      p.vy += (baseY - p.vy) * relax
      p.x += p.vx * dt
      p.y += p.vy * dt
      this.wrap(p, 10)
    }
  }

  updateJellies(dt) {
    const { x: px, y: py, strength } = this.pointer
    const radius = 200
    const drag = 0.975 ** dt

    for (const j of this.jellies) {
      j.phase += j.pulseSpeed * dt
      const pulse = Math.max(0, Math.sin(j.phase))
      const thrust = pulse ** 3 * 0.045
      const heading = j.tilt - Math.PI / 2
      j.vx += Math.cos(heading) * thrust * dt
      j.vy += Math.sin(heading) * thrust * dt + 0.004 * dt

      if (strength > 0.01) {
        const dx = j.x - px
        const dy = j.y - py
        const d = Math.hypot(dx, dy)
        if (d < radius && d > 0.01) {
          const k = 1 - d / radius
          const force = k * k * 0.35 * strength * dt
          j.vx += (dx / d) * force
          j.vy += (dy / d) * force
        }
      }

      j.vx *= drag
      j.vy *= drag
      j.x += j.vx * dt
      j.y += j.vy * dt
      j.tilt += (clamp(j.vx * 0.9, -0.6, 0.6) - j.tilt) * Math.min(1, 0.03 * dt)

      const margin = j.size * 4
      if (j.y < -margin) {
        j.y = this.h + margin * 0.5
        j.x = rand(0.05, 0.95) * this.w
      } else if (j.y > this.h + margin) {
        j.y = -margin * 0.5
      }
      if (j.x < -margin) j.x = this.w + margin
      else if (j.x > this.w + margin) j.x = -margin
    }
  }

  updateBlobs(dt) {
    const { x: px, y: py, strength } = this.pointer
    const t = this.time * 0.004

    this.blobs.forEach((blob, index) => {
      const cx = (blob.ax + Math.sin(t * blob.fx + index * 1.7) * blob.amp) * this.w
      const cy = (blob.ay + Math.cos(t * blob.fy + index * 2.3) * blob.amp) * this.h
      let tx = 0
      let ty = 0

      if (strength > 0.01) {
        const dx = cx - px
        const dy = cy - py
        const d = Math.hypot(dx, dy)
        const reach = blob.size * 0.9
        if (d < reach && d > 0.01) {
          const k = 1 - d / reach
          tx = (dx / d) * k * 140 * strength
          ty = (dy / d) * k * 140 * strength
        }
      }

      const ease = Math.min(1, 0.03 * dt)
      blob.ox += (tx - blob.ox) * ease
      blob.oy += (ty - blob.oy) * ease
      blob.el.style.transform = `translate3d(${cx + blob.ox - blob.size / 2}px, ${cy + blob.oy - blob.size / 2}px, 0)`
    })
  }

  wrap(entity, margin) {
    if (entity.x < -margin) entity.x = this.w + margin
    else if (entity.x > this.w + margin) entity.x = -margin
    if (entity.y < -margin) entity.y = this.h + margin
    else if (entity.y > this.h + margin) entity.y = -margin
  }

  /* ---------------------------------------------------------------- */
  /* Rendering                                                         */
  /* ---------------------------------------------------------------- */

  renderStill() {
    this.updateBlobs(100)
    this.draw()
  }

  draw() {
    const { ctx, canvas, palette } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalCompositeOperation = palette.blend

    this.drawPlankton()
    this.drawJellies()
    this.drawFish()
    this.drawRipples()
    this.drawCursorLight()

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
  }

  drawPlankton() {
    const { ctx, dpr, palette } = this
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = rgba(palette.plankton, 1)
    for (const p of this.plankton) {
      ctx.globalAlpha = palette.planktonAlpha * (0.3 + 0.7 * p.depth) * (0.55 + 0.45 * Math.sin(p.twinkle))
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r * (0.6 + 0.4 * p.depth), 0, TAU)
      ctx.fill()
    }
  }

  drawFish() {
    const { ctx, dpr, palette } = this
    const [minAlpha, maxAlpha] = palette.fishAlpha

    for (const f of this.fish) {
      const speed = Math.hypot(f.vx, f.vy) || 1
      const cos = f.vx / speed
      const sin = f.vy / speed
      ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin, dpr * cos, dpr * f.x, dpr * f.y)

      const s = f.size * (0.6 + 0.4 * f.depth)
      const length = s * 4.2
      const width = s * 1.05
      const sway = Math.sin(f.phase) * width * 0.7

      if (palette.glow) {
        ctx.globalAlpha = 0.3 * f.depth + 0.25 * f.panic
        ctx.drawImage(this.fishSprites[f.school], -length * 0.9, -length * 0.9, length * 1.8, length * 1.8)
      }

      ctx.globalAlpha = minAlpha + (maxAlpha - minAlpha) * f.depth
      ctx.fillStyle = this.fishColors[f.school]

      ctx.beginPath()
      ctx.moveTo(length * 0.55, 0)
      ctx.bezierCurveTo(length * 0.35, -width * 1.1, -length * 0.2, -width * 0.9, -length * 0.38, sway * 0.35)
      ctx.bezierCurveTo(-length * 0.2, width * 0.9, length * 0.35, width * 1.1, length * 0.55, 0)
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(-length * 0.34, sway * 0.35)
      ctx.lineTo(-length * 0.74, sway - width * 0.95)
      ctx.quadraticCurveTo(-length * 0.6, sway, -length * 0.74, sway + width * 0.95)
      ctx.closePath()
      ctx.fill()
    }
  }

  drawJellies() {
    const { ctx, dpr, palette } = this
    const alphaScale = palette.jellyAlpha

    for (const j of this.jellies) {
      const color = palette.jelly[j.color]
      const pulse = Math.max(0, Math.sin(j.phase))
      const s = j.size * j.depth
      const rx = s * (1 - 0.14 * pulse)
      const ry = s * 0.78 * (1 + 0.1 * pulse)
      const length = s * 2.8 * (1 - 0.12 * pulse)
      const cos = Math.cos(j.tilt)
      const sin = Math.sin(j.tilt)
      ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin, dpr * cos, dpr * j.x, dpr * j.y)

      if (palette.glow) {
        ctx.globalAlpha = 0.4 * j.depth
        ctx.drawImage(this.jellySprites[j.color], -s * 2.6, -s * 2.4, s * 5.2, s * 5.2)
      }

      // Tentacles
      ctx.globalAlpha = 1
      const tentacleGradient = ctx.createLinearGradient(0, 0, 0, length)
      tentacleGradient.addColorStop(0, rgba(color, 0.55 * alphaScale))
      tentacleGradient.addColorStop(1, rgba(color, 0))
      ctx.strokeStyle = tentacleGradient
      ctx.lineCap = 'round'

      for (let k = 0; k < 6; k += 1) {
        const baseX = (k / 5 - 0.5) * rx * 1.6
        ctx.lineWidth = 1.1
        ctx.beginPath()
        ctx.moveTo(baseX, 0)
        for (let seg = 1; seg <= 10; seg += 1) {
          const u = seg / 10
          const x = baseX * (1 - u * 0.35) + Math.sin(this.time * 0.045 + k * 1.7 + u * 5 + j.seed) * u * s * 0.32
          ctx.lineTo(x, u * length)
        }
        ctx.stroke()
      }

      ctx.lineWidth = 2.4
      for (const side of [-1, 1]) {
        const baseX = side * rx * 0.15
        ctx.beginPath()
        ctx.moveTo(baseX, 0)
        for (let seg = 1; seg <= 8; seg += 1) {
          const u = seg / 8
          const x = baseX + Math.sin(this.time * 0.035 + side * 2 + u * 4 + j.seed) * u * s * 0.22
          ctx.lineTo(x, u * length * 0.62)
        }
        ctx.stroke()
      }

      // Bell
      const bellGradient = ctx.createRadialGradient(0, -ry * 0.45, s * 0.1, 0, -ry * 0.1, rx * 1.15)
      bellGradient.addColorStop(0, rgba(color, 0.7 * alphaScale))
      bellGradient.addColorStop(0.6, rgba(color, 0.32 * alphaScale))
      bellGradient.addColorStop(1, rgba(color, 0.12 * alphaScale))
      ctx.fillStyle = bellGradient
      ctx.beginPath()
      ctx.ellipse(0, 0, rx, ry, 0, Math.PI, TAU)
      const scallops = 7
      for (let q = 0; q < scallops; q += 1) {
        const x0 = rx - (2 * rx * q) / scallops
        const x1 = rx - (2 * rx * (q + 1)) / scallops
        ctx.quadraticCurveTo((x0 + x1) / 2, ry * 0.16, x1, 0)
      }
      ctx.closePath()
      ctx.fill()
      ctx.strokeStyle = rgba(color, 0.55 * alphaScale)
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
      ctx.beginPath()
      ctx.ellipse(-rx * 0.32, -ry * 0.55, rx * 0.24, ry * 0.13, -0.45, 0, TAU)
      ctx.fill()
    }
  }

  drawRipples() {
    const { ctx, dpr, palette } = this
    if (!this.ripples.length) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalAlpha = 1
    for (const ripple of this.ripples) {
      ctx.lineWidth = 1.5
      ctx.strokeStyle = rgba(palette.ripple, 0.55 * ripple.life)
      ctx.beginPath()
      ctx.arc(ripple.x, ripple.y, ripple.r, 0, TAU)
      ctx.stroke()
      ctx.lineWidth = 1
      ctx.strokeStyle = rgba(palette.ripple, 0.3 * ripple.life)
      ctx.beginPath()
      ctx.arc(ripple.x, ripple.y, ripple.r * 0.62, 0, TAU)
      ctx.stroke()
    }
  }

  drawCursorLight() {
    const { ctx, dpr, palette, pointer } = this
    if (pointer.strength < 0.01) return
    const radius = 220
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.globalAlpha = 1
    const gradient = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius)
    gradient.addColorStop(0, rgba(palette.cursor, palette.cursorAlpha * pointer.strength))
    gradient.addColorStop(1, rgba(palette.cursor, 0))
    ctx.fillStyle = gradient
    ctx.fillRect(pointer.x - radius, pointer.y - radius, radius * 2, radius * 2)
  }
}
