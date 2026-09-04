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
 * you have just left and what is coming. Raise it to make the next one more
 * tempting, but never to 2 or beyond, where the neighbour reads as a second
 * thing to read rather than a hint at one.
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

/**
 * Share of the screen a face may take and still be worth mounting on a drum.
 * A face taller than the viewport can never be read in one piece: it hangs off
 * both ends, and the rotation is computed from a radius nothing can contain.
 * Career roles on a narrow phone run past this, so they stay a flat list.
 */
const FITS = 0.93

/** Ignore scroll jitter smaller than this when deciding which way we are going. */
const DIRECTION_THRESHOLD = 6

/**
 * A mobile URL bar sliding in or out changes innerHeight by roughly 60 to
 * 100px and fires resize the whole time. Only a change bigger than this is a
 * real layout change worth re-measuring for.
 */
const REAL_RESIZE = 140

/**
 * True while a hash navigation is still travelling. Folding a runway during
 * one would move the destination out from under the browser.
 */
let navigating = false
let navigatingTimer = 0
if (typeof window !== 'undefined') {
  const hold = () => {
    navigating = true
    window.clearTimeout(navigatingTimer)
    navigatingTimer = window.setTimeout(() => {
      navigating = false
    }, 1400)
  }
  // A page opened at a hash scrolls to it without ever firing hashchange, and
  // folding a runway while that is happening moves the destination.
  if (window.location.hash) hold()
  window.addEventListener('hashchange', hold)
  document.addEventListener(
    'click',
    (event) => {
      const link = (event.target as HTMLElement | null)?.closest?.('a[href*="#"]')
      if (link) hold()
    },
    true,
  )
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const smoothstep = (t: number) => t * t * (3 - 2 * t)

/** The height must land before paint or the section jumps under a mid-page reload. */
const useBeforePaint = typeof window === 'undefined' ? useEffect : useLayoutEffect

type Options = {
  /** Overrides FALLOFF for this drum. */
  falloff?: number
  /** Milliseconds between automatic advances. 0 turns it off. */
  autoMs?: number
}

export function useDrum(count: number, { falloff = FALLOFF, autoMs = 0 }: Options = {}) {
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
    let collapsed = false
    /** Tallest face, measured flat. Decides whether a drum is viable at all. */
    let tallest = 0
    /** Which face a folded drum is showing. Scroll cannot drive it any more. */
    let manual = 0
    let heading: 'down' | 'up' = 'down'
    /** Last value written per face, so an unchanged frame writes nothing. */
    const painted: number[] = new Array(items.length).fill(-1)
    let lastY = window.scrollY
    let lastWidth = window.innerWidth
    let lastHeight = window.innerHeight

    /**
     * The exact value of 100svh, which is what the runway and the stage are
     * sized in. Reading innerHeight instead would drift by the height of the
     * URL bar and put the drum's arithmetic out of step with its own CSS.
     */
    let viewport = window.innerHeight
    function measureViewport() {
      const probe = document.createElement('div')
      probe.style.cssText =
        'position:absolute;top:0;left:0;width:0;height:100svh;visibility:hidden;pointer-events:none'
      document.body.appendChild(probe)
      const found = probe.getBoundingClientRect().height
      probe.remove()
      if (found > 0) viewport = found
    }

    /** The runway carries the drum's travel plus the hold at the end. */
    function setHold() {
      runway!.style.setProperty('--hold', `${viewport * HOLD}px`)
    }

    /** Scroll distance that actually turns the drum, hold excluded. */
    function travelOf(height: number) {
      return height - viewport - viewport * HOLD
    }

    function measure() {
      // Heights are only truthful while the faces are still in flow, so drop
      // out of drum mode to read them and go straight back in.
      const wasOn = runway!.dataset.drum === 'on'
      if (wasOn) delete runway!.dataset.drum
      let height = 0
      for (const item of items) height = Math.max(height, item.getBoundingClientRect().height)
      if (wasOn) runway!.dataset.drum = 'on'
      tallest = height
      if (!height) return
      drum!.style.setProperty('--face-h', `${height}px`)
      runway!.style.setProperty('--face-h', `${height}px`)
      drum!.style.setProperty('--radius', `${height / 2 / Math.tan(halfStep)}px`)
    }

    /**
     * Fold the runway away once it has been read.
     *
     * Going down, the wheel is worth its four screens of scrolling. Coming
     * back up, it is the same content again and the height is just a wall to
     * climb. So once the reader has passed the bottom of the runway it becomes
     * a single screen, and it goes back to full length if they return above
     * the top of it, so scrolling down a second time still turns the wheel.
     *
     * The height only ever changes while the runway is completely off screen,
     * and the scroll position is corrected in the same frame, so nothing the
     * reader is looking at moves.
     */
    function setCollapsed(next: boolean) {
      if (next === collapsed || !live) return
      // Folding on the way down would shorten the document underneath an
      // anchor scroll that is still running, and the browser would never
      // reach what it was aiming at. Going up is the only direction this
      // helps anyway.
      if (next && (heading !== 'up' || navigating)) return
      const box = runway!.getBoundingClientRect()
      const above = box.bottom <= 0
      const below = box.top >= window.innerHeight
      if (!above && !below) return

      // Scroll anchoring would also try to correct for this, and the two
      // corrections do not compose. Worse, it is not dependable: it fires when
      // one runway folds and does nothing when both fold in the same frame,
      // and then the scroll is simply clamped to the shorter document and the
      // reader is thrown thousands of pixels down. So it is switched off for
      // the duration of the change and the correction is made here, the same
      // way in every browser. Safari, which has no anchoring at all, gets the
      // same path as everything else.
      const root = document.documentElement
      const anchoring = root.style.overflowAnchor
      root.style.overflowAnchor = 'none'

      // Measure the whole document, not the runway's own edge. In Career the
      // runway shares a grid row with the sticky rail, which has a minimum
      // height of its own, so the runway's bottom can travel further than the
      // content below the section actually does. The document height is what
      // everything below the change genuinely follows.
      const anchorBefore = document.documentElement.scrollHeight
      // Captured before the change. Shrinking the document makes the browser
      // clamp the scroll to the new maximum, and taking the delta off the
      // already clamped value counts that clamp twice.
      const scrollBefore = window.scrollY
      collapsed = next
      if (next) {
        runway!.dataset.collapsed = 'true'
        // Folded means arriving from below, and the first face is the most
        // recent one, which is what someone coming back wants to see.
        manual = 0
      } else {
        delete runway!.dataset.collapsed
      }
      const anchorAfter = document.documentElement.scrollHeight

      // Shrinking something above the viewport pulls everything below it
      // upwards. Move the scroll by exactly that much and the view holds still.
      if (above && anchorAfter !== anchorBefore) {
        window.scrollTo({
          top: scrollBefore + (anchorAfter - anchorBefore),
          behavior: 'instant',
        })
      }

      // Restored a frame later, so anchoring cannot re-enter and adjust the
      // layout this change produced.
      requestAnimationFrame(() => {
        root.style.overflowAnchor = anchoring
      })
    }

    /** Put a given face square to the reader. */
    seekRef.current = (index: number, smooth: boolean) => {
      if (!live) return
      if (collapsed) {
        manual = index
        render()
        return
      }
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
      let turned: number
      if (collapsed) {
        turned = manual
      } else {
        const raw = progress * (count - 1)
        const seat = Math.min(Math.floor(raw), count - 2)
        const within = raw - seat
        turned = seat + smoothstep(clamp01((within - DWELL) / (1 - DWELL * 2)))
      }
      drum!.style.setProperty('--turn', `${-turned * step}deg`)

      for (let i = 0; i < items.length; i++) {
        const offset = Math.abs(i - turned)
        // Rounded, and only written when it actually changes. Assigning the
        // same opacity every frame still invalidates style, and on a phone
        // that is a recalculation per face per frame for no visible reason.
        const opacity = Math.round(Math.max(0, 1 - offset / falloff) * 100) / 100
        if (opacity !== painted[i]) {
          painted[i] = opacity
          items[i].style.opacity = `${opacity}`
        }
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
        // Restart the clock from wherever the drum has actually landed, so a
        // face is always given its full time however it got here.
        scheduleAuto()
      }
    }

    function reset() {
      painted.fill(-1)
      for (const item of items) {
        item.style.opacity = ''
        item.removeAttribute('inert')
        item.removeAttribute('data-front')
      }
      delete runway!.dataset.drum
      delete runway!.dataset.collapsed
      collapsed = false
      drum!.style.removeProperty('--turn')
      drum!.style.removeProperty('--radius')
      drum!.style.removeProperty('--face-h')
      runway!.style.removeProperty('--face-h')
      runway!.style.removeProperty('--hold')
    }

    /** The drum is only worth having on a wide screen with motion allowed. */
    function evaluate() {
      measureViewport()
      measure()
      const roomy = tallest > 0 && tallest <= viewport * FITS
      const wanted = wide.matches && !reduced.matches && roomy
      if (wanted === live) {
        if (live) {
          setHold()
          render()
        }
        return
      }
      live = wanted
      setLive(wanted)
      if (live) {
        setHold()
        runway!.dataset.drum = 'on'
        render()
      } else {
        reset()
        seated = -1
        setFront(0)
      }
    }

    /**
     * Turning on its own.
     *
     * It yields completely. Any wheel, touch, key or press stops it for good
     * rather than pausing it: someone who has taken hold of the wheel has said
     * what they want, and a carousel that starts up again behind them is worse
     * than one that never moved. It also holds while the pointer is resting on
     * the drum, while the tab is hidden, while the section is not properly on
     * screen, and it never starts under prefers-reduced-motion. It stops at the
     * last face rather than wrapping, so it can never carry anyone out of the
     * section they were reading.
     */
    let autoTimer = 0
    let autoStopped = false
    let inView = false
    let resting = false

    function canAuto() {
      return (
        autoMs > 0 &&
        live &&
        inView &&
        !autoStopped &&
        !resting &&
        !document.hidden &&
        !reduced.matches &&
        !collapsed &&
        seated < count - 1
      )
    }

    function scheduleAuto() {
      window.clearTimeout(autoTimer)
      autoTimer = 0
      if (!canAuto()) return
      autoTimer = window.setTimeout(() => {
        autoTimer = 0
        if (!canAuto()) return
        seekRef.current(seated + 1, true)
        scheduleAuto()
      }, autoMs)
    }

    function stopAuto() {
      autoStopped = true
      window.clearTimeout(autoTimer)
      autoTimer = 0
    }

    function onRest() {
      resting = true
      window.clearTimeout(autoTimer)
      autoTimer = 0
    }

    function onLeave() {
      resting = false
      scheduleAuto()
    }

    let ticking = false
    function onScroll() {
      const y = window.scrollY
      if (Math.abs(y - lastY) > DIRECTION_THRESHOLD) {
        heading = y > lastY ? 'down' : 'up'
        setDirection(heading)
        lastY = y
      }
      if (ticking || !live) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const box = runway!.getBoundingClientRect()
        if (box.bottom <= 0) setCollapsed(true)
        else if (box.top >= window.innerHeight) setCollapsed(false)
        render()
      })
    }

    let resizeTimer = 0
    function onResize() {
      // The URL bar sliding is not a resize worth reacting to. Re-measuring on
      // it would toggle data-drum off and on mid-scroll, forcing two reflows
      // and visibly jumping the wheel.
      const widthChanged = window.innerWidth !== lastWidth
      const heightChanged = Math.abs(window.innerHeight - lastHeight) > REAL_RESIZE
      if (!widthChanged && !heightChanged) return
      lastWidth = window.innerWidth
      lastHeight = window.innerHeight
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(evaluate, 150)
    }

    const stage = runway.querySelector('.drum-stage')
    const watcher =
      autoMs > 0 && stage
        ? new IntersectionObserver(
            (entries) => {
              inView = entries.some((entry) => entry.intersectionRatio > 0.85)
              scheduleAuto()
            },
            { threshold: [0, 0.85, 1] },
          )
        : null
    if (watcher && stage) watcher.observe(stage)

    const surrender = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const

    evaluate()
    scheduleAuto()
    for (const name of surrender) window.addEventListener(name, stopAuto, { passive: true })
    stage?.addEventListener('pointerenter', onRest)
    stage?.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', scheduleAuto)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    reduced.addEventListener('change', evaluate)
    wide.addEventListener('change', evaluate)

    return () => {
      window.clearTimeout(autoTimer)
      watcher?.disconnect()
      for (const name of surrender) window.removeEventListener(name, stopAuto)
      stage?.removeEventListener('pointerenter', onRest)
      stage?.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', scheduleAuto)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      reduced.removeEventListener('change', evaluate)
      wide.removeEventListener('change', evaluate)
      reset()
    }
  }, [count, falloff, autoMs])

  /** Step one face at a time. Smooth, because a single step is worth seeing. */
  const seek = useCallback(
    (index: number, smooth = true) => {
      seekRef.current(Math.max(0, Math.min(index, count - 1)), smooth)
    },
    [count],
  )

  return { runwayRef, drumRef, front, live, direction, seek }
}
