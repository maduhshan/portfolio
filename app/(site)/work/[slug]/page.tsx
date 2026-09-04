import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Plate } from '@/components/Plate'
import { RichText } from '@/components/RichText'
import { getProject, getProjectSlugs, getProjects, getSiteSettings } from '@/lib/content'
import { excerpt, toPlainText } from '@/lib/portable-text'

export const revalidate = 3600

type PageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await getProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Not found' }

  const description = excerpt(toPlainText(project.problem))
  return {
    title: project.title,
    description,
    openGraph: {
      title: `${project.title} — Madushan Chathuranga`,
      description,
      type: 'article',
      url: `/work/${project.slug}`,
    },
  }
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const [all, settings] = await Promise.all([getProjects(), getSiteSettings()])
  // Editable at /studio, with the original wording as the fallback.
  const labels = settings.caseStudyLabels ?? {}
  const ordered = [...all].sort((a, b) => a.order - b.order)
  const index = ordered.findIndex((item) => item.slug === project.slug)
  const next = ordered.length > 1 ? ordered[(index + 1) % ordered.length] : null
  const cover = project.coverImage

  return (
    <article className="pt-32 pb-24">
      <header className="shell">
        {/* Carries the slug so the wheel comes back turned to this project
            rather than to the first one. */}
        <Link className="meta link" href={`/?work=${project.slug}#work`}>
          Back to Selected work
        </Link>

        <div className="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="label">{String(index + 1).padStart(2, '0')}</p>
            <h1 className="heading-1 mt-3">{project.title}</h1>
          </div>

          <dl className="grid grid-cols-[5.5rem_1fr] gap-x-6 gap-y-3 md:col-span-4 md:self-end">
            <dt className="label pt-1">where</dt>
            <dd className="text-small">{project.organisation}</dd>
            <dt className="label pt-1">when</dt>
            <dd className="text-small">{project.period}</dd>
            {project.productUrl ? (
              <>
                <dt className="label pt-1">live</dt>
                <dd className="text-small">
                  <a
                    className="link"
                    href={project.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {project.productName ?? project.title}
                  </a>
                </dd>
              </>
            ) : null}
          </dl>
        </div>

        <ul className="border-rule mt-10 flex flex-wrap gap-x-5 gap-y-1 border-t pt-6">
          {project.stack.map((item) => (
            <li key={item} className="meta">
              {item}
            </li>
          ))}
        </ul>
      </header>

      {cover?.asset?.url ? (
        <div className="shell mt-14">
          <Plate
            src={cover.asset.url}
            alt={cover.alt ?? project.title}
            aspect="16 / 9"
            sizes="(max-width: 768px) 100vw, 80vw"
            blurDataURL={cover.asset.metadata?.lqip}
            priority
          />
        </div>
      ) : null}

      <div className="mt-16 space-y-16">
        <Part title={labels.problem || 'The problem'}>
          <RichText value={project.problem} />
        </Part>
        <Part title={labels.whatIDid || 'What I did'}>
          <RichText value={project.whatIDid} />
        </Part>
        <Part title={labels.impact || 'What changed'}>
          <RichText value={project.impact} />
        </Part>
      </div>

      {next ? (
        <nav className="shell border-rule mt-24 border-t pt-8" aria-label="Next project">
          <p className="label">next</p>
          <Link className="heading-2 link mt-2 inline-block" href={`/work/${next.slug}`}>
            {next.title}
          </Link>
        </nav>
      ) : null}
    </article>
  )
}

function Part({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="shell grid gap-x-8 gap-y-4 md:grid-cols-12">
      <h2 className="heading-3 md:col-span-3">{title}</h2>
      <div className="md:col-span-8">{children}</div>
    </section>
  )
}
