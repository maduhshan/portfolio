'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { Frame } from '@/lib/types'

/**
 * Varied scale, so the strongest frames get more room. The rhythm repeats every
 * six items and featured frames are promoted, which keeps a wall of
 * photographs from reading as a contact sheet of equal squares.
 */
const RHYTHM = [
  { span: 7, aspect: '3 / 2' },
  { span: 5, aspect: '4 / 5' },
  { span: 4, aspect: '1 / 1' },
  { span: 8, aspect: '16 / 9' },
  { span: 6, aspect: '4 / 3' },
  { span: 6, aspect: '3 / 2' },
]

const shapeFor = (frame: Frame, index: number) => {
  const base = RHYTHM[index % RHYTHM.length]
  return frame.featured ? { span: Math.max(base.span, 8), aspect: '3 / 2' } : base
}

export function Gallery({ frames }: { frames: Frame[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  // <dialog> restores focus on its own only when the trigger had focus. A
  // pointer user clicking a frame did not, so put focus back explicitly.
  const close = useCallback(() => {
    setOpenIndex(null)
    triggerRef.current?.focus()
  }, [])
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) =>
        current === null ? current : (current + delta + frames.length) % frames.length,
      ),
    [frames.length],
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (openIndex !== null) {
      if (!dialog.open) dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else {
      if (dialog.open) dialog.close()
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [openIndex])

  const active = openIndex === null ? null : frames[openIndex]

  return (
    <>
      <ul className="gallery">
        {frames.map((frame, index) => {
          const shape = shapeFor(frame, index)
          return (
            <li key={frame.id} style={{ '--span': shape.span } as React.CSSProperties}>
              <button
                type="button"
                className="block w-full cursor-pointer text-left"
                onClick={(event) => {
                  triggerRef.current = event.currentTarget
                  setOpenIndex(index)
                }}
              >
                <span
                  data-focus-target
                  className="relative block w-full overflow-hidden"
                  style={{ aspectRatio: shape.aspect }}
                >
                  <Image
                    src={frame.src}
                    alt={frame.caption}
                    fill
                    sizes="(max-width: 768px) 92vw, 55vw"
                    placeholder={frame.blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={frame.blurDataURL}
                    className="object-cover"
                  />
                </span>
                <span className="sr-only">Open this photograph</span>
              </button>

              <p className="text-muted mt-3 max-w-prose text-small">
                {frame.species ? <em>{frame.species}</em> : null}
                {frame.species ? ' ' : null}
                {frame.caption}
              </p>
            </li>
          )
        })}
      </ul>

      <dialog
        ref={dialogRef}
        className="lightbox"
        aria-label="Photograph"
        onClose={close}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            step(1)
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            step(-1)
          }
        }}
        style={
          active?.tint
            ? ({ '--scrim': `color-mix(in oklab, ${active.tint} 14%, #0b0d0c)` } as React.CSSProperties)
            : undefined
        }
      >
        {active ? (
          <div data-ground="hide" className="flex h-full flex-col bg-transparent">
            <div className="shell flex items-center justify-between py-4">
              <p className="label">
                {String((openIndex ?? 0) + 1).padStart(2, '0')} of{' '}
                {String(frames.length).padStart(2, '0')}
              </p>
              <button type="button" className="meta text-fg nav-item px-2 py-1" onClick={close}>
                close
              </button>
            </div>

            <div className="relative min-h-0 flex-1">
              <Image
                key={active.id}
                src={active.src}
                alt={active.caption}
                fill
                sizes="94vw"
                placeholder={active.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={active.blurDataURL}
                className="object-contain"
              />
            </div>

            <div className="shell flex flex-wrap items-end justify-between gap-x-8 gap-y-4 py-5">
              <p className="text-small max-w-prose">
                {active.species ? <em>{active.species}</em> : null}
                {active.species ? ' ' : null}
                {active.caption}
                {active.location ? <span className="meta ml-3">{active.location}</span> : null}
              </p>

              <div className="flex items-center gap-6">
                {active.href ? (
                  <a
                    className="link meta"
                    href={active.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    On Instagram
                  </a>
                ) : null}
                {frames.length > 1 ? (
                  <>
                    <button
                      type="button"
                      className="meta text-fg nav-item px-2 py-1"
                      onClick={() => step(-1)}
                    >
                      previous
                    </button>
                    <button
                      type="button"
                      className="meta text-fg nav-item px-2 py-1"
                      onClick={() => step(1)}
                    >
                      next
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  )
}
