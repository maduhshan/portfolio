import type { Metadata } from 'next'
import Link from 'next/link'

import { Plate } from '@/components/Plate'
import { RichText } from '@/components/RichText'
import { getLife } from '@/lib/content'

export const revalidate = 86_400

export const metadata: Metadata = {
  title: 'Life',
  description: 'Where Madushan Chathuranga is from, and how he got here.',
  openGraph: { title: 'Life — Madushan Chathuranga', url: '/life' },
}

/**
 * The whole of it. The home page carries the opening; this carries the rest,
 * and every photograph rather than the first few.
 *
 * In colour here. On the home page the same photographs are black and white,
 * which is the site's rule for pictures of people; this page is the one place
 * that steps outside it, because these are his family and not interface.
 */
export default async function LifePage() {
  const life = await getLife()
  const photos = (life?.photos ?? []).filter((photo) => photo.image?.asset?.url)
  const paragraphs = (life?.intro ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <div className="pt-32 pb-24">
      <header className="shell">
        <Link className="meta link" href="/#life">
          Back to the site
        </Link>
        <h1 className="heading-1 mt-10">Life</h1>
      </header>

      <div className="shell mt-16">
        {paragraphs.length > 0 ? (
          <div className="measure">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className={index > 0 ? 'text-body mt-5' : 'text-body'}>
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {life?.body?.length ? <RichText className="measure mt-10" value={life.body} /> : null}

        {photos.length > 0 ? (
          <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo, index) => (
              <li key={index}>
                <figure>
                  <Plate
                    src={photo.image.asset?.url}
                    alt={photo.caption}
                    aspect="4 / 5"
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                    blurDataURL={photo.image.asset?.metadata?.lqip}
                  />
                  <figcaption className="meta text-muted mt-3">{photo.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : null}

        {!paragraphs.length && !life?.body?.length && !photos.length ? (
          <p className="measure text-body">This page is being written.</p>
        ) : null}
      </div>
    </div>
  )
}
