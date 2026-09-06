import { ReadingLight } from '@/components/about/ReadingLight'
import { RichText } from '@/components/RichText'
import { mediumProfileUrl } from '@/lib/links'
import type { SiteSettings } from '@/lib/types'

/**
 * The second half of the opening, not a numbered section.
 *
 * The hero states the claim on the dark ground; this states the evidence on
 * paper. Both hang from the same left datum, so they read as one column even
 * though the ground changes between them.
 *
 * It runs the full width because the competencies sit beside the prose rather
 * than under it. Stacked, the two together ran to about 1100px; side by side
 * they are roughly half that.
 *
 * The figures and the industries used to open this section. They now open the
 * hero, where they are the first evidence anyone reads.
 *
 * No rules between any of this. It is one piece of writing, so it is spaced
 * rather than divided.
 */
export function About({ settings }: { settings: SiteSettings }) {
  const medium = mediumProfileUrl(settings.mediumHandle)
  const competencies = settings.competencies ?? []
  const positioning = settings.positioning ?? []

  return (
    <section
      id="about"
      data-ground="paper"
      className="ground-open text-fg pt-14 pb-16 md:pt-16 md:pb-24"
    >
      <div className="shell">
        <div className="grid gap-x-12 gap-y-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <ReadingLight>
              {positioning.length > 0 ? <RichText value={positioning} /> : null}

              <RichText value={settings.bio} className="mt-6" />
            </ReadingLight>

            <div className="mt-10 flex flex-wrap items-baseline gap-x-8 gap-y-3">
              {settings.cvUrl ? (
                <a
                  className="link meta"
                  href={settings.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Curriculum vitae
                </a>
              ) : null}
              {medium ? (
                <a className="link meta" href={medium} target="_blank" rel="noopener noreferrer">
                  I write on Medium
                </a>
              ) : null}
            </div>
          </div>

          {competencies.length > 0 ? (
            <div className="md:col-span-5 md:col-start-8">
              <h2 className="label">Competencies</h2>
              <dl className="competencies border-rule mt-3 border-t">
                {competencies.map((competency) => (
                  <div key={competency.area} className="border-rule border-b py-2.5">
                    <dt className="typed text-muted">{competency.area}</dt>
                    <dd className="mt-0.5 flex flex-wrap gap-x-3">
                      {competency.items.map((item) => (
                        <span key={item} className="typed text-fg">
                          {item}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
