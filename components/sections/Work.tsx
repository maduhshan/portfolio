'use client'

import Link from 'next/link'
import { useEffect, useRef, type CSSProperties } from 'react'

import { OpenCue } from '@/components/OpenCue'
import { Plate } from '@/components/Plate'
import { DrumSkip } from '@/components/drum/DrumSkip'
import { DrumStep } from '@/components/drum/DrumStep'
import { useDrum } from '@/components/drum/useDrum'
import type { ProjectSummary } from '@/lib/types'

/**
 * The index of work, mounted on a drum. One project faces the reader, with the
 * one before and the one after visible above and below as part of the wheel.
 *
 * Without JavaScript, on a narrow screen, or under prefers-reduced-motion this
 * is the plain ordered index it has always been.
 */

/** How much scrolling advances one face. Deliberately more than a single
 *  trackpad flick: a project should have to be scrolled past, not brushed. */
const PITCH_VH = 54

/** How long a project holds before the wheel turns on its own. Long enough to
 *  read a title, an organisation and a stack without being moved on. */
const AUTO_MS = 7500

export function Work({ projects }: { projects: ProjectSummary[] }) {
  const ordered = [...projects].sort((a, b) => a.order - b.order)
  const faces = ordered.length
  const { runwayRef, drumRef, front, live, direction, seek } = useDrum(faces, {
    autoMs: AUTO_MS,
  })
  const placed = useRef(false)
  // A stable key, so the effect is not rescheduled on every render.
  const slugs = ordered.map((project) => project.slug).join('|')

  // Coming back from a case study. The link carries the project it belongs to,
  // so the wheel returns turned to that one rather than to the front of it.
  //
  // Re-asserted a few times: the router does its own scroll to #work after the
  // new page paints, and a single attempt loses that race. Abandoned the moment
  // there is any real input.
  useEffect(() => {
    if (placed.current) return
    const slug = new URLSearchParams(window.location.search).get('work')
    if (!slug) {
      placed.current = true
      return
    }
    const index = slugs.split('|').indexOf(slug)
    if (index < 0) {
      placed.current = true
      return
    }

    let cancelled = false
    const stop = () => {
      cancelled = true
    }
    const inputs = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const
    for (const name of inputs) window.addEventListener(name, stop, { passive: true })

    const place = () => {
      if (cancelled) return
      if (live) seek(index, false)
      else
        drumRef.current
          ?.querySelector(`[data-project="${slug}"]`)
          ?.scrollIntoView({ block: 'center' })
    }

    // Tell the generic hash landing to stand down; this one knows better.
    window.dispatchEvent(new Event('landing:taken'))
    // Spread past the router's scroll, which animates for roughly a second.
    const timers = [0, 140, 420, 800, 1200].map((delay) => window.setTimeout(place, delay))
    const settled = window.setTimeout(() => {
      placed.current = true
      // The slug has done its work; leave a clean address behind.
      window.history.replaceState(null, '', window.location.pathname + window.location.hash)
    }, 1400)

    return () => {
      for (const timer of timers) window.clearTimeout(timer)
      window.clearTimeout(settled)
      for (const name of inputs) window.removeEventListener(name, stop)
    }
  }, [live, slugs, seek, drumRef])

  return (
    <div
      ref={runwayRef}
      className="drum-runway"
      style={{ '--faces': faces, '--pitch': `${PITCH_VH}vh` } as CSSProperties}
    >
      <div className="drum-stage">
        <p className="label drum-count" aria-hidden="true">
          {String(front + 1).padStart(2, '0')} / {String(faces).padStart(2, '0')}
        </p>

        <ol ref={drumRef} className="drum border-rule border-t">
          {ordered.map((project, index) => {
            const cover = project.coverImage
            const showPlate = Boolean(cover?.asset?.url)

            return (
              <li
                key={project._id}
                className="drum-face work-row border-rule border-b"
                data-project={project.slug}
                style={{ '--i': index } as CSSProperties}
              >
                <div
                  className={`drum-face__inner grid grid-cols-[2.25rem_1fr] items-start gap-x-6 gap-y-4 py-8 ${
                    showPlate
                      ? 'md:grid-cols-[3rem_1fr_16rem] md:py-12'
                      : 'md:grid-cols-[3rem_1fr] md:py-12'
                  }`}
                >
                  <span className="label pt-2">{String(index + 1).padStart(2, '0')}</span>

                  <div>
                    <h3 className="heading-1">
                      <Link className="work-link" href={`/work/${project.slug}`}>
                        {project.title}
                      </Link>
                    </h3>

                    <p className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1">
                      <span className="text-small">{project.organisation}</span>
                      <span className="meta">{project.period}</span>
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
                      {project.stack.map((item) => (
                        <li key={item} className="meta">
                          {item}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-6">
                      <OpenCue label="case study" />
                    </p>

                    {project.productUrl ? (
                      <p className="mt-4">
                        <a
                          className="link meta"
                          href={project.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {project.productName ?? project.title}
                        </a>
                      </p>
                    ) : null}
                  </div>

                  {showPlate ? (
                    <div className="hidden md:block">
                      <Plate
                        src={cover?.asset?.url}
                        alt={cover?.alt ?? ''}
                        aspect="4 / 3"
                        sizes="(max-width: 768px) 0px, 16rem"
                        blurDataURL={cover?.asset?.metadata?.lqip}
                      />
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>

        <DrumStep front={front} count={faces} onSeek={seek} label="projects" />

        <DrumSkip
          direction={direction}
          down="#photography"
          up="#career"
          downLabel="Skip the projects and go to Photography"
          upLabel="Skip the projects and go back to Career"
        />
      </div>
    </div>
  )
}
