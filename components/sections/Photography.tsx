import Link from 'next/link'

import { InstagramPreview } from '@/components/gallery/InstagramPreview'
import { Section } from '@/components/Section'
import { curatedFrames } from '@/lib/gallery'
import { instagramHandle } from '@/lib/links'
import type { Frame } from '@/lib/types'

/**
 * Where the colour is. The interface stays out of the way: no captions over
 * images, no gradients across them, nothing tinted.
 *
 * The home page shows the Instagram profile as a profile: a square grid that
 * links straight through. The site's own gallery, with varied scale and a
 * lightbox, is at /photography.
 */
export function Photography({
  frames,
  instagram,
  pinned = [],
}: {
  frames: Frame[]
  instagram?: string
  pinned?: string[]
}) {
  const handle = instagramHandle(instagram)

  return (
    <Section id="photography" index="03" title="Photography" ground="hide">
      {frames.length > 0 && instagram && handle ? (
        <>
          <InstagramPreview
            frames={curatedFrames(frames, 15, pinned)}
            profileUrl={instagram}
            handle={handle}
          />

          <div className="border-rule mt-12 flex flex-wrap items-baseline gap-x-10 gap-y-3 border-t pt-6">
            <Link className="link" href="/photography">
              The whole gallery
            </Link>
            <a className="link meta" href={instagram} target="_blank" rel="me noopener noreferrer">
              {handle} on Instagram
            </a>
          </div>
        </>
      ) : (
        <div className="measure">
          <p className="text-body">
            The photographs live on Instagram while this gallery is being filled.
          </p>
          {instagram ? (
            <a
              className="link mt-5 inline-block"
              href={instagram}
              target="_blank"
              rel="me noopener noreferrer"
            >
              {handle}
            </a>
          ) : null}
        </div>
      )}
    </Section>
  )
}
