import Link from 'next/link'

import { BlogList, BlogUnavailable } from '@/components/BlogList'
import { Section } from '@/components/Section'
import type { BlogEntry } from '@/lib/types'

export function Blog({
  entries,
  profileUrl,
}: {
  entries: BlogEntry[]
  profileUrl: string | null
}) {
  return (
    <Section id="blog" index="04" title="Blog" href="/blog">
      {entries.length > 0 ? (
        <>
          <BlogList entries={entries.slice(0, 4)} />
          <Link className="link meta mt-8 inline-block" href="/blog">
            Everything I have written
          </Link>
        </>
      ) : (
        <BlogUnavailable profileUrl={profileUrl} />
      )}
    </Section>
  )
}
