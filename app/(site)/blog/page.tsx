import type { Metadata } from 'next'
import Link from 'next/link'

import { BlogList, BlogUnavailable } from '@/components/BlogList'
import { getSiteSettings } from '@/lib/content'
import { getBlogEntries } from '@/lib/blog'
import { mediumProfileUrl } from '@/lib/links'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Technology published on Medium and reproduced here in full, alongside everything else written on this site.',
  openGraph: { title: 'Blog — Madushan Chathuranga', url: '/blog' },
}

export default async function BlogIndexPage() {
  const settings = await getSiteSettings()
  const entries = await getBlogEntries(settings.mediumHandle)

  // Technology is the writing on Medium plus anything filed as such here.
  // Everything else is misc. Empty groups are not shown.
  const groups = (['Technology', 'Misc'] as const)
    .map((title) => ({ title, entries: entries.filter((entry) => entry.category === title) }))
    .filter((group) => group.entries.length > 0)

  return (
    <div className="pt-32 pb-24">
      <header className="shell">
        <Link className="meta link" href="/#blog">
          Back to the site
        </Link>
        <h1 className="heading-1 mt-10">Blog</h1>
        <p className="measure text-muted mt-5 text-small">
          Technology is published on Medium and reproduced here in full, each article linking
          back to the original. Everything else is written on this site.
        </p>
      </header>

      <div className="shell mt-14">
        {entries.length > 0 ? (
          <div className="space-y-16">
            {groups.map((group) => (
              <section key={group.title}>
                <h2 className="label">{group.title}</h2>
                <div className="mt-4">
                  <BlogList entries={group.entries} headingLevel="h3" />
                </div>
              </section>
            ))}
          </div>
        ) : (
          <BlogUnavailable profileUrl={mediumProfileUrl(settings.mediumHandle)} />
        )}
      </div>
    </div>
  )
}
