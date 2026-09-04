import Image from 'next/image'

import { FocusBrackets } from '@/components/FocusBrackets'
import { HeroParallax } from '@/components/sections/HeroParallax'
import type { Frame, SiteSettings } from '@/lib/types'

/**
 * The opening. Figures first, then the statement, then the photograph.
 *
 * There is no name here and no job title. A role label answers "what is he
 * called"; the opening should answer "what does he do". The name is set small
 * in the navigation, and the career section is where someone goes for the CV.
 *
 * With no visible headline the page still needs one heading, so the name is
 * carried in a visually hidden h1. It is the honest answer: the page is about a
 * person, and nothing on screen is standing in for that.
 *
 * It is deliberately not full height. This block and the About block below it
 * are one opening in two grounds: the claim on hide, the evidence on paper.
 *
 * The portrait is greyscale on purpose. The site's one rule is that the
 * interface is monochrome and photographs are the only colour, so a photograph
 * of him belongs to the interface and colour stays reserved for the animals. It
 * is also not a focus-pull target: that effect belongs to the gallery, where a
 * frame sharpening under the cursor means something.
 */
export function Hero({ settings, frame }: { settings: SiteSettings; frame: Frame | null }) {
  const stats = settings.stats ?? []
  const industries = settings.industries ?? []

  return (
    <section id="top" data-ground="hide" className="bg-ground text-fg pt-32 pb-16 md:pb-20">
      <div className="shell grid items-center gap-x-10 gap-y-14 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 className="sr-only">{settings.name}</h1>

          {stats.length > 0 ? (
            <ul className="flex flex-wrap gap-x-20 gap-y-8">
              {stats.map((stat) => (
                <li key={stat.label}>
                  <span className="block font-mono text-figure leading-none tabular-nums">
                    {stat.value}
                  </span>
                  <span className="label mt-4 block max-w-[20ch]">{stat.label}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {industries.length > 0 ? (
            <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-2">
              {industries.map((industry) => (
                <li key={industry} className="meta text-fg">
                  {industry}
                </li>
              ))}
            </ul>
          ) : null}

          <p className="measure mt-11 text-body leading-relaxed">{settings.headline}</p>

          {settings.heroNote ? (
            <>
              <span aria-hidden className="bg-rule-strong mt-9 block h-px w-16" />
              <p className="measure text-muted mt-6 text-small">{settings.heroNote}</p>
            </>
          ) : null}
        </div>

        <div className="md:col-span-5 md:justify-self-end">
          <figure className="w-[min(300px,72vw)] md:w-[340px]">
            {/* The brackets sit outside the clip, so they frame the plate
                rather than being cropped by it. */}
            <div className="relative">
              <HeroParallax>
                <div className="portrait relative aspect-[919/1000] overflow-hidden">
                  {frame ? (
                    <div data-depth="0.5" className="absolute inset-0 scale-[1.05]">
                      <Image
                        src={frame.src}
                        alt={frame.caption}
                        fill
                        priority
                        sizes="(max-width: 768px) 300px, 340px"
                        placeholder={frame.blurDataURL ? 'blur' : 'empty'}
                        blurDataURL={frame.blurDataURL ?? undefined}
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <span className="label absolute bottom-3 left-3">photograph pending</span>
                  )}
                </div>
              </HeroParallax>
              <FocusBrackets inset={12} />
            </div>

            {frame?.location ? (
              <figcaption className="label mt-5">{frame.location}</figcaption>
            ) : null}
          </figure>
        </div>
      </div>
    </section>
  )
}
