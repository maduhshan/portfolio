import Link from 'next/link'

import { Plate } from '@/components/Plate'
import type { ProjectSummary } from '@/lib/types'

/**
 * Not a grid of identical cards: an index of plates. Row heights vary with
 * importance, so the index has rhythm rather than a metronome of equal cards.
 */
export function Work({ projects }: { projects: ProjectSummary[] }) {
  const ordered = [...projects].sort((a, b) => a.order - b.order)

  return (
    <ol className="border-rule border-t">
      {ordered.map((project, index) => {
        const cover = project.coverImage
        // Only where there is an actual photograph. A featured project with no
        // cover used to reserve an empty frame, which read as something missing
        // rather than as something withheld.
        const showPlate = Boolean(cover?.asset?.url)

        return (
          <li key={project._id} className="work-row border-rule border-b">
            <div
              className={`grid grid-cols-[2.25rem_1fr] items-start gap-x-6 gap-y-4 py-8 ${
                showPlate
                  ? project.featured
                    ? 'md:grid-cols-[3rem_1fr_16rem] md:py-12'
                    : 'md:grid-cols-[3rem_1fr_9rem]'
                  : project.featured
                    ? 'md:grid-cols-[3rem_1fr] md:py-12'
                    : 'md:grid-cols-[3rem_1fr]'
              }`}
            >
              <span className="label pt-2">{String(index + 1).padStart(2, '0')}</span>

              <div>
                <h3 className={project.featured ? 'heading-1' : 'heading-2'}>
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
                <div className={project.featured ? 'hidden md:block' : 'work-plate hidden md:block'}>
                  <Plate
                    src={cover?.asset?.url}
                    alt={cover?.alt ?? ''}
                    aspect={project.featured ? '4 / 3' : '1 / 1'}
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
  )
}
