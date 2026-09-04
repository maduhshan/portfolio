'use client'

import dynamic from 'next/dynamic'

import { sanityConfigured } from '@/sanity/env'

/**
 * Sanity Studio, mounted on this domain. The Studio bundle is large, so it is
 * loaded lazily and only when a project id actually exists.
 */
const StudioRoot = dynamic(() => import('@/components/studio/StudioRoot'), {
  ssr: false,
  loading: () => (
    <p className="meta p-8" role="status">
      Loading Studio
    </p>
  ),
})

export default function StudioPage() {
  if (!sanityConfigured) return <StudioNotConfigured />
  return <StudioRoot />
}

function StudioNotConfigured() {
  return (
    <main className="shell py-24">
      <h1 className="heading-1">Studio is not configured yet</h1>
      <div className="measure mt-8 space-y-4">
        <p>
          The site is running on the seed content in <code>content/seed/</code>. To edit content
          here instead, create a project at sanity.io/manage and set these in{' '}
          <code>.env.local</code>:
        </p>
        <pre className="border-rule meta overflow-x-auto border p-4">
          {'NEXT_PUBLIC_SANITY_PROJECT_ID=\nNEXT_PUBLIC_SANITY_DATASET=production'}
        </pre>
        <p>
          Then run <code>npm run seed</code> to push the seed documents into the dataset, and
          reload this page.
        </p>
      </div>
    </main>
  )
}
