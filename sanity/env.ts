export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || ''

/**
 * The site runs without Sanity configured — `lib/content.ts` falls back to the
 * seed documents in `content/seed/`. Everything Sanity-shaped checks this first
 * so a missing project id degrades instead of throwing.
 */
export const sanityConfigured = projectId.length > 0
