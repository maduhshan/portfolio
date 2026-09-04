import type { Metadata } from 'next'
import Link from 'next/link'

import { OpenCue } from '@/components/OpenCue'
import { Plate } from '@/components/Plate'
import { getProjects } from '@/lib/content'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Selected work',
  description:
    'Distributed systems and data platforms across payments, iGaming, ecommerce, publishing, insurance and security tooling.',
  openGraph: { title: 'Selected work — Madushan Chathuranga', url: '/work' },
}

/**
 * The full index, and where the heading on the home page points.
 *
 * Flat on purpose. The drum on the home page is for reading one project at a
 * time; this is for finding one, so everything is on a single screen you can
 * scan rather than something you have to turn through.
 */
export default async function WorkIndexPage() {
  const projects = await getProjects()
  const ordered = [...projects].sort((a, b) => a.order - b.order)

  return (
    <div className="pt-32 pb-24">
      <header className="shell">
        <Link className="meta link" href="/#work">
          Back to the site
        </Link>
        <h1 className="heading-1 mt-10">Selected work</h1>
        <p className="measure text-muted mt-5 text-small">
          Distributed systems and data platforms. The domains move around a lot. The problems
          underneath do not change much.
        </p>
      </header>

      <div className="shell mt-14">
        <ol className="border-rule border-t">
          {ordered.map((project, index) => {
            const cover = project.coverImage
            const showPlate = Boolean(cover?.asset?.url)

            return (
              <li key={project._id} className="work-row border-rule border-b">
                <div
                  className={`grid grid-cols-[2.25rem_1fr] items-start gap-x-6 gap-y-4 py-8 ${
                    showPlate ? 'md:grid-cols-[3rem_1fr_11rem] md:py-10' : 'md:grid-cols-[3rem_1fr] md:py-10'
                  }`}
                >
                  <span className="label pt-2">{String(index + 1).padStart(2, '0')}</span>

                  <div>
                    <h2 className="heading-2">
                      <Link className="work-link" href={`/work/${project.slug}`}>
                        {project.title}
                      </Link>
                    </h2>

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

                    <p className="mt-5">
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
                    <div className="work-plate hidden md:block">
                      <Plate
                        src={cover?.asset?.url}
                        alt={cover?.alt ?? ''}
                        aspect="4 / 3"
                        sizes="(max-width: 768px) 0px, 11rem"
                        blurDataURL={cover?.asset?.metadata?.lqip}
                      />
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
