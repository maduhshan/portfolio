import Image from 'next/image'

import { FocusBrackets } from './FocusBrackets'

type PlateProps = {
  src?: string | null
  alt: string
  /** CSS aspect-ratio for the frame. Reserved before load, so nothing shifts. */
  aspect?: string
  sizes?: string
  blurDataURL?: string | null
  priority?: boolean
  brackets?: boolean
  /** Shown when there is no photograph yet. */
  emptyLabel?: string
  className?: string
}

/**
 * A photograph, framed. Photographs are the only colour on this site, so this
 * is also the only component that renders any.
 *
 * `data-focus-target` opts the frame into the focus-pull cursor: it sits
 * slightly soft until the reticle approaches. The blur is applied by the cursor
 * provider at runtime, never in static CSS, so no-JS and reduced-motion
 * visitors get a sharp image.
 */
export function Plate({
  src,
  alt,
  aspect = '3 / 2',
  sizes = '(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 32vw',
  blurDataURL,
  priority = false,
  brackets = false,
  emptyLabel = 'frame reserved',
  className = '',
}: PlateProps) {
  return (
    <figure
      className={`relative ${className}`}
      style={{ aspectRatio: aspect }}
      data-focus-target={src ? '' : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL ?? undefined}
          className="object-cover"
        />
      ) : (
        <div className="border-rule absolute inset-0 border">
          <span className="label absolute bottom-2 left-2">{emptyLabel}</span>
        </div>
      )}
      {brackets ? <FocusBrackets inset={10} /> : null}
    </figure>
  )
}
