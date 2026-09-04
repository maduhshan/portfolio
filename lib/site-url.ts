/**
 * The canonical origin, used for metadataBase, the sitemap and robots.
 *
 * NEXT_PUBLIC_SITE_URL wins when it is set. Failing that, Vercel injects
 * VERCEL_PROJECT_PRODUCTION_URL into every deployment without any
 * configuration and it holds the project's production domain, so the sitemap
 * stays correct even when nobody has set the variable. Localhost is the last
 * resort and is only ever right in development.
 */
const production = process.env.VERCEL_PROJECT_PRODUCTION_URL

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (production ? `https://${production}` : '') ||
  'http://localhost:3000'
).replace(/\/+$/, '')
