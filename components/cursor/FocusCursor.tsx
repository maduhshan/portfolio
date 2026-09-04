'use client'

import { useEffect } from 'react'

/**
 * The focus-pull cursor.
 *
 * A camera does one thing when you turn the barrel: what you point at resolves,
 * and what you do not stays soft. That is applied here to exactly one class of
 * object — photographs, marked `data-focus-target`. Text and UI are never
 * blurred, so this reads as a lens rather than as a hover effect.
 *
 * Nothing here touches React state. One rAF loop reads a single pointer
 * position and writes `filter` and `transform` straight to element styles.
 *
 * It does not mount at all under prefers-reduced-motion or on a coarse pointer,
 * and because the blur is only ever applied at runtime, visitors without it
 * (including no-JS) get sharp photographs rather than permanently soft ones.
 */

/** Fully sharp inside this distance from the reticle, in px. */
const NEAR = 120
/** Fully soft beyond this distance. */
const FAR = 520
/** Soft enough to read as out of focus, never so soft it looks broken. */
const MAX_BLUR = 2.4
/**
 * Blur filters over large images are expensive, so the number that can be soft
 * at once is capped. Eight covers everything on screen in the common case,
 * which is what makes the effect read as a lens rather than as a few images
 * behaving oddly; the frame-time governor below steps it down when it has to.
 */
const MAX_ACTIVE = 8
/** Sustained frames slower than this drop the cap, then disable the effect. */
const SLOW_FRAME_MS = 24

/** How quickly the reticle catches up, in radians per second. */
const OMEGA = 26

/**
 * One step of a critically damped spring, solved implicitly so it cannot blow
 * up however long the frame took.
 */
function spring(position: number, velocity: number, target: number, dt: number): [number, number] {
  const f = 1 + 2 * dt * OMEGA
  const oo = OMEGA * OMEGA
  const hoo = dt * oo
  const hhoo = dt * hoo
  const detInv = 1 / (f + hhoo)
  return [
    (f * position + dt * velocity + hhoo * target) * detInv,
    (velocity + hoo * (target - position)) * detInv,
  ]
}

const smoothstep = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

export function FocusCursor() {
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return

    const root = document.documentElement
    const reticle = document.createElement('div')
    reticle.className = 'reticle'
    reticle.setAttribute('aria-hidden', 'true')
    reticle.innerHTML =
      '<span class="reticle__ring"></span>' +
      ['tl', 'tr', 'bl', 'br'].map((c) => `<span class="reticle__tick reticle__tick--${c}"></span>`).join('')
    document.body.appendChild(reticle)

    root.dataset.cursor = 'reticle'

    // ── target bookkeeping ────────────────────────────────────────────────
    type Target = { el: HTMLElement; visible: boolean; active: boolean }
    let targets: Target[] = []
    const byEl = new Map<Element, Target>()

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = byEl.get(entry.target)
          if (target) target.visible = entry.isIntersecting
        }
      },
      { rootMargin: '15%' },
    )

    const clear = (target: Target) => {
      target.el.style.filter = ''
      target.el.style.willChange = ''
      target.active = false
    }

    const collect = () => {
      const found = Array.from(
        document.querySelectorAll<HTMLElement>('[data-focus-target]'),
      )
      for (const target of targets) {
        if (!found.includes(target.el)) {
          io.unobserve(target.el)
          byEl.delete(target.el)
          clear(target)
        }
      }
      targets = found.map((el) => {
        const existing = byEl.get(el)
        if (existing) return existing
        const target: Target = { el, visible: false, active: false }
        byEl.set(el, target)
        io.observe(el)
        return target
      })
    }
    collect()

    /**
     * A modal <dialog> paints in the top layer, above everything on the page
     * whatever its z-index. The reticle has to move in there with it or it
     * simply disappears behind the menu, which with cursor:none set leaves the
     * overlay with no pointer at all.
     */
    const relocate = () => {
      const openDialog = document.querySelector<HTMLElement>('dialog[open]')
      const host: HTMLElement = openDialog ?? document.body
      if (reticle.parentElement !== host) host.appendChild(reticle)
    }
    const dialogObserver = new MutationObserver(relocate)
    dialogObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['open'],
      subtree: true,
    })

    let collectQueued = 0
    const mo = new MutationObserver(() => {
      window.clearTimeout(collectQueued)
      collectQueued = window.setTimeout(collect, 120)
    })
    mo.observe(document.body, { childList: true, subtree: true })

    // ── pointer + spring ──────────────────────────────────────────────────
    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2
    let x = pointerX
    let y = pointerY
    let vx = 0
    let vy = 0
    let seen = false
    let cap = MAX_ACTIVE
    let slowFrames = 0
    let raf = 0
    let last = performance.now()

    const onMove = (event: PointerEvent) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (!seen) {
        seen = true
        x = pointerX
        y = pointerY
      }
      reticle.dataset.visible = 'true'
    }
    const onLeave = () => {
      reticle.dataset.visible = 'false'
      for (const target of targets) if (target.active) clear(target)
    }
    const onEnter = () => {
      if (seen) reticle.dataset.visible = 'true'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('pointerenter', onEnter)

    /**
     * The reticle locks onto anything you can act on, not only photographs.
     * That is what stops it being decoration on a page that happens to have no
     * images: it is always confirming a target. Tracked from pointerover rather
     * than a hit test per frame, so it costs nothing.
     */
    const INTERACTIVE = 'a, button, [role="button"], summary, input, select, textarea, label'
    let overInteractive = false
    const onOver = (event: Event) => {
      const el = event.target as HTMLElement | null
      overInteractive = Boolean(el?.closest?.(INTERACTIVE))
    }
    document.addEventListener('pointerover', onOver, { passive: true })

    // Keyboard users get the same signal: the reticle brackets the focused
    // photograph. (The sharp state itself is handled in CSS by :focus-visible.)
    const onFocusIn = (event: FocusEvent) => {
      const el = event.target as HTMLElement | null
      const frame = el?.closest?.('[data-focus-target]') as HTMLElement | null
      if (!frame) return
      const rect = frame.getBoundingClientRect()
      pointerX = rect.left + rect.width / 2
      pointerY = rect.top + rect.height / 2
      seen = true
      reticle.dataset.visible = 'true'
    }
    document.addEventListener('focusin', onFocusIn)

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      const frameMs = now - last
      last = now

      // Critically damped spring, solved implicitly. A raw listener feels
      // mechanical; a focus motor lags your hand, and so does this.
      //
      // It is written this way because the explicit form is not stable: at this
      // stiffness a single frame over ~20ms makes it diverge, and the reticle
      // is flung off screen and never comes back. With cursor:none set, that
      // leaves the page with no pointer at all. This form is unconditionally
      // stable for any timestep.
      ;[x, vx] = spring(x, vx, pointerX, dt)
      ;[y, vy] = spring(y, vy, pointerY, dt)

      // Belt and braces: if anything ever throws the reticle out of the
      // viewport, put it back on the pointer rather than losing it.
      if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x - pointerX) > 4000 || Math.abs(y - pointerY) > 4000) {
        x = pointerX
        y = pointerY
        vx = 0
        vy = 0
      }

      reticle.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`

      // Nothing is soft until the pointer has actually moved. Focus answers an
      // action; it does not greet you with a page of out-of-focus photographs.
      let nearest = Infinity

      if (cap > 0 && seen) {
        // Read every rect first, then write every filter. Never interleave.
        const visible = targets.filter((target) => target.visible)
        const measured = visible.map((target) => {
          const rect = target.el.getBoundingClientRect()
          const dx = Math.max(rect.left - x, 0, x - rect.right)
          const dy = Math.max(rect.top - y, 0, y - rect.bottom)
          return { target, distance: Math.hypot(dx, dy) }
        })
        measured.sort((a, b) => a.distance - b.distance)

        const near = measured.slice(0, cap)
        nearest = near[0]?.distance ?? Infinity

        for (let i = 0; i < measured.length; i += 1) {
          const { target, distance } = measured[i]
          if (i < cap) {
            const blur = MAX_BLUR * smoothstep(clamp01((distance - NEAR) / (FAR - NEAR)))
            target.el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : ''
            target.el.style.willChange = 'filter'
            target.active = true
          } else if (target.active) {
            clear(target)
          }
        }
      }

      reticle.dataset.lock = nearest < NEAR || overInteractive ? 'true' : 'false'

      // Self-governing: a signature interaction that drops frames is worse than
      // no signature interaction.
      if (frameMs > SLOW_FRAME_MS) {
        slowFrames += 1
        if (slowFrames > 40) {
          slowFrames = 0
          cap = cap > 4 ? 4 : cap > 2 ? 2 : 0
          if (cap === 0) {
            for (const target of targets) clear(target)
            reticle.dataset.lock = 'false'
          }
        }
      } else if (slowFrames > 0) {
        slowFrames -= 1
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    // If the visitor turns reduced motion on mid-session, stand down.
    const onPreferenceChange = () => {
      if (reduced.matches || !fine.matches) teardown()
    }
    reduced.addEventListener('change', onPreferenceChange)
    fine.addEventListener('change', onPreferenceChange)

    let torn = false
    function teardown() {
      if (torn) return
      torn = true
      cancelAnimationFrame(raf)
      window.clearTimeout(collectQueued)
      mo.disconnect()
      dialogObserver.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('pointerenter', onEnter)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('pointerover', onOver)
      reduced.removeEventListener('change', onPreferenceChange)
      fine.removeEventListener('change', onPreferenceChange)
      for (const target of targets) clear(target)
      reticle.remove()
      delete root.dataset.cursor
    }

    return teardown
  }, [])

  return null
}
