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

const KNOWN_TYPES = new Set(['siteSettings', 'role', 'project', 'post', 'photo'])

/** Feeds that are cached for a long time and occasionally need a nudge. */
const PURGEABLE_TAGS = new Set(['instagram', 'medium'])

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
  if (!type || !KNOWN_TYPES.has(type)) {
    return NextResponse.json({ message: `Unhandled document type: ${type ?? 'none'}` }, { status: 400 })
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
