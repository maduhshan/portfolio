import Image from 'next/image'

import type { Frame } from '@/lib/types'

/**
 * The profile, quoted.
 *
 * The site's own gallery at /photography is deliberately not a uniform grid: tile
 * scale varies so the stronger frames get more room. This is the opposite on
 * purpose: it is a square three-column grid because that is what an Instagram
 * profile looks like, and the point is that a visitor recognises it as one.
 * Uniformity is the quotation marks.
 *
 * The whole grid is a single link to the profile, so there is nothing to click
 * except through to Instagram. Individual frames are not opened here; that is
 * what /photography is for.
 *
 * The tiles are not focus-pull targets. That effect is a lens on a photograph
 * you are looking at, and at thumbnail size it would just be wobble.
 */
export function InstagramPreview({
  frames,
  profileUrl,
  handle,
}: {
  frames: Frame[]
  profileUrl: string
  handle: string
}) {
  const tiles = frames.slice(0, 15)
  if (tiles.length === 0) return null

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="me noopener noreferrer"
      aria-label={`${handle} on Instagram`}
      className="ig-preview block w-full max-w-[48rem]"
    >
      <ul className="grid grid-cols-5 gap-[3px]">
        {tiles.map((frame) => (
          <li key={frame.id} className="relative aspect-square overflow-hidden">
            <Image
              src={frame.src}
              alt={frame.caption}
              fill
              sizes="(max-width: 640px) 20vw, 150px"
              placeholder={frame.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={frame.blurDataURL}
              className="object-cover"
            />
          </li>
        ))}
      </ul>
    </a>
  )
}
