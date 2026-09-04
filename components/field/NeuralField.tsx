'use client'

import { useEffect, useRef } from 'react'

/**
 * A network behind the paper sections.
 *
 * Three layers, all monochrome:
 *
 *   base       every node and edge, drawn once, faint enough to read as paper
 *              texture rather than as a diagram competing with the type.
 *   lightning  a charge travelling a short chain of edges, every few seconds.
 *   pointer    the local weave brightens where the cursor is, on the same
 *              proximity grammar as the focus-pull cursor.
 *
 * The motif is not decoration. He builds event-driven systems, so nodes with
 * something travelling between them are a picture of the work.
 *
 * The base is rendered once to an offscreen canvas and blitted, so a frame is
 * one drawImage plus a few dozen short strokes. The loop only runs while a bolt
 * is alive or the pointer weave is fading, and never under reduced motion.
 */

const CELL = 66 // grid pitch in CSS pixels
const JITTER = 0.42 // how far a node may sit from its cell centre
const LINK = CELL * 1.65 // longest edge between two nodes
const MAX_NODES = 1400

const REACH = 200 // how far from the pointer the weave brightens
const FADE = 2.6 // pointer strength units per second

const BASE_NODE = 0.1
const BASE_EDGE = 0.05

const BOLT_MS = 780
const BOLT_STEPS = 5
const BOLT_GAP = [2200, 5200] // ms between bolts
const MAX_BOLTS = 2

type Bolt = {
  path: { x: number; y: number }[]
  lengths: number[]
  total: number
  born: number
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const smoothstep = (t: number) => t * t * (3 - 2 * t)

export function NeuralField() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const found = ref.current
    if (!found) return
    const canvas: HTMLCanvasElement = found

    // The one hard stop. Everything below assumes motion is welcome.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const context = canvas.getContext('2d', { alpha: true })
    if (!context) return
    const ctx = context

    const base = document.createElement('canvas')
    const baseContext = base.getContext('2d')
    if (!baseContext) return
    const baseCtx = baseContext

    const ink =
      getComputedStyle(document.documentElement).getPropertyValue('--color-ink').trim() || '#141715'

    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let nodes: { x: number; y: number }[] = []
    let neighbours: number[][] = []

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      for (const surface of [canvas, base]) {
        surface.width = Math.round(width * dpr)
        surface.height = Math.round(height * dpr)
      }
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

      cols = Math.ceil(width / CELL) + 1
      rows = Math.ceil(height / CELL) + 1

      const budget = Math.min(cols * rows, MAX_NODES)
      nodes = new Array(budget)
      for (let i = 0; i < budget; i++) {
        const cx = i % cols
        const cy = (i / cols) | 0
        // Deterministic hash, so the same cell always jitters the same way and
        // the field does not swim when the window is resized.
        const h1 = Math.sin(cx * 127.1 + cy * 311.7) * 43758.5453
        const h2 = Math.sin(cx * 269.5 + cy * 183.3) * 43758.5453
        nodes[i] = {
          x: (cx + 0.5 + (h1 - Math.floor(h1) - 0.5) * 2 * JITTER) * CELL,
          y: (cy + 0.5 + (h2 - Math.floor(h2) - 0.5) * 2 * JITTER) * CELL,
        }
      }

      // Adjacency from the grid rather than from every pair.
      const link2 = LINK * LINK
      neighbours = nodes.map(() => [] as number[])
      for (let i = 0; i < nodes.length; i++) {
        const cx = i % cols
        const cy = (i / cols) | 0
        for (let dy = 0; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dy === 0 && dx <= 0) continue
            const nx = cx + dx
            const ny = cy + dy
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue
            const j = ny * cols + nx
            const other = nodes[j]
            if (!other) continue
            const ddx = other.x - nodes[i].x
            const ddy = other.y - nodes[i].y
            if (ddx * ddx + ddy * ddy > link2) continue
            neighbours[i].push(j)
            neighbours[j].push(i)
          }
        }
      }

      drawBase()
    }

    function drawBase() {
      baseCtx.clearRect(0, 0, width, height)
      baseCtx.strokeStyle = ink
      baseCtx.lineWidth = 1
      baseCtx.globalAlpha = BASE_EDGE
      baseCtx.beginPath()
      for (let i = 0; i < nodes.length; i++) {
        for (const j of neighbours[i]) {
          if (j < i) continue
          baseCtx.moveTo(nodes[i].x, nodes[i].y)
          baseCtx.lineTo(nodes[j].x, nodes[j].y)
        }
      }
      baseCtx.stroke()

      baseCtx.globalAlpha = BASE_NODE
      baseCtx.fillStyle = ink
      for (const node of nodes) {
        baseCtx.beginPath()
        baseCtx.arc(node.x, node.y, 1.2, 0, Math.PI * 2)
        baseCtx.fill()
      }
      baseCtx.globalAlpha = 1
    }

    function paintBase() {
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(base, 0, 0, width, height)
    }

    // ── state ──────────────────────────────────────────────────────────────
    let pointerX = -9999
    let pointerY = -9999
    let strength = 0
    let target = 0
    let bolts: Bolt[] = []
    let raf = 0
    let last = 0
    let spawnTimer = 0

    function schedule() {
      window.clearTimeout(spawnTimer)
      const wait = BOLT_GAP[0] + Math.random() * (BOLT_GAP[1] - BOLT_GAP[0])
      spawnTimer = window.setTimeout(spawn, wait)
    }

    function spawn() {
      if (document.hidden || nodes.length === 0) {
        schedule()
        return
      }
      if (bolts.length < MAX_BOLTS) {
        const start = (Math.random() * nodes.length) | 0
        const seen = new Set<number>([start])
        const path = [nodes[start]]
        let at = start
        for (let step = 0; step < BOLT_STEPS; step++) {
          const options = neighbours[at].filter((n) => !seen.has(n))
          if (options.length === 0) break
          at = options[(Math.random() * options.length) | 0]
          seen.add(at)
          path.push(nodes[at])
        }
        if (path.length > 2) {
          const lengths: number[] = []
          let total = 0
          for (let i = 1; i < path.length; i++) {
            const d = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y)
            lengths.push(d)
            total += d
          }
          bolts.push({ path, lengths, total, born: performance.now() })
          run()
        }
      }
      schedule()
    }

    /** The charge: a short bright arc travelling the chain, then gone. */
    function drawBolt(bolt: Bolt, now: number) {
      const t = (now - bolt.born) / BOLT_MS
      if (t >= 1) return false
      const head = smoothstep(clamp01(t)) * bolt.total
      const tail = Math.max(0, head - bolt.total * 0.42)
      const life = Math.min(1, t * 5) * (1 - clamp01((t - 0.66) / 0.34))

      ctx.lineWidth = 1.15
      ctx.strokeStyle = ink
      ctx.lineCap = 'round'

      let travelled = 0
      for (let i = 0; i < bolt.lengths.length; i++) {
        const segStart = travelled
        const segEnd = travelled + bolt.lengths[i]
        travelled = segEnd
        if (segEnd < tail || segStart > head) continue
        const from = Math.max(tail, segStart)
        const to = Math.min(head, segEnd)
        const a = bolt.path[i]
        const b = bolt.path[i + 1]
        const f0 = (from - segStart) / bolt.lengths[i]
        const f1 = (to - segStart) / bolt.lengths[i]
        const nearHead = clamp01((to - tail) / Math.max(head - tail, 1))
        ctx.globalAlpha = life * (0.12 + 0.5 * nearHead * nearHead)
        ctx.beginPath()
        ctx.moveTo(a.x + (b.x - a.x) * f0, a.y + (b.y - a.y) * f0)
        ctx.lineTo(a.x + (b.x - a.x) * f1, a.y + (b.y - a.y) * f1)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      return true
    }

    /** The pointer weave: the same nodes, brighter, near the cursor. */
    function drawPointer() {
      const reach = REACH * strength
      const reach2 = reach * reach
      const link2 = LINK * LINK
      const c0 = Math.max(0, Math.floor((pointerX - reach) / CELL) - 1)
      const c1 = Math.min(cols - 1, Math.ceil((pointerX + reach) / CELL) + 1)
      const r0 = Math.max(0, Math.floor((pointerY - reach) / CELL) - 1)
      const r1 = Math.min(rows - 1, Math.ceil((pointerY + reach) / CELL) + 1)

      const near: { x: number; y: number; f: number }[] = []
      for (let cy = r0; cy <= r1; cy++) {
        for (let cx = c0; cx <= c1; cx++) {
          const node = nodes[cy * cols + cx]
          if (!node) continue
          const dx = node.x - pointerX
          const dy = node.y - pointerY
          const d2 = dx * dx + dy * dy
          if (d2 > reach2) continue
          near.push({
            x: node.x,
            y: node.y,
            f: smoothstep(1 - Math.sqrt(d2) / reach),
          })
        }
      }

      ctx.lineWidth = 1
      ctx.strokeStyle = ink
      for (let i = 0; i < near.length; i++) {
        const a = near[i]
        for (let j = i + 1; j < near.length; j++) {
          const b = near[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 > link2) continue
          const alpha = a.f * b.f * (1 - Math.sqrt(d2) / LINK) * 0.3 * strength
          if (alpha < 0.004) continue
          ctx.globalAlpha = alpha
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }

      ctx.fillStyle = ink
      for (const node of near) {
        const alpha = node.f * 0.44 * strength
        if (alpha < 0.004) continue
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.arc(node.x, node.y, 1.35, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    function frame(now: number) {
      raf = 0
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016
      last = now

      if (strength < target) strength = Math.min(target, strength + FADE * dt)
      else if (strength > target) strength = Math.max(target, strength - FADE * dt)

      paintBase()
      bolts = bolts.filter((bolt) => drawBolt(bolt, now))
      if (strength > 0.002) drawPointer()

      // Idle out when nothing is moving. The base stays on screen.
      if (bolts.length > 0 || strength > 0.002 || target > 0) run()
      else last = 0
    }

    function run() {
      if (!raf) raf = requestAnimationFrame(frame)
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return
      pointerX = event.clientX
      pointerY = event.clientY
      target = 1
      run()
    }

    function onPointerLeave() {
      target = 0
      run()
    }

    function onVisibility() {
      if (document.hidden) {
        window.clearTimeout(spawnTimer)
        bolts = []
        target = 0
        strength = 0
        if (raf) cancelAnimationFrame(raf)
        raf = 0
        last = 0
        paintBase()
      } else {
        schedule()
      }
    }

    let resizeTimer = 0
    let lastWidth = window.innerWidth
    let lastHeight = window.innerHeight
    function onResize() {
      // Rebuilding means re-deriving every node and its adjacency. A mobile
      // URL bar sliding fires resize continuously through a scroll, and doing
      // that work each time is most of what makes the page feel stuck.
      const widthChanged = window.innerWidth !== lastWidth
      const heightChanged = Math.abs(window.innerHeight - lastHeight) > 140
      if (!widthChanged && !heightChanged) return
      lastWidth = window.innerWidth
      lastHeight = window.innerHeight
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        bolts = []
        build()
        paintBase()
      }, 150)
    }

    build()
    paintBase()
    schedule()

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', onResize)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.clearTimeout(spawnTimer)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} className="neural-field" aria-hidden="true" />
}
