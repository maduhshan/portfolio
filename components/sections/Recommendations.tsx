'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Section } from '@/components/Section'
import { formatDate } from '@/lib/format'
import type { Recommendation } from '@/lib/types'

/**
 * What people say.
 *
 * Laid out the way LinkedIn lays them out, because that is where they were
 * written and the shape is already familiar: who said it, what they did, then
 * the date and how they knew you, then the words. That relationship line is the
 * part that gives a recommendation its weight, so it sits above the quote
 * rather than being tucked underneath.
 *
 * One at a time, moving sideways. The drums elsewhere turn on a vertical axis
 * because scrolling drives them; these are chosen deliberately with the arrows,
 * so they move along the axis the arrows point and leave the page scroll alone.
 *
 * A long one is clamped with a "more" that opens it in full. Which ones need it
 * is measured rather than guessed from a character count, so it stays right at
 * any width and in any typeface.
 *
 * LinkedIn publishes no API for recommendations, so these come from Sanity,
 * copied across by hand. The section hides itself entirely when there are none.
 */

/** Lines shown before a recommendation is clamped. */
const CLAMP_LINES = 7

export function Recommendations({
  items,
  profileUrl,
}: {
  items: Recommendation[]
  /** The LinkedIn profile these were left on. */
  profileUrl?: string | null
}) {
  const ordered = [...items].sort((a, b) => a.order - b.order)
  const count = ordered.length

  // LinkedIn keeps recommendations on their own tab of the profile. Derived
  // rather than stored separately, so changing the profile in Studio moves
  // this with it.
  const onLinkedIn = profileUrl ? `${profileUrl.replace(/\/+$/, '')}/details/recommendations` : null

  const [at, setAt] = useState(0)
  const [clamped, setClamped] = useState<boolean[]>([])
  const [open, setOpen] = useState(false)
  /** What the dialog holds. Deliberately not cleared on close: the closing
   *  fade needs something to fade, and a panel that empties itself on the
   *  first frame reads as a bug rather than as an exit. */
  const [shown, setShown] = useState<Recommendation | null>(null)

  const bodies = useRef<(HTMLElement | null)[]>([])
  const dialogRef = useRef<HTMLDialogElement>(null)
  /** Which recommendation was opened, so focus can go back to its control.
   *  An id rather than the element: a re-render can replace that node, and
   *  focusing a detached one silently does nothing. */
  const opener = useRef<string | null>(null)

  /** Which bodies actually overflow their clamp, measured after layout. */
  useEffect(() => {
    const measure = () =>
      setClamped(
        bodies.current.map((body) => (body ? body.scrollHeight > body.clientHeight + 1 : false)),
      )
    measure()
    const observer = new ResizeObserver(measure)
    for (const body of bodies.current) if (body) observer.observe(body)
    return () => observer.disconnect()
  }, [count])

  const close = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  if (count === 0) return null

  const go = (next: number) => setAt(Math.max(0, Math.min(next, count - 1)))

  const attribution = (item: Recommendation) => (
    <>
      <p className="says-name">
        {item.profileUrl ? (
          <a
            className="link-quiet"
            href={item.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.name}
          </a>
        ) : (
          item.name
        )}
      </p>
      {item.role || item.company ? (
        <p className="says-role">{[item.role, item.company].filter(Boolean).join(' at ')}</p>
      ) : null}
      {item.receivedOn || item.relationship ? (
        <p className="says-line">
          {[item.receivedOn ? formatDate(item.receivedOn) : null, item.relationship]
            .filter(Boolean)
            .join(', ')}
        </p>
      ) : null}
    </>
  )

  const paragraphs = (item: Recommendation) =>
    item.body.split(/\n{2,}/).map((paragraph, n) => (
      <p key={n} className={n > 0 ? 'mt-4' : undefined}>
        {paragraph}
      </p>
    ))

  return (
    <Section id="recommendations" index="05" title="What people say">
      <div
        className="says"
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') go(at - 1)
          if (event.key === 'ArrowRight') go(at + 1)
        }}
      >
        <p className="says-lede measure text-muted text-small">
          Industry leaders and colleagues I&rsquo;ve worked with have left some nice words about me
          on my LinkedIn profile.
          {onLinkedIn ? (
            <>
              {' '}
              <a className="link" href={onLinkedIn} target="_blank" rel="noopener noreferrer">
                Read them there
              </a>
            </>
          ) : null}
        </p>

        <div className="says-window">
          <ul className="says-track" style={{ '--at': at } as React.CSSProperties}>
            {ordered.map((item, index) => (
              <li key={item._id} className="says-item" data-said={item._id} inert={index !== at}>
                <figure className="says-card">
                  <figcaption className="says-head">{attribution(item)}</figcaption>

                  <blockquote
                    className="says-body"
                    style={{ '--lines': CLAMP_LINES } as React.CSSProperties}
                    ref={(node) => {
                      bodies.current[index] = node
                    }}
                  >
                    {paragraphs(item)}
                  </blockquote>

                  {clamped[index] ? (
                    <button
                      type="button"
                      className="says-more"
                      onClick={() => {
                        opener.current = item._id
                        setShown(item)
                        setOpen(true)
                      }}
                    >
                      more
                      <span className="sr-only"> of the recommendation from {item.name}</span>
                    </button>
                  ) : null}
                </figure>
              </li>
            ))}
          </ul>
        </div>

        <div className="says-controls">
          <button
            type="button"
            className="drum-step__button"
            onClick={() => go(at - 1)}
            disabled={at === 0}
            aria-label="Previous recommendation"
          >
            <Chevron back />
          </button>

          <ol className="says-pages">
            {ordered.map((item, index) => (
              <li key={item._id}>
                <button
                  type="button"
                  className="says-page"
                  onClick={() => go(index)}
                  aria-current={index === at ? 'true' : undefined}
                  aria-label={`Recommendation ${index + 1} of ${count}, from ${item.name}`}
                />
              </li>
            ))}
          </ol>

          <button
            type="button"
            className="drum-step__button"
            onClick={() => go(at + 1)}
            disabled={at === count - 1}
            aria-label="Next recommendation"
          >
            <Chevron />
          </button>

          <p className="label says-count" aria-hidden="true">
            {String(at + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Escape closes it for free, and a click that lands on the dialog itself
          rather than the panel inside is a click on the backdrop. */}
      <dialog
        ref={dialogRef}
        className="says-dialog"
        aria-label={shown ? `Recommendation from ${shown.name}` : undefined}
        onClick={(event) => {
          if (event.target === dialogRef.current) close()
        }}
        onClose={() => {
          setOpen(false)
          const id = opener.current
          opener.current = null
          if (id) {
            document
              .querySelector<HTMLElement>(`[data-said="${CSS.escape(id)}"] .says-more`)
              ?.focus()
          }
        }}
      >
        {shown ? (
          <div className="says-dialog__panel">
            <button type="button" className="says-close" onClick={close} aria-label="Close">
              <svg
                viewBox="0 0 16 16"
                width="13"
                height="13"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="m4 4 8 8M12 4l-8 8" strokeWidth="1.4" />
              </svg>
            </button>

            <figure className="says-card">
              <figcaption className="says-head">{attribution(shown)}</figcaption>
              <blockquote className="says-full">{paragraphs(shown)}</blockquote>
            </figure>
          </div>
        ) : null}
      </dialog>
    </Section>
  )
}

function Chevron({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      style={{ rotate: back ? '180deg' : undefined }}
    >
      <path d="M6.5 4.5 10 8l-3.5 3.5" strokeWidth="1.5" />
    </svg>
  )
}
