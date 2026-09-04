import 'server-only'

export type InstagramMedia = {
  id: string
  caption?: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url?: string
  permalink: string
  timestamp: string
  thumbnail_url?: string
}

const FIELDS = 'id,caption,media_type,media_url,permalink,timestamp,thumbnail_url'
/**
 * Once a day. The account does not change often enough to justify more, and
 * this is a rate-limited third-party API on the render path.
 *
 * This is the *fetch* cache, so it holds even when the page around it
 * regenerates for another reason — the blog feed revalidates every 30 minutes
 * and that no longer drags Instagram along with it.
 *
 * To pick up a new post before the day is out:
 *   curl -X POST -H "Authorization: Bearer $CRON_SECRET" \
 *     "https://yourdomain.com/api/revalidate?tag=instagram"
 */
const REVALIDATE = 86_400
/** Someone else's API on the critical path of a page render. Bound it. */
const TIMEOUT_MS = 8000
/** Long-lived tokens last 60 days. Shout while there is still time to act. */
const WARN_WITHIN_DAYS = 10
const TOKEN_LIFETIME_DAYS = 60

/**
 * Reads the token holder's own media. Server-side only: INSTAGRAM_ACCESS_TOKEN
 * is never referenced outside this module, and this module is marked
 * `server-only` so a client import fails the build rather than leaking it.
 *
 * On any failure this returns an empty list, and lib/gallery.ts falls back to
 * the photographs in Sanity. The gallery is never empty because a token lapsed.
 */
export async function getInstagramMedia(limit = 24): Promise<InstagramMedia[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return []

  const cached = readDevCache()
  if (cached) return cached

  warnIfTokenExpiring()

  try {
    const url = new URL('https://graph.instagram.com/me/media')
    url.searchParams.set('fields', FIELDS)
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('access_token', token)

    const response = await fetch(url, {
      next: { revalidate: REVALIDATE, tags: ['instagram'] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      console.error(
        `[instagram] /me/media responded ${response.status}. Falling back to Sanity photographs.`,
        detail.slice(0, 300),
      )
      return []
    }

    // Validated rather than cast. A cast would let a changed or truncated
    // payload through and break the render instead of the fetch.
    // Only printed on a real network call, so the logs show whether the cache
    // is doing its job.
    const payload: unknown = await response.json()
    const data = (payload as { data?: unknown })?.data
    const items = Array.isArray(data) ? data.filter(isInstagramMedia) : []

    if (Array.isArray(data) && items.length !== data.length) {
      console.warn(
        `[instagram] dropped ${data.length - items.length} item(s) that did not match the expected shape.`,
      )
    }

    // Video and reels are skipped. For a carousel the parent media_url is the
    // first child image, which is all a gallery tile needs.
    const usable = items.filter(
      (item) =>
        (item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM') &&
        Boolean(item.media_url),
    )

    console.log(`[instagram] fetched ${usable.length} photographs from the API.`)
    writeDevCache(usable)
    return usable
  } catch (error) {
    console.error('[instagram] request failed. Falling back to Sanity photographs.', error)
    return []
  }
}

/* ── development only ──────────────────────────────────────────────────────
   `next dev` does not use the persistent data cache, so every refresh would go
   out to the API and eat into the rate limit while you work. This holds the
   last response in memory for ten minutes.

   Production never reaches this: there the fetch above is cached for a day by
   Next, which is also what makes the ?tag=instagram purge work. An in-process
   cache would survive that purge and serve stale photographs, so it is
   deliberately confined to development.
   ────────────────────────────────────────────────────────────────────────── */

const DEV_TTL_MS = 10 * 60 * 1000
let devCache: { at: number; items: InstagramMedia[] } | null = null

function readDevCache(): InstagramMedia[] | null {
  if (process.env.NODE_ENV !== 'development') return null
  if (!devCache || Date.now() - devCache.at > DEV_TTL_MS) return null
  return devCache.items
}

function writeDevCache(items: InstagramMedia[]): void {
  if (process.env.NODE_ENV !== 'development') return
  devCache = { at: Date.now(), items }
}

function isInstagramMedia(value: unknown): value is InstagramMedia {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.permalink === 'string' &&
    typeof item.timestamp === 'string' &&
    (item.media_type === 'IMAGE' ||
      item.media_type === 'VIDEO' ||
      item.media_type === 'CAROUSEL_ALBUM') &&
    (item.media_url === undefined || typeof item.media_url === 'string') &&
    (item.thumbnail_url === undefined || typeof item.thumbnail_url === 'string') &&
    (item.caption === undefined || typeof item.caption === 'string')
  )
}

/**
 * The Graph API will not tell you when a token expires — it only starts
 * failing. Set INSTAGRAM_TOKEN_ISSUED_AT (ISO date) whenever you mint or
 * refresh one and this warns before the gallery quietly drops to the fallback.
 */
export function warnIfTokenExpiring(): void {
  const issued = process.env.INSTAGRAM_TOKEN_ISSUED_AT
  if (!issued) {
    console.warn(
      '[instagram] INSTAGRAM_TOKEN_ISSUED_AT is not set, so token expiry cannot be monitored.',
    )
    return
  }

  const issuedAt = new Date(issued)
  if (Number.isNaN(issuedAt.getTime())) {
    console.warn(`[instagram] INSTAGRAM_TOKEN_ISSUED_AT is not a date: ${issued}`)
    return
  }

  const expiresAt = new Date(issuedAt.getTime() + TOKEN_LIFETIME_DAYS * 86_400_000)
  const daysLeft = Math.floor((expiresAt.getTime() - Date.now()) / 86_400_000)

  if (daysLeft <= 0) {
    console.error('[instagram] TOKEN HAS EXPIRED. Refresh it: /api/ig-refresh')
  } else if (daysLeft <= WARN_WITHIN_DAYS) {
    console.error(`[instagram] TOKEN EXPIRES IN ${daysLeft} DAYS. Refresh it: /api/ig-refresh`)
  }
}
