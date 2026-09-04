import { NextResponse, type NextRequest } from 'next/server'

/**
 * Extends the long-lived Instagram token. Long-lived tokens last 60 days and
 * can be refreshed any time after day 1, so a monthly cron keeps it alive with
 * room to spare.
 *
 * vercel.json wires the cron. This route fails loudly on purpose: a silently
 * failing refresh is exactly how a gallery goes stale without anyone noticing.
 * See the README for writing the new token back into the environment.
 */

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!isAuthorised(request)) {
    return NextResponse.json({ message: 'Unauthorised' }, { status: 401 })
  }

  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) {
    console.error('[ig-refresh] INSTAGRAM_ACCESS_TOKEN is not set.')
    return NextResponse.json({ message: 'No token configured' }, { status: 500 })
  }

  const url = new URL('https://graph.instagram.com/refresh_access_token')
  url.searchParams.set('grant_type', 'ig_refresh_token')
  url.searchParams.set('access_token', token)

  let payload: { access_token?: string; expires_in?: number }
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    payload = await response.json()
    if (!response.ok || !payload.access_token) {
      console.error('[ig-refresh] REFRESH FAILED', response.status, JSON.stringify(payload))
      return NextResponse.json(
        { message: 'Refresh failed', status: response.status },
        { status: 502 },
      )
    }
  } catch (error) {
    console.error('[ig-refresh] REFRESH FAILED', error)
    return NextResponse.json({ message: 'Refresh failed' }, { status: 502 })
  }

  const days = Math.floor((payload.expires_in ?? 0) / 86_400)
  const today = new Date().toISOString().slice(0, 10)

  // The route cannot rewrite its own environment. Log the new token so it can
  // be pasted back, in terms that are hard to miss in a log.
  console.error(
    [
      '[ig-refresh] NEW INSTAGRAM TOKEN ISSUED.',
      `Valid for ${days} days. Update the environment:`,
      '  vercel env rm INSTAGRAM_ACCESS_TOKEN production',
      `  echo "${payload.access_token}" | vercel env add INSTAGRAM_ACCESS_TOKEN production`,
      '  vercel env rm INSTAGRAM_TOKEN_ISSUED_AT production',
      `  echo "${today}" | vercel env add INSTAGRAM_TOKEN_ISSUED_AT production`,
    ].join('\n'),
  )

  return NextResponse.json({
    refreshed: true,
    expiresInDays: days,
    tokenChanged: payload.access_token !== token,
    // The token itself is never returned in a response body.
    action: 'Copy the new token from the deployment logs into INSTAGRAM_ACCESS_TOKEN.',
  })
}

function isAuthorised(request: NextRequest): boolean {
  // Vercel signs its own cron invocations with this header.
  if (request.headers.get('x-vercel-cron')) return true

  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}
