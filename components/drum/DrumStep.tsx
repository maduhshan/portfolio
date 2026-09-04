'use client'

/**
 * Turning the drum without the scroll wheel.
 *
 * A pair of buttons on the right edge of the stage: one face back, one face on.
 * Someone on a trackpad, a keyboard, or anyone who would rather click than
 * scroll gets the same access to the wheel as everyone else.
 *
 * These step, so they animate: a single face turning is worth watching, unlike
 * the skip button's jump across the whole runway. Each end disables its own
 * button rather than wrapping around, because a drum that silently jumps from
 * the last project back to the first loses the reader's place.
 */
export function DrumStep({
  front,
  count,
  onSeek,
  label,
}: {
  front: number
  count: number
  onSeek: (index: number) => void
  /** What is being stepped through, for the button names. */
  label: string
}) {
  return (
    <div className="drum-step" role="group" aria-label={`Move through ${label}`}>
      <button
        type="button"
        className="drum-step__button"
        onClick={() => onSeek(front - 1)}
        disabled={front <= 0}
        aria-label={`Previous ${label}`}
      >
        <Chevron up />
      </button>
      <button
        type="button"
        className="drum-step__button"
        onClick={() => onSeek(front + 1)}
        disabled={front >= count - 1}
        aria-label={`Next ${label}`}
      >
        <Chevron />
      </button>
    </div>
  )
}

function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      style={{ rotate: up ? '180deg' : undefined }}
    >
      <path d="M4.5 6.5 8 10l3.5-3.5" strokeWidth="1.5" />
    </svg>
  )
}
