'use client'

import Link from 'next/link'
import type { CSSProperties } from 'react'

import { OpenCue } from '@/components/OpenCue'
import { Plate } from '@/components/Plate'
import { DrumSkip } from '@/components/drum/DrumSkip'
import { useDrum } from '@/components/drum/useDrum'
import type { ProjectSummary } from '@/lib/types'

/**
 * The index of work, mounted on a drum. One project faces the reader, with the
 * one before and the one after visible above and below as part of the wheel.
 *
 * Without JavaScript, on a narrow screen, or under prefers-reduced-motion this
 * is the plain ordered index it has always been.
 */

/** How much scrolling advances one face. */
const PITCH_VH = 42

export function Work({ projects }: { projects: ProjectSummary[] }) {
  const ordered = [...projects].sort((a, b) => a.order - b.order)
  const faces = ordered.length
  const { runwayRef, drumRef, front } = useDrum(faces)

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

        <DrumSkip to="#photography" label="Skip the projects and go to Photography" />
      </div>
    </div>
  )
}
