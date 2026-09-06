import type { MetadataRoute } from 'next'

import { getBlogSlugs } from '@/lib/blog'
import { getLife, getProjectSlugs, getSiteSettings } from '@/lib/content'
import { siteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings()
  const [slugs, blogSlugs, life] = await Promise.all([
    getProjectSlugs(),
    getBlogSlugs(settings.mediumHandle),
    getLife(),
  ])
  const now = new Date()

  return [
    { url: siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/photography`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/work`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    // Only once there is something to read. The route answers either way, so an
  
    ...(life
      ? [
          {
            url: `${siteUrl}/life`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
          },
        ]
      : []),
    ...blogSlugs.map((slug) => ({
      url: `${siteUrl}/blog/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...slugs.map((slug) => ({
      url: `${siteUrl}/work/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]
}
