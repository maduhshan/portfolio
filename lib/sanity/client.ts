import { createClient, type SanityClient } from 'next-sanity'

import { apiVersion, dataset, projectId, sanityConfigured } from '@/sanity/env'

export const client: SanityClient | null = sanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      // ISR is doing the caching; the CDN would only add a second stale layer.
      useCdn: false,
      perspective: 'published',
      token: process.env.SANITY_API_READ_TOKEN,
      stega: false,
    })
  : null

type FetchArgs = {
  query: string
  params?: Record<string, unknown>
  /** Cache tags. /api/revalidate invalidates these when Sanity publishes. */
  tags: string[]
  /** Backstop in case the webhook is not wired up. */
  revalidate?: number
}

export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  revalidate = 3600,
}: FetchArgs): Promise<T | null> {
  if (!client) return null

  // In development there is no webhook: Sanity cannot reach localhost, so
  // nothing ever invalidates these tags.
  const caching =
    process.env.NODE_ENV === 'development'
      ? { cache: 'no-store' as const }
      : { next: { revalidate, tags } }

  try {
    return await client.fetch<T>(query, params, caching)
  } catch (error) {
    console.warn(`[sanity] query failed for tags ${tags.join(', ')}:`, error)
    return null
  }
}
