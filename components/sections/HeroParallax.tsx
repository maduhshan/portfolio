'use client'

import { useEffect, useRef } from 'react'

/**
 * Cursor-driven parallax for the hero, three layers, ±10px at most. Children
 * opt in with data-depth (0 to 1). Nothing moves until the pointer does, and
 * nothing moves at all under reduced motion or on touch.
 */
const MAX_OFFSET = 10

export function HeroParallax({
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
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-depth]'))
    if (layers.length === 0) return

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let raf = 0

    const onMove = (event: PointerEvent) => {
      const { innerWidth, innerHeight } = window
      targetX = (event.clientX / innerWidth - 0.5) * 2
      targetY = (event.clientY / innerHeight - 0.5) * 2
    }

    const tick = () => {
      currentX += (targetX - currentX) * 0.08
      currentY += (targetY - currentY) * 0.08
      for (const layer of layers) {
        const depth = Number(layer.dataset.depth ?? 0)
        const x = (-currentX * MAX_OFFSET * depth).toFixed(2)
        const y = (-currentY * MAX_OFFSET * depth).toFixed(2)
        layer.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
      for (const layer of layers) layer.style.transform = ''
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
