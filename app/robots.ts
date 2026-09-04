import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The Studio is his; the style guide is scaffolding.
      disallow: ['/studio', '/studio/', '/styleguide', '/api/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
