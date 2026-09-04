import 'server-only'

import { getPost, getPosts } from './content'
import { getArticle, getArticles } from './medium'
import type { Article } from './medium'
import { toPlainText } from './portable-text'
import type { BlogCategory, BlogEntry, Post } from './types'

const WORDS_PER_MINUTE = 200

/**
 * Not everything on Medium is technical writing — the philosophy pieces go
 * there too. Medium tags are the only signal available, so they decide: an
 * article tagged buddhism or quantum-physics is not filed under Technology just
 * because of where it was published. Untagged articles default to Technology,
 * which is what the engineering ones are.
 *
 * Add to this if something lands in the wrong half.
 */
const MISC_TOPICS =
  /philosoph|buddh|histor|science|physic|quantum|cosmolog|relativity|theory-of-everything|string-theory|religio|psycholog|ethic|essay|literature|nature|wildlife|photograph/i

function categoryForArticle(topics: string[]): BlogCategory {
  return topics.some((topic) => MISC_TOPICS.test(topic)) ? 'Misc' : 'Technology'
}

/**
 * One index over two sources. Technical writing is published on Medium and read
 * here; anything written on this site lives in Sanity. A reader should not have
 * to care which is which, beyond the small label saying where it came from.
 */
export async function getBlogEntries(handle: string | undefined): Promise<BlogEntry[]> {
  const [posts, articles] = await Promise.all([getPosts(), getArticles(handle)])

  return [...posts.map(entryFromPost), ...articles.map(entryFromArticle)].sort(
    (a, b) => time(b.publishedAt) - time(a.publishedAt),
  )
}

export type BlogItem =
  | { kind: 'post'; post: Post; entry: BlogEntry }
  | { kind: 'article'; article: Article; entry: BlogEntry }

/** Posts written here win a slug collision. */
export async function getBlogItem(
  handle: string | undefined,
  slug: string,
): Promise<BlogItem | null> {
  const post = await getPost(slug)
  if (post) return { kind: 'post', post, entry: entryFromPost(post) }

  const article = await getArticle(handle, slug)
  if (article) return { kind: 'article', article, entry: entryFromArticle(article) }

  return null
}

export async function getBlogSlugs(handle: string | undefined): Promise<string[]> {
  const entries = await getBlogEntries(handle)
  return entries.map((entry) => entry.slug)
}

function entryFromPost(post: Post): BlogEntry {
  const plain = toPlainText(post.body)
  return {
    slug: post.slug,
    title: post.title,
    publishedAt: post.publishedAt,
    topics: post.topics ?? [],
    excerpt: post.excerpt?.trim() || truncate(plain),
    readingMinutes: Math.max(
      1,
      Math.round(plain.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE),
    ),
    category: post.category ?? 'Misc',
    source: 'here',
  }
}

function entryFromArticle(article: Article): BlogEntry {
  return {
    slug: article.slug,
    title: article.title,
    publishedAt: article.publishedAt,
    topics: article.topics,
    excerpt: article.excerpt,
    readingMinutes: article.readingMinutes,
    category: categoryForArticle(article.topics),
    source: 'medium',
    externalUrl: article.url,
  }
}

function truncate(value: string, max = 220): string {
  if (value.length <= max) return value
  return `${value.slice(0, value.lastIndexOf(' ', max - 1))}…`
}

function time(value: string): number {
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}
