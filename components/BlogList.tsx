import Link from 'next/link'

import { formatDate } from '@/lib/format'
import type { BlogEntry } from '@/lib/types'

/**
 * A grid of text tiles, not a grid of cards. There are no boxes, no fills and
 * no shadows: each tile is a hairline, a title and two lines of meta, so the
 * page stays flat and monochrome while fitting twice as many entries on a
 * screen.
 *
 * Titles still wrap to whatever length they need, which is the thing worth
 * keeping from the list version — a four-word title and an eighteen-word one
 * should not be forced into the same box. The whole tile is the target; the
 * title is its accessible name.
 */
export function BlogList({
  entries,
  headingLevel = 'h3',
}: {
  entries: BlogEntry[]
  /** h3 inside a section that already has an h2; h2 on the index, which has none. */
  headingLevel?: 'h2' | 'h3'
}) {
  const Heading = headingLevel
  return (
    <ol className="grid gap-x-12 sm:grid-cols-2">
      {entries.map((entry) => (
        <li key={entry.slug} className="work-row border-rule border-t">
          <div className="py-7">
            <Heading className="text-t3 leading-snug font-medium">
              <Link className="work-link" href={`/blog/${entry.slug}`}>
                {entry.title}
              </Link>
            </Heading>

            <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="meta">{formatDate(entry.publishedAt)}</span>
              <span className="meta">{entry.readingMinutes} min</span>
              {entry.source === 'medium' ? <span className="meta">on Medium</span> : null}
            </p>

            {entry.excerpt ? (
              <p className="text-muted mt-3 line-clamp-2 text-small">{entry.excerpt}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** The feed was slow or empty. Send people to the source rather than an error. */
export function BlogUnavailable({ profileUrl }: { profileUrl: string | null }) {
  return (
    <div className="measure">
      <p className="text-body">
        Technology goes up on Medium. Everything else is written here.
      </p>
      {profileUrl ? (
        <a className="link mt-5 inline-block" href={profileUrl} target="_blank" rel="noopener noreferrer">
          My writing on Medium
        </a>
      ) : null}
    </div>
  )
}
