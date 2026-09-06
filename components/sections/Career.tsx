'use client'

import { useEffect, useState, type CSSProperties } from 'react'

import { OpenCue } from '@/components/OpenCue'
import { DrumSkip } from '@/components/drum/DrumSkip'
import { DrumStep } from '@/components/drum/DrumStep'
import { useDrum } from '@/components/drum/useDrum'
import { formatRange, monthDiff, yearOf } from '@/lib/format'
import type { Role } from '@/lib/types'

/**
 * A career arc, not a stack of cards.
 *
 * The rail on the left is a real time axis, running from January of the first
 * year worked to today with nothing truncated at either end. Band height is
 * proportional to months actually served, so a four-year tenure is visibly four
 * times a one-year one.
 *
 * The roles themselves sit on the same drum as Selected work: one role faces
 * the reader, the one before and the one after visible above and below. The
 * rail is what keeps the whole arc in view while the drum turns, and the
 * marker rides down it as each role comes round.
 *
 * Below the breakpoint, or under prefers-reduced-motion, the drum never
 * engages and this is the plain scrolling list it has always been.
 */

/** How much scrolling advances one role. A little longer than the work drum:
 *  roles carry more to read on each face. */
const PITCH_VH = 58

/** How long a role holds before the wheel turns on its own. */
const AUTO_MS = 7500

export function Career({ roles }: { roles: Role[] }) {
  const ordered = [...roles].sort((a, b) => a.order - b.order)
  // Six roles means a 60 degree step, against eight projects at 45, so a
  // career neighbour tilts away harder and the same opacity reads dimmer.
  // The higher falloff evens that out and leaves the next role legible enough
  // to be worth turning to.
  const { runwayRef, drumRef, front, live, direction, seek } = useDrum(ordered.length, {
    falloff: 1.9,
    autoMs: AUTO_MS,
  })
  const [scrolledTo, setScrolledTo] = useState(0)
  const active = live ? front : scrolledTo

  const earliest = ordered.reduce(
    (min, role) => (role.startDate < min ? role.startDate : min),
    ordered[0]?.startDate ?? new Date().toISOString(),
  )

  // The axis begins at the start of the first year worked, so the earliest year
  // sits on the axis rather than being cropped off the bottom of it.
  const firstYear = yearOf(earliest)
  const axisStart = `${firstYear}-01-01`
  const totalMonths = Math.max(monthDiff(axisStart, null), 1)
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
      labelled: (year - firstYear) % 2 === 0,
    })
  }

  // Only needed when the drum is not driving. On a narrow screen or under
  // reduced motion the rail still has to follow what is being read.
  useEffect(() => {
    if (live) return
    const drum = drumRef.current
    if (!drum) return
    const items = Array.from(drum.querySelectorAll<HTMLElement>('[data-role-index]'))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        const first = visible[0]?.target as HTMLElement | undefined
        if (first) setScrolledTo(Number(first.dataset.roleIndex))
      },
      { rootMargin: '-30% 0px -55% 0px' },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [live, drumRef])

  const marker = bands[active]

  return (
    <div className="career grid grid-cols-[1.6rem_1fr] gap-x-3 md:grid-cols-[5rem_1fr] md:gap-x-8">
      <div className="career-rail" aria-hidden>
        <div className="sticky top-32 h-[62vh]">
          <div className="relative h-full">
            <span className="career-axis bg-rule absolute top-0 bottom-0 w-px" />
            {ticks.map((tick) => (
              <span
                key={tick.year}
                className="career-tick absolute flex items-center gap-2"
                style={{ top: `${tick.top}%` }}
              >
                <span className="bg-rule-strong block h-px w-1.5" />
                {tick.labelled ? (
                  <span className="label career-year -translate-y-1/2 leading-none">
                    {tick.year}
                  </span>
                ) : null}
              </span>
            ))}

            {bands.map((band, index) => (
              <span
                key={band.id}
                className="career-band absolute"
                data-active={index === active ? 'true' : undefined}
                style={{
                  top: `${band.top}%`,
                  height: `${band.height}%`,
                  maskImage: band.current
                    ? 'linear-gradient(to bottom, transparent 0%, black 26%)'
                    : undefined,
                  WebkitMaskImage: band.current
                    ? 'linear-gradient(to bottom, transparent 0%, black 26%)'
                    : undefined,
                }}
              />
            ))}

            {/* Rides down the axis as each role comes round. */}
            {marker ? (
              <span
                className="career-marker absolute"
                style={{ top: `${marker.top + marker.height / 2}%` }}
              />
            ) : null}
          </div>
        </div>
      </div>

      <div
        ref={runwayRef}
        className="drum-runway"
        style={
          {
            '--faces': ordered.length,
            '--pitch': `${PITCH_VH}vh`,
          } as CSSProperties
        }
      >
        <div className="drum-stage">
          <p className="label drum-count" aria-hidden="true">
            {String(active + 1).padStart(2, '0')} / {String(ordered.length).padStart(2, '0')}
          </p>

          <ol ref={drumRef} className="drum">
            {ordered.map((role, index) => {
              const current = role.endDate === null

              return (
                <li
                  key={role._id}
                  data-role-index={index}
                  className="drum-face work-row border-rule border-b"
                  style={{ '--i': index } as CSSProperties}
                  onMouseEnter={() => setScrolledTo(index)}
                >
                  <div className={`drum-face__inner ${current ? 'py-10 md:py-12' : 'py-8'}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                      <h3 className={current ? 'heading-1' : 'heading-2'}>
                        {role.companyUrl ? (
                          <a
                            className="link-quiet work-link"
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

                    {role.summary ? (
                      <p
                        className={`measure mt-4 ${current ? 'text-body' : 'text-muted text-small'}`}
                      >
                        {role.summary}
                      </p>
                    ) : null}

                    {role.companyUrl ? (
                      <p className="mt-6">
                        <OpenCue label="company" external />
                      </p>
                    ) : null}

                    {role.highlights && role.highlights.length > 0 ? (
                      <ul
                        className={`tick-list measure space-y-1.5 ${role.summary ? 'mt-4' : 'mt-5'}`}
                      >
                        {role.highlights.map((highlight) => (
                          <li key={highlight} className="text-muted text-small">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>

          <DrumStep front={front} count={ordered.length} onSeek={seek} label="roles" />

          <DrumSkip
            direction={direction}
            down="#work"
            up="#life"
            downLabel="Skip the career history and go to Selected work"
            upLabel="Skip the career history and go back to Life"
          />
        </div>
      </div>
    </div>
  )
}
