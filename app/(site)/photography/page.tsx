import type { Metadata } from 'next'
import Link from 'next/link'

import { Gallery } from '@/components/gallery/Gallery'
import { getSiteSettings } from '@/lib/content'
import { curatedFrames, getFrames } from '@/lib/gallery'
import { instagramHandle } from '@/lib/links'

export const revalidate = 86_400

export const metadata: Metadata = {
  title: 'Photography',
  description:
    'Wildlife photographs by Madushan Chathuranga, published as @_wild_diary.',
  openGraph: { title: 'Photography — Madushan Chathuranga', url: '/photography' },
}

export default async function FieldPage() {
  const [{ frames }, settings] = await Promise.all([getFrames(60), getSiteSettings()])
  // The pinned posts lead here too, so the grid and the gallery agree.
  const ordered = curatedFrames(frames, frames.length, settings.pinnedPosts)
  const handle = instagramHandle(settings.instagram)

  return (
    <div data-ground="hide" className="bg-ground text-fg min-h-dvh pt-32 pb-24">
      <header className="shell">
        <Link className="meta link" href="/#photography">
          Back to the site
        </Link>
        <h1 className="heading-1 mt-10">Photography</h1>
        <p className="measure text-muted mt-4 text-small">
          I photograph in the wild, mostly at first light. Click a frame to see it whole.
        </p>
      </header>

      <div className="shell mt-16">
        {frames.length > 0 ? (
          <Gallery frames={ordered} />
        ) : (
          <p className="measure text-body">
            The photographs live on Instagram while this gallery is being filled.
          </p>
        )}

        {settings.instagram ? (
          <p className="border-rule mt-16 border-t pt-8">
            <a
              className="link meta"
              href={settings.instagram}
              target="_blank"
              rel="me noopener noreferrer"
            >
              {handle} on Instagram
            </a>
          </p>
        ) : null}
      </div>
    </div>
  )
}
