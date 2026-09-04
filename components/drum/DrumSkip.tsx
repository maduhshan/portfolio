/**
 * The way past a drum.
 *
 * Eight projects is roughly four screens of scrolling, and not everyone wants
 * all of them. A real anchor rather than a scripted scroll, so it works with
 * JavaScript off and lands on the target's own scroll margin.
 *
 * Hidden entirely unless the drum is actually turning: with the flat list
 * there is nothing to skip.
 */
export function DrumSkip({ to, label }: { to: string; label: string }) {
  return (
    <a className="drum-skip" href={to} aria-label={label}>
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" aria-hidden="true">
        <path d="M8 3v9" strokeWidth="1.4" />
        <path d="M4.5 8.5 8 12l3.5-3.5" strokeWidth="1.4" />
      </svg>
    </a>
  )
}
