import 'server-only'

import { XMLParser } from 'fast-xml-parser'
import sanitizeHtml from 'sanitize-html'

export type Article = {
  slug: string
  title: string
  /** The canonical Medium URL, with the feed's tracking query removed. */
  url: string
  publishedAt: string
  topics: string[]
  excerpt: string
  readingMinutes: number
  /** Sanitised article HTML. Never the raw feed. */
  html: string
  coverImage?: string
}

const FEED_REVALIDATE = 1800 // 30 minutes: new posts appear on their own.
const WORDS_PER_MINUTE = 200

// TODO(madushan): the feed only carries roughly the ten most recent posts.
// Anything older disappears from this site when it falls off the feed. If the
// archive starts to matter, the articles need storing in Sanity rather than
// read from RSS at request time.
const MAX_ARTICLES = 12

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  trimValues: true,
})

/* ── sanitising ────────────────────────────────────────────────────────────
   The feed is remote HTML written by a third party. It is never rendered as
   given: everything below is an allowlist, and anything not named is dropped.
   ────────────────────────────────────────────────────────────────────────── */

/** Medium's own furniture, which belongs on Medium and not here. */
const BOILERPLATE =
  /(was originally published in|continuing the conversation by highlighting|clap|follow me on medium|sign up for|subscribe to my newsletter)/i

const SANITISE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'h2',
    'h3',
    'h4',
    'p',
    'ul',
    'ol',
    'li',
    'blockquote',
    'figure',
    'figcaption',
    'pre',
    'code',
    'a',
    'strong',
    'em',
    'br',
    'hr',
    'img',
  ],
  allowedAttributes: {
    a: ['href', 'title'],
    img: ['src', 'alt', 'width', 'height'],
  },
  allowedSchemes: ['https', 'mailto'],
  // Medium's h3 is its large heading and h4 its small one. The page already
  // owns the h1, so everything moves up one to keep the outline honest.
  transformTags: {
    h1: 'h2',
    h3: 'h2',
    h4: 'h3',
    b: 'strong',
    i: 'em',
  },
  exclusiveFilter: (frame) => {
    if (frame.tag === 'img') {
      const src = frame.attribs.src ?? ''
      // The view-tracking pixel Medium appends to every item.
      if (/medium\.com\/_\/stat/.test(src)) return true
      const width = Number(frame.attribs.width)
      const height = Number(frame.attribs.height)
      return (width > 0 && width <= 2) || (height > 0 && height <= 2)
    }

    if (frame.tag === 'p') {
      const text = frame.text.trim()
      // An empty <p> here usually wraps an image; leave it alone.
      if (!text) return false
      return BOILERPLATE.test(text)
    }

    return false
  },
}

/**
 * Medium encodes newlines inside code blocks as <br>, so a <pre> arrives as one
 * long line with 800 break tags in it. Turn them back into newlines before the
 * allowlist runs, or every code block renders as a single unreadable row.
 */
function restorePreNewlines(html: string): string {
  return html.replace(
    /<pre\b[^>]*>([\s\S]*?)<\/pre>/gi,
    (_match, inner: string) => `<pre>${inner.replace(/<br\s*\/?>/gi, '\n')}</pre>`,
  )
}

/**
 * Medium's CDN encodes the served width in the path. Ask for a larger source so
 * next/image has something to downscale from rather than upscale.
 */
function upgradeImageSources(html: string): string {
  return html
    .replace(/(cdn-images-\d+\.medium\.com\/max\/)\d+/g, '$12000')
    .replace(/(miro\.medium\.com\/v2\/resize:fit:)\d+/g, '$12000')
}

function sanitise(raw: string): string {
  return upgradeImageSources(sanitizeHtml(restorePreNewlines(raw), SANITISE_OPTIONS))
}

/* ── plain text helpers ───────────────────────────────────────────────────── */

const decodeEntities = (value: string): string =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))

const toPlainText = (html: string): string =>
  decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()

function firstParagraph(html: string): string {
  const match = html.match(/<p>([\s\S]*?)<\/p>/i)
  const text = toPlainText(match?.[1] ?? html)
  if (text.length <= 220) return text
  return `${text.slice(0, text.lastIndexOf(' ', 219))}…`
}

function readingMinutes(html: string): number {
  const words = toPlainText(html).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

/** The feed appends ?source=rss-… to every link. That is not the canonical URL. */
function canonicalUrl(link: string): string {
  try {
    const url = new URL(link)
    url.search = ''
    return url.toString()
  } catch {
    return link
  }
}

/* ── the feed ─────────────────────────────────────────────────────────────── */

type FeedItem = {
  title?: string | { __cdata?: string }
  link?: string
  guid?: string | { '#text'?: string }
  pubDate?: string
  category?: string | string[]
  'content:encoded'?: string | { __cdata?: string }
}

const text = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.__cdata === 'string') return record.__cdata
    if (typeof record['#text'] === 'string') return record['#text']
  }
  return ''
}

/**
 * Articles are written on Medium and read here. Nothing about them is stored:
 * the feed is fetched at request time and cached for half an hour, so a new
 * post appears without a deploy.
 *
 * On any failure this returns an empty list. The index then renders a link to
 * the Medium profile: never an error, never a broken page because someone
 * else's feed was slow.
 */
export async function getArticles(handle: string | undefined): Promise<Article[]> {
  if (!handle) return []

  try {
    const response = await fetch(`https://medium.com/feed/@${handle}`, {
      headers: { 'user-agent': 'madushan-portfolio/1.0 (+https://medium.com)' },
      next: { revalidate: FEED_REVALIDATE, tags: ['medium'] },
    })

    if (!response.ok) {
      console.warn(`[medium] feed responded ${response.status}`)
      return []
    }

    const parsed = parser.parse(await response.text())
    const raw = parsed?.rss?.channel?.item
    const items: FeedItem[] = Array.isArray(raw) ? raw : raw ? [raw] : []
    const seen = new Set<string>()

    return items.slice(0, MAX_ARTICLES).map((item) => {
      const title = text(item.title)
      const html = sanitise(text(item['content:encoded']))

      let slug = slugify(title) || slugify(text(item.guid)) || 'article'
      if (seen.has(slug)) slug = `${slug}-${seen.size}`
      seen.add(slug)

      const categories = Array.isArray(item.category)
        ? item.category.map(text).filter(Boolean)
        : item.category
          ? [text(item.category)].filter(Boolean)
          : []

      return {
        slug,
        title,
        url: canonicalUrl(item.link ?? `https://medium.com/@${handle}`),
        publishedAt: item.pubDate ?? '',
        topics: categories.slice(0, 4),
        excerpt: firstParagraph(html),
        readingMinutes: readingMinutes(html),
        html,
        coverImage: html.match(/<img[^>]+src="([^"]+)"/i)?.[1],
      }
    })
  } catch (error) {
    console.warn('[medium] feed unavailable:', error)
    return []
  }
}

export async function getArticle(
  handle: string | undefined,
  slug: string,
): Promise<Article | null> {
  const articles = await getArticles(handle)
  const article = articles.find((item) => item.slug === slug)
  if (!article) return null
  return { ...article, html: await withImageSizes(article.html) }
}

/* ── image sizing ─────────────────────────────────────────────────────────── */

/**
 * Medium's HTML carries no image dimensions, and next/image needs them or the
 * page shifts as each figure loads. There are only one or two images per
 * article, so the header of each is read once per regeneration — a ranged
 * request, not a full download — and the size is written into the markup.
 *
 * Anything that fails keeps its natural aspect and simply loads without a
 * reservation, which is the same behaviour as before this existed.
 */
async function withImageSizes(html: string): Promise<string> {
  const sources = [...html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/gi)].map((match) => match[1])
  const unique = [...new Set(sources)].slice(0, 12)
  if (unique.length === 0) return html

  const sizes = new Map<string, { width: number; height: number }>()
  await Promise.all(
    unique.map(async (src) => {
      const size = await probeImageSize(src)
      if (size) sizes.set(src, size)
    }),
  )

  return html.replace(/<img([^>]+)>/gi, (tag, attrs: string) => {
    const src = attrs.match(/src="([^"]+)"/i)?.[1]
    const size = src ? sizes.get(src) : undefined
    if (!size || /\bwidth=/i.test(attrs)) return tag
    return `<img${attrs} width="${size.width}" height="${size.height}">`
  })
}

async function probeImageSize(src: string): Promise<{ width: number; height: number } | null> {
  try {
    const response = await fetch(src, {
      headers: { range: 'bytes=0-65535' },
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok && response.status !== 206) return null

    const { default: sharp } = await import('sharp')
    const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata()
    if (!metadata.width || !metadata.height) return null
    return { width: metadata.width, height: metadata.height }
  } catch {
    return null
  }
}
