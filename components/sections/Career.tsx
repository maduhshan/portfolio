'use client'

import { useEffect, useRef, useState } from 'react'

import { formatRange, monthDiff, monthsBetween, yearOf } from '@/lib/format'
import type { Role } from '@/lib/types'

/**
 * A career arc, not a stack of cards.
 *
 * The rail on the left is a real time axis, running from January of the first
 * year worked to today with nothing truncated at either end. Band height is
 * proportional to months actually served, so a four-year tenure is visibly four
 * times a one-year one. The rail does not try to align pixel-for-pixel with the
 * prose — pointing at a role raises its band instead, so nothing can drift out
 * of register. The current role's band is open at the top.
 */
export function Career({ roles }: { roles: Role[] }) {
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)

  const ordered = [...roles].sort((a, b) => a.order - b.order)
  const earliest = ordered.reduce(
    (min, role) => (role.startDate < min ? role.startDate : min),
    ordered[0]?.startDate ?? new Date().toISOString(),
  )

  // The axis begins at the start of the first year worked, so the earliest year
  // sits on the axis rather than being cropped off the bottom of it.
  const firstYear = yearOf(earliest)
  const axisStart = `${firstYear}-01-01`
  const totalMonths = Math.max(monthDiff(axisStart, null), 1)
  const longest = ordered.reduce(
    (max, role) => Math.max(max, monthsBetween(role.startDate, role.endDate)),
    1,
  )

  const position = (iso: string | null) => monthDiff(axisStart, iso)

  const bands = ordered.map((role) => {
    const end = position(role.endDate)
    const start = position(role.startDate)
    return {
      id: role._id,
      current: role.endDate === null,
      top: ((totalMonths - end) / totalMonths) * 100,
      height: (Math.max(end - start, 1) / totalMonths) * 100,
    }
  })

  const lastYear = new Date().getUTCFullYear()
  const ticks: { year: number; top: number; labelled: boolean }[] = []
  for (let year = firstYear; year <= lastYear; year += 1) {
    ticks.push({
      year,
      top: ((totalMonths - position(`${year}-01-01`)) / totalMonths) * 100,
      // Anchored to the first year, so the axis is always labelled where it
      // starts rather than wherever the alternation happens to land.
      labelled: (year - firstYear) % 2 === 0,
    })
  }

  // Scrolling a role into view raises its band too — the same signal, from the
  // action the visitor is already taking.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-role-index]'))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const first = visible[0]?.target as HTMLElement | undefined
        if (first) setActive(Number(first.dataset.roleIndex))
      },
      { rootMargin: '-30% 0px -55% 0px' },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="grid gap-x-8 md:grid-cols-[5rem_1fr]">
      <div className="hidden md:block" aria-hidden>
        <div className="sticky top-32 h-[62vh]">
          <div className="relative h-full">
            <span className="bg-rule absolute top-0 bottom-0 left-10 w-px" />
            {ticks.map((tick) => (
              <span
                key={tick.year}
                className="absolute left-10 flex items-center gap-2"
                style={{ top: `${tick.top}%` }}
              >
                <span className="bg-rule-strong block h-px w-1.5" />
                {tick.labelled ? (
                  <span className="label -translate-y-1/2 leading-none">{tick.year}</span>
                ) : null}
              </span>
            ))}
            {bands.map((band, index) => (
              <span
                key={band.id}
                className="absolute left-[2.3rem] w-1.5 transition-colors duration-200"
                style={{
                  top: `${band.top}%`,
                  height: `${band.height}%`,
                  backgroundColor:
                    index === active
                      ? 'var(--fg)'
                      : 'color-mix(in oklab, var(--fg) 22%, transparent)',
                  maskImage: band.current
                    ? 'linear-gradient(to bottom, transparent 0%, black 26%)'
                    : undefined,
                  WebkitMaskImage: band.current
                    ? 'linear-gradient(to bottom, transparent 0%, black 26%)'
                    : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <ol ref={listRef}>
        {ordered.map((role, index) => {
          const months = monthsBetween(role.startDate, role.endDate)
          const current = role.endDate === null

          return (
            <li
              key={role._id}
              data-role-index={index}
              className={`border-rule border-b first:pt-0 ${current ? 'py-10 md:py-12' : 'py-8'}`}
              onMouseEnter={() => setActive(index)}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className={current ? 'heading-1' : 'heading-2'}>
                  {role.companyUrl ? (
                    <a
                      className="link-quiet"
                      href={role.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {role.company}
                    </a>
                  ) : (
                    role.company
                  )}
                </h3>
                <p className="meta">{formatRange(role.startDate, role.endDate)}</p>
              </div>

              <p className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className={current ? 'text-body' : 'text-small'}>{role.title}</span>
                <span className="meta">{role.location}</span>
              </p>

              {/* On narrow screens the rail collapses into this: the same scale,
                  drawn per row. */}
              <span
                aria-hidden
                className="bg-rule-strong mt-4 block h-px md:hidden"
                style={{ width: `${Math.max((months / longest) * 100, 6)}%` }}
              />

              {role.summary ? (
                <p className={`measure mt-4 ${current ? 'text-body' : 'text-muted text-small'}`}>
                  {role.summary}
                </p>
              ) : null}

              {role.highlights && role.highlights.length > 0 ? (
                <ul className={`tick-list measure space-y-1.5 ${role.summary ? 'mt-4' : 'mt-5'}`}>
                  {role.highlights.map((highlight) => (
                    <li key={highlight} className="text-muted text-small">
                      {highlight}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
