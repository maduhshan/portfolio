import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

/**
 * Sanity webhook target. Publishing in Studio invalidates the cache tag for the
 * document type that changed, and the affected pages regenerate on the next
 * request — seconds, no deploy.
 *
 * The signature is verified against SANITY_WEBHOOK_SECRET. Without that check
 * anyone could force your whole site to regenerate.
 */

type WebhookBody = {
  _type?: string
  _id?: string
  slug?: { current?: string }
}

/**
 * Sanity document types. Each one is also its cache tag, so this list has to
 * gain an entry whenever `lib/content.ts` starts fetching a new type. A type
 * missing from here is not an error anyone sees: the webhook 400s into a log
 * nobody reads and the content simply stays stale until it expires.
 */
const KNOWN_TYPES = new Set([
  'siteSettings',
  'role',
  'project',
  'post',
  'photo',
  'recommendation',
  'life',
])

/** Feeds, cached for a long time and occasionally needing a nudge. */
const FEED_TAGS = new Set(['instagram', 'medium'])

/**
 * What the manual purge accepts. Everything, not just the feeds: a webhook that
 * was never wired up, or one that fired before its type was known here, leaves
 * content on the site with no way to clear it short of a deploy. This is that
 * way.
 */
const PURGEABLE_TAGS = new Set([...KNOWN_TYPES, ...FEED_TAGS])

export async function POST(request: NextRequest) {
  // Manual purge: ?tag=instagram with the cron secret. Instagram is cached for
  // a day, so this is how a new photograph appears before then. Authenticated
  // with CRON_SECRET rather than the Sanity signature, because Sanity is not
  // the one asking.
  const tag = request.nextUrl.searchParams.get('tag')
  if (tag) {
    const cronSecret = process.env.CRON_SECRET
    if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
    }
    if (!PURGEABLE_TAGS.has(tag)) {
      return NextResponse.json({ message: `Unknown tag: ${tag}` }, { status: 400 })
    }
    revalidateTag(tag, 'max')
    return NextResponse.json({ revalidated: true, tag })
  }

  const secret = process.env.SANITY_WEBHOOK_SECRET

  if (!secret) {
    console.error('[revalidate] SANITY_WEBHOOK_SECRET is not set; refusing to revalidate.')
    return NextResponse.json({ message: 'Webhook secret not configured' }, { status: 500 })
  }

  let isValidSignature: boolean | null = null
  let body: WebhookBody | null = null

  try {
    ;({ isValidSignature, body } = await parseBody<WebhookBody>(request, secret))
  } catch (error) {
    console.warn('[revalidate] could not parse webhook body:', error)
    return NextResponse.json({ message: 'Bad request' }, { status: 400 })
  }

  if (!isValidSignature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
  }

  const type = body?._type

  // A deletion carries no _type unless the webhook projection reaches for it
  // with before(), so the obvious payload for "this document is gone" is the
  // one that says least. Clearing everything is the wrong shape of answer but
  // the right outcome: content that no longer exists must not stay on the site,
  // and the signature check above means only Sanity can ask for this.
  if (!type) {
    for (const known of KNOWN_TYPES) revalidateTag(known, 'max')
    console.warn('[revalidate] no _type in payload, likely a deletion; cleared every content tag.')
    return NextResponse.json({
      revalidated: true,
      tag: [...KNOWN_TYPES],
      id: body?._id ?? null,
      now: Date.now(),
    })
  }

  // A type this route has never heard of is a wiring mistake rather than a
  // deletion, and is worth saying out loud instead of quietly sweeping the
  // whole cache every time it fires.
  if (!KNOWN_TYPES.has(type)) {
    console.warn(`[revalidate] unhandled document type "${type}"; nothing was revalidated.`)
    return NextResponse.json({ message: `Unhandled document type: ${type}` }, { status: 400 })
  }

  revalidateTag(type, 'max')

  return NextResponse.json({
    revalidated: true,
    tag: type,
    id: body?._id ?? null,
    now: Date.now(),
  })
}

export async function GET() {
  return NextResponse.json(
    { message: 'This endpoint accepts Sanity webhook POSTs only.' },
    { status: 405, headers: { Allow: 'POST' } },
  )
}
