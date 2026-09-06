import Link from 'next/link'

import { Plate } from '@/components/Plate'
import { Section } from '@/components/Section'
import type { Life as LifeContent } from '@/lib/types'

/**
 * Life, on the home page: the opening and a few photographs, then the way
 * through to the rest of it.
 *
 * Only the opening is here. Which part that is he decides in Studio rather than
 * a character count deciding for him, which is why the story is two fields and
 * not one truncated one.
 *
 * The photographs are black and white here, as every photograph of a person on
 * this site is. They are in colour on /life.
 *
 * Nothing to say yet means no section: the home page does not carry an empty
 * heading, and the navigation drops the entry to match.
 */

/** How many photographs the home page shows before the link through. */
const ON_HOME = 3

export function Life({ index, life }: { index: string; life: LifeContent | null }) {
  if (!life) return null

  const photos = (life.photos ?? []).filter((photo) => photo.image?.asset?.url).slice(0, ON_HOME)
  const paragraphs = (life.intro ?? '')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  return (
    <Section id="life" index={index} title="Life" href="/life">
      {paragraphs.length > 0 ? (
        <div className="measure">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={index > 0 ? 'text-body mt-5' : 'text-body'}>
              {paragraph}
            </p>
          ))}
        </div>
      ) : null}

      {photos.length > 0 ? (
        <ul
          className={`life-plates mt-12 grid gap-4 ${
            photos.length > 1 ? 'sm:grid-cols-2 md:grid-cols-3' : 'max-w-sm'
          }`}
        >
          {photos.map((photo, index) => (
            <li key={index}>
              <Plate
                src={photo.image.asset?.url}
                alt={photo.caption}
                aspect="4 / 5"
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 22vw"
                blurDataURL={photo.image.asset?.metadata?.lqip}
              />
            </li>
          ))}
        </ul>
      ) : null}

      <p className="border-rule mt-12 border-t pt-6">
        <Link className="link" href="/life">
          The whole story
        </Link>
      </p>
    </Section>
  )
}
