'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

/**
 * Scroll-driven rotation on one horizontal axis.
 *
 * Shared by Selected work and Career so the two read as the same mechanism
 * rather than two things that happen to turn. Scroll is a user action, so this
 * stays inside the rule that motion answers input.
 *
 * The markup is a list first and a drum second. `data-drum` is only set once
 * the faces have been measured, and never under prefers-reduced-motion or below
 * the breakpoint, so what remains is the plain list it started as.
 */

/** Share of each step spent parked on a face rather than turning. */
const DWELL = 0.32

/**
 * How far either side of the front face stays lit. Above 1 the neighbours are
 * visible as part of the wheel, which is the point of a drum: you can see what
 * you have just left and what is coming.
 */
const FALLOFF = 1.55

/**
 * Below this the drum is not worth the scroll cost and the flat list is better.
 * Phones are well above it: the tallest face measures 488px against a 780px
 * viewport, so a box fits with room to spare, and the skip button and arrows
 * are if anything more useful on touch than they are with a scroll wheel.
 */
const MIN_WIDTH = 360

/**
 * Scroll held at the last face before the section releases, as a fraction of
 * the viewport. Without it the drum reaches its final face and immediately
 * begins sliding away, so the last project or role is the one you never get to
 * read.
 */
const HOLD = 0.5

/** Ignore scroll jitter smaller than this when deciding which way we are going. */
const DIRECTION_THRESHOLD = 6

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** The height must land before paint or the section jumps under a mid-page reload. */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function useDrum(count: number) {
  const runwayRef = useRef<HTMLDivElement>(null)
  const drumRef = useRef<HTMLOListElement>(null)
  const [front, setFront] = useState(0)
  const [live, setLive] = useState(false)
  /** Which way the reader is going, so the skip button can point that way. */
  const [direction, setDirection] = useState<'down' | 'up'>('down')
  /** Set inside the effect; called from the arrows and the skip button. */
  const seekRef = useRef<(index: number, smooth: boolean) => void>(() => {})

  useBeforePaint(() => {
    const runway = runwayRef.current
    const drum = drumRef.current
    if (!runway || !drum || count < 2) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wide = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`)

    const items = Array.from(drum.children) as HTMLElement[]
    const step = 360 / count
    const halfStep = (step / 2) * (Math.PI / 180)
    let live = false
    let seated = -1
    let lastY = window.scrollY

    /** The runway carries the drum's travel plus the hold at the end. */
    function setHold() {
      runway!.style.setProperty('--hold', `${window.innerHeight * HOLD}px`)
    }

    /** Scroll distance that actually turns the drum, hold excluded. */
    function travelOf(height: number) {
      return height - window.innerHeight - window.innerHeight * HOLD
    }

    function measure() {
      // Heights are only truthful while the faces are still in flow, so drop
      // out of drum mode to read them and go straight back in.
      const wasOn = runway!.dataset.drum === 'on'
      if (wasOn) delete runway!.dataset.drum
      let height = 0
      for (const item of items) height = Math.max(height, item.getBoundingClientRect().height)
      if (wasOn) runway!.dataset.drum = 'on'
      if (!height) return
      drum!.style.setProperty('--face-h', `${height}px`)
      drum!.style.setProperty('--radius', `${height / 2 / Math.tan(halfStep)}px`)
    }

    /** Put a given face square to the reader. */
    seekRef.current = (index: number, smooth: boolean) => {
      if (!live) return
      const box = runway!.getBoundingClientRect()
      const travel = travelOf(box.height)
      if (travel <= 0) return
      const wanted = box.top + window.scrollY + clamp01(index / (count - 1)) * travel
      window.scrollTo({
        top: wanted,
        behavior: smooth && !reduced.matches ? 'smooth' : 'instant',
      })
    }

    function render() {
      if (!live) return
      const box = runway!.getBoundingClientRect()
      const travel = travelOf(box.height)
      const progress = travel > 0 ? clamp01(-box.top / travel) : 0

      // Linear scroll would strand the drum between two faces for half its
      // travel. Easing inside each step makes it dwell on a face and turn
      // briskly between them.
      const raw = progress * (count - 1)
      const seat = Math.min(Math.floor(raw), count - 2)
      const within = raw - seat
      const turned = seat + smoothstep(clamp01((within - DWELL) / (1 - DWELL * 2)))
      drum!.style.setProperty('--turn', `${-turned * step}deg`)

      for (let i = 0; i < items.length; i++) {
        const offset = Math.abs(i - turned)
        items[i].style.opacity = `${Math.max(0, 1 - offset / FALLOFF)}`
        // Only the face square to the reader takes focus. The neighbours are
        // visible but turned away, and focus must not land on them.
        items[i].toggleAttribute('inert', offset >= 0.5)
        // Only that face casts a shadow either. A tilted neighbour projects
        // its offset into a grey diagonal wedge, which reads as a glitch.
        items[i].toggleAttribute('data-front', offset < 0.5)
      }

      const nearest = Math.round(turned)
      if (nearest !== seated) {
        seated = nearest
        setFront(nearest)
      }
    }

    function reset() {
      for (const item of items) {
        item.style.opacity = ''
        item.removeAttribute('inert')
        item.removeAttribute('data-front')
      }
      delete runway!.dataset.drum
      drum!.style.removeProperty('--turn')
      drum!.style.removeProperty('--radius')
      drum!.style.removeProperty('--face-h')
      runway!.style.removeProperty('--hold')
    }

    /** The drum is only worth having on a wide screen with motion allowed. */
    function evaluate() {
      const wanted = wide.matches && !reduced.matches
      if (wanted === live) {
        if (live) {
          setHold()
          measure()
          render()
        }
        return
      }
      live = wanted
      setLive(wanted)
      if (live) {
        setHold()
        measure()
        runway!.dataset.drum = 'on'
        render()
      } else {
        reset()
        seated = -1
        setFront(0)
      }
    }

    let ticking = false
    function onScroll() {
      const y = window.scrollY
      if (Math.abs(y - lastY) > DIRECTION_THRESHOLD) {
        setDirection(y > lastY ? 'down' : 'up')
        lastY = y
      }
      if (ticking || !live) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        render()
      })
    }

    let resizeTimer = 0
    function onResize() {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(evaluate, 150)
    }

    evaluate()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    reduced.addEventListener('change', evaluate)
    wide.addEventListener('change', evaluate)

    return () => {
      window.clearTimeout(resizeTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      reduced.removeEventListener('change', evaluate)
      wide.removeEventListener('change', evaluate)
      reset()
    }
  }, [count])

  /** Step one face at a time. Smooth, because a single step is worth seeing. */
  const seek = useCallback((index: number) => {
    seekRef.current(Math.max(0, Math.min(index, count - 1)), true)
  }, [count])

  return { runwayRef, drumRef, front, live, direction, seek }
}
