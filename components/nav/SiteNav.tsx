'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { marks } from '@/components/icons'
import type { ExternalLink } from '@/lib/links'

import { navItems } from './navItems'

const RADIUS = 96
const PULL = 0.22
const MAX_OFFSET = 7

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max)

export function SiteNav({
  name,
  availability,
  socials = [],
  omit = [],
}: {
  name: string
  /** Already resolved: undefined means do not show an indicator at all. */
  availability?: string
  socials?: ExternalLink[]
  /** Sections that are not on the page, so the menu does not link into thin air. */
  omit?: string[]
}) {
  const listed = navItems.filter((item) => !omit.includes(item.id))
  const pathname = usePathname()
  const [active, setActive] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  // Past the first screen the links fold away into a single control, so the
  // bar stops competing with whatever you scrolled down to read.
  const [folded, setFolded] = useState(false)
  /** Whether the reader opened the page on a hash, read before any effect. */
  const arrivedOnHash = useRef(typeof window !== 'undefined' && Boolean(window.location.hash))
  /** Set once the page has genuinely moved away from the top. */
  const hasLeftTheTop = useRef(false)
  const headerRef = useRef<HTMLElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Active item follows scroll position on the home page, and the route
  // elsewhere.
  useEffect(() => {
    if (pathname !== '/') {
      setActive(
        pathname.startsWith('/photography')
          ? 'photography'
          : pathname.startsWith('/work')
            ? 'work'
            : null,
      )
      return
    }

    const sections = listed
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null)
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [pathname])

  // The address follows what you are reading, so a section can be linked to
  // and a reload comes back to the same place. replaceState rather than a hash
  // assignment: assigning would scroll the page, and every section passed
  // would be another entry in the back button.
  useEffect(() => {
    if (pathname !== '/') return
    const sync = () => {
      if (window.scrollY > 400) hasLeftTheTop.current = true
      const nearTop = window.scrollY < 320

      // A page opened at #photography sits at the top for a moment while the
      // browser scrolls down to it, firing scroll events the whole way.
      // Clearing then would throw away the address before anything had gone
      // anywhere. Once the page has actually been down the page, a return to
      // the top is a real one.
      if (nearTop && arrivedOnHash.current && !hasLeftTheTop.current) return

      // The hero is not a numbered section, so up there the address is just
      // the page. Below it, it names what is being read. In between — scrolled
      // down with no section resolved yet — say nothing rather than clearing.
      const wanted = nearTop ? '' : active ? `#${active}` : null
      if (wanted === null || wanted === window.location.hash) return
      // Built from the full path. A bare '#work' is resolved against the
      // current address and would drop any query string with it, which is how
      // the project a case study links back to went missing.
      const base = window.location.pathname + window.location.search
      window.history.replaceState(null, '', base + wanted)
    }
    // Also run on an active change, not only on scroll: after landing on a
    // section the observer resolves it with no further scrolling, and the
    // address would otherwise never catch up.
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [active, pathname])

  // The bar floats over sections on both grounds, so it takes the ground of
  // whatever is underneath it rather than painting a bar of its own.
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    let raf = 0

    const sync = () => {
      raf = 0
      setFolded(window.scrollY > 140)
      const x = Math.round(window.innerWidth / 2)
      const beneath = document.elementsFromPoint(x, 30).find((element) => !header.contains(element))
      const ground = beneath?.closest('[data-ground]')?.getAttribute('data-ground')
      header.dataset.ground = ground === 'hide' ? 'hide' : 'paper'
    }
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(sync)
    }

    sync()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  // Magnetic hover: items lean toward the cursor inside a small radius.
  useEffect(() => {
    const header = headerRef.current
    if (!header) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const links = () => Array.from(header.querySelectorAll<HTMLElement>('[data-magnetic]'))

    const onMove = (event: PointerEvent) => {
      for (const link of links()) {
        const rect = link.getBoundingClientRect()
        const dx = event.clientX - (rect.left + rect.width / 2)
        const dy = event.clientY - (rect.top + rect.height / 2)
        const distance = Math.hypot(dx, dy)
        if (distance < RADIUS) {
          const strength = (1 - distance / RADIUS) * PULL
          link.style.transform = `translate(${clamp(dx * strength, -MAX_OFFSET, MAX_OFFSET).toFixed(2)}px, ${clamp(dy * strength, -MAX_OFFSET, MAX_OFFSET).toFixed(2)}px)`
        } else if (link.style.transform) {
          link.style.transform = ''
        }
      }
    }
    const onLeave = () => {
      for (const link of links()) link.style.transform = ''
    }

    header.addEventListener('pointermove', onMove, { passive: true })
    header.addEventListener('pointerleave', onLeave)
    return () => {
      header.removeEventListener('pointermove', onMove)
      header.removeEventListener('pointerleave', onLeave)
      onLeave()
    }
  }, [])

  // Native <dialog> gives the focus trap and Escape handling for free; the
  // scroll lock is the only part it does not cover.
  const closeMenu = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  // No scroll lock. This is a small panel in the corner, not a screen over the
  // page, so the page behind it should still move.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      if (!dialog.open) dialog.showModal()
    } else if (dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  return (
    <header ref={headerRef} data-ground="paper" className="fixed inset-x-0 top-0 z-50">
      <div className="shell flex items-center justify-between py-4">
        {/* A nameplate, not a status badge: one chip, a hairline, and the
            availability set at label size beside the name. */}
        {/* Nothing in here wraps. A name broken across two lines is wrong at any
            width, and the availability line reads as two stray words when it
            folds. There is room for all of it beside a six-item bar; the flex
            row simply had to be told to hold its size rather than fold text. */}
        <div className="bg-ground flex items-center gap-3 px-2 py-1 whitespace-nowrap">
          <Link href="/#top" data-magnetic className="meta text-fg nav-item">
            {name}
            <span className="sr-only"> — home</span>
          </Link>
          {/* Shown only where it fits. The shell caps at 1312px, and the
              availability line beside a six-item bar clears that from about
              1320 up; below it the bar gets pushed off the right edge. */}
          {availability ? (
            <>
              <span aria-hidden className="bg-rule-strong hidden h-3 w-px min-[1360px]:block" />
              <span className="label hidden items-center gap-1.5 min-[1360px]:flex">
                <span aria-hidden className="rounded-dot size-[5px] bg-current" />
                {availability}
              </span>
            </>
          ) : null}

          {socials.length > 0 ? (
            <>
              <span aria-hidden className="bg-rule-strong h-3 w-px" />
              {/* Named, and set in the same mono at the same ink as the name
                  beside them. Not a faded row of afterthoughts. */}
              <ul className="flex items-center gap-4 md:gap-5">
                {socials.map((link) => {
                  const Mark = marks[link.mark]
                  return (
                    <li key={link.href} className="flex">
                      <a
                        className="nav-item meta text-fg flex items-center gap-0 xl:gap-2"
                        href={link.href}
                        target="_blank"
                        rel="me noopener noreferrer"
                      >
                        <Mark />
                        {/* Named from 1280 up, where the bar has room. Below
                            that the mark carries it and the name stays in the
                            accessibility tree. */}
                        <span className="sr-only xl:not-sr-only">{link.label}</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : null}
        </div>

        <nav
          aria-label="Sections"
          className="nav-links hidden lg:block"
          data-folded={folded ? 'true' : undefined}
        >
          <ul className="bg-ground flex items-center gap-6 px-3 py-1.5">
            {listed
              .filter((item) => item.inBar !== false)
              .map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    data-magnetic
                    className="nav-item meta"
                    data-active={active === item.id ? 'true' : undefined}
                    aria-current={active === item.id ? 'true' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        <button
          type="button"
          className="nav-toggle nav-item text-fg bg-ground items-center px-2.5 py-2.5"
          data-folded={folded ? 'true' : undefined}
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <MenuGlyph open={open} />
          <span className="sr-only">Open menu</span>
        </button>
      </div>

      {/* A small panel in the corner, not a screen. The page stays visible
          through it and simply goes out of focus, and a click anywhere outside
          closes it. Still a modal <dialog>, so Escape and the focus trap come
          for free. */}
      <dialog
        ref={dialogRef}
        className="nav-dialog"
        aria-label="Site navigation"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeMenu()
        }}
      >
        <nav data-ground="paper" aria-label="Sections" className="relative">
          <ul>
            {listed.map((item, index) => (
              <li key={item.id} className="border-rule border-b last:border-b-0">
                <Link
                  href={item.href}
                  className="nav-item flex items-baseline gap-3 px-4 py-2.5"
                  data-active={active === item.id ? 'true' : undefined}
                  aria-current={active === item.id ? 'true' : undefined}
                  onClick={closeMenu}
                >
                  <span className="label">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-small">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </dialog>
    </header>
  )
}

/** Two hairlines that fold into an X when the menu opens. */
function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span className="menu-glyph" data-open={open ? 'true' : undefined} aria-hidden>
      <span />
      <span />
    </span>
  )
}
