'use client'

import { useEffect, useState } from 'react'

import { scrollInset } from '@/lib/scroll'

/**
 * Landing on the right section when the page is opened at a hash.
 *
 * The browser resolves `#photography` against the page as it is on first
 * paint, and starts a smooth scroll to that position. Hydration then mounts
 * the two drums, whose runways are several screens tall each, and everything
 * below them moves down by a couple of thousand pixels. The animation carries
 * on to the position it worked out before that, which by then is somewhere in
 * the middle of Selected work, and stops there.
 *
 * So the target is resolved again once the drums have taken their height. The
 * jump is instant, which also cancels the stale animation still in flight.
 *
 * It re-asserts a few times because the browser's own scroll can land after
 * ours, and gives up the moment there is any real input: someone who has
 * already started scrolling has said where they want to be.
 *
 * The hash is read during render rather than in the effect. The navigation
 * keeps the address in step with the section being read, and its effect runs
 * first, so by the time this one runs the hash has already been cleared.
 */

/** Moments after mount to re-check, in milliseconds. */
const RETRIES = [0, 120, 400]

export function HashLanding() {
  const [target] = useState(() =>
    typeof window === 'undefined' ? '' : decodeURIComponent(window.location.hash.slice(1)),
  )

  useEffect(() => {
    const id = target
    if (!id) return

    let done = false
    const surrender = () => {
      done = true
    }
    // 'landing:taken' lets a section that knows better — Selected work
    // returning to a particular project — own the landing without this one
    // dragging it back to the top of the section.
    const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown', 'landing:taken'] as const
    for (const name of inputs) {
      window.addEventListener(name, surrender, { passive: true })
    }

    function land() {
      if (done) return
      const target = document.getElementById(id)
      if (!target) return
      const inset = scrollInset(target)
      const wanted = target.getBoundingClientRect().top + window.scrollY - inset
      if (Math.abs(wanted - window.scrollY) < 2) return
      window.scrollTo({ top: wanted, behavior: 'instant' })
    }

    const timers = RETRIES.map((delay) => window.setTimeout(land, delay))
    const frame = requestAnimationFrame(land)

    return () => {
      for (const timer of timers) window.clearTimeout(timer)
      cancelAnimationFrame(frame)
      for (const name of inputs) window.removeEventListener(name, surrender)
    }
  }, [target])

  return null
}
