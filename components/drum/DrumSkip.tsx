'use client'

/**
 * The way past a drum.
 *
 * One button, pointing whichever way the reader is already going: down while
 * they are descending the page, up once they turn around. Reversing it means
 * the button is always an exit rather than sometimes a way back into what they
 * just left.
 *
 * The jump is instant, not smooth. The page sets `scroll-behavior: smooth`, and
 * an animated scroll across a whole runway would spin the drum through every
 * face on the way — the opposite of skipping it. It also always lands on the
 * *start* of the target section, so a drum you arrive at is showing its first
 * item, never whichever face happens to sit at that scroll position.
 *
 * It stays a real anchor underneath, so with JavaScript off it still works.
 */
export function DrumSkip({
  up,
  down,
  upLabel,
  downLabel,
  direction,
}: {
  /** Section to land on when the reader is heading up the page. */
  up: string
  /** Section to land on when they are heading down. */
  down: string
  upLabel: string
  downLabel: string
  direction: 'down' | 'up'
}) {
  const goingUp = direction === 'up'
  const href = goingUp ? up : down

  function onClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const target = document.querySelector(href)
    if (!(target instanceof HTMLElement)) return
    event.preventDefault()
    // Mirror what the anchor would have done, minus the animation.
    const inset = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - inset,
      behavior: 'instant',
    })
  }

  return (
    <a
      className="drum-skip"
      href={href}
      aria-label={goingUp ? upLabel : downLabel}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 16 16"
        width="13"
        height="13"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
        style={{ rotate: goingUp ? '180deg' : undefined }}
      >
        <path d="M8 3v9" strokeWidth="1.4" />
        <path d="M4.5 8.5 8 12l3.5-3.5" strokeWidth="1.4" />
      </svg>
    </a>
  )
}
