import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleBody } from '@/components/ArticleBody'
import { RichText } from '@/components/RichText'
import { getBlogItem, getBlogSlugs } from '@/lib/blog'
import { getSiteSettings } from '@/lib/content'
import { formatDate } from '@/lib/format'

export const revalidate = 1800

type PageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const settings = await getSiteSettings()
  const slugs = await getBlogSlugs(settings.mediumHandle)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const settings = await getSiteSettings()
  const item = await getBlogItem(settings.mediumHandle, slug)
  if (!item) return { title: 'Not found' }

  const { entry } = item
  return {
    title: entry.title,
    description: entry.excerpt,
    // Medium published it first. Pointing the canonical there keeps the two
    // copies from competing with each other in search results.
    alternates: entry.externalUrl ? { canonical: entry.externalUrl } : undefined,
    openGraph: {
      type: 'article',
      title: entry.title,
      description: entry.excerpt,
      publishedTime: entry.publishedAt || undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const settings = await getSiteSettings()
  const item = await getBlogItem(settings.mediumHandle, slug)
  if (!item) notFound()

  const { entry } = item

  return (
    <article className="pt-32 pb-24">
      <header className="shell">
        <Link className="meta link" href="/blog">
          Back to the blog
        </Link>

        <h1 className="heading-1 mt-10 max-w-4xl">{entry.title}</h1>

        <p className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <span className="meta">{formatDate(entry.publishedAt)}</span>
          <span className="meta">{entry.readingMinutes} min read</span>
          {entry.topics.map((topic) => (
            <span key={topic} className="meta">
              {topic}
            </span>
          ))}
        </p>
      </header>

      <div className="shell mt-14">
        <div className="max-w-[46rem]">
          {item.kind === 'article' ? (
            <ArticleBody html={item.article.html} />
          ) : (
            <RichText value={item.post.body} className="article" />
          )}

          {entry.externalUrl ? (
            <p className="border-rule mt-16 border-t pt-6">
              <a
                className="link meta"
                href={entry.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Originally published on Medium
              </a>
            </p>
          ) : null}
        </div>
      </div>
    </article>
  )
}
