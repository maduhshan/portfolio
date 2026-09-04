'use client'

import { useEffect, useRef } from 'react'

/**
 * Reading light over long prose.
 *
 * Blocks sit slightly back and come to full strength as they pass through the
 * reading band, continuously with the scroll rather than as a one-shot entrance.
 * Nothing moves: this is opacity only. Body copy is the one thing on the page
 * that is actually read, and shifting it while someone reads costs more than
 * the animation is worth.
 *
 * Under prefers-reduced-motion every block is simply left at full strength.
 */

/** Where in the viewport the reading band sits, as a fraction of its height. */
const BAND_CENTRE = 0.44

/** Half-height of the band, again as a fraction of the viewport. */
const BAND_REACH = 0.5

/** How far back an unread block sits. Small on purpose. */
const DROP = 0.42

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const smoothstep = (t: number) => t * t * (3 - 2 * t)

export function ReadingLight({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('p, li, h3'))
    if (blocks.length === 0) return

    let raf = 0

    function clear() {
      for (const block of blocks) block.style.opacity = ''
    }

    function render() {
      raf = 0
      const viewport = window.innerHeight
      const centre = viewport * BAND_CENTRE
      const reach = viewport * BAND_REACH
      for (const block of blocks) {
        const box = block.getBoundingClientRect()
        const distance = Math.abs(box.top + box.height / 2 - centre)
        // Full strength through the band, easing back outside it.
        const away = smoothstep(clamp01((distance - reach * 0.4) / (reach * 0.75)))
        block.style.opacity = `${1 - DROP * away}`
      }
    }

    function onScroll() {
      if (raf) return
      raf = requestAnimationFrame(render)
    }

    function evaluate() {
      if (reduced.matches) {
        if (raf) cancelAnimationFrame(raf)
        raf = 0
        clear()
        window.removeEventListener('scroll', onScroll)
        window.removeEventListener('resize', onScroll)
        return
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('resize', onScroll)
      render()
    }

    evaluate()
    reduced.addEventListener('change', evaluate)

    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      reduced.removeEventListener('change', evaluate)
      clear()
    }
  }, [])

  return (
    <div ref={ref} className={`reading-light ${className}`}>
      {children}
    </div>
  )
}
