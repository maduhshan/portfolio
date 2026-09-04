'use client'

import { usePathname } from 'next/navigation'

/**
 * The one route transition: the incoming page resolves from soft to sharp.
 * It is the site's own idiom — a focus pull applied to the whole frame —
 * rather than a fade and slide. Nothing moves.
 *
 * Under prefers-reduced-motion the animation is removed in CSS.
 */
export function PageResolve({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div key={pathname} className="page-resolve">
      {children}
    </div>
  )
}
