/**
 * The sign that a box opens something.
 *
 * Rows here have been stretched links for a while, so the whole box was always
 * clickable — there was just nothing telling you so. This is that: a quiet
 * label and a ring, muted until the pointer or keyboard reaches the row, then
 * full ink.
 *
 * Decorative, and hidden from assistive technology: the link inside the row
 * already carries the accessible name, and a screen reader announcing "case
 * study" twice per project helps nobody.
 */
export function OpenCue({
  label,
  external = false,
}: {
  label: string
  /** Diagonal for anything that leaves the site, straight for anything that does not. */
  external?: boolean
}) {
  return (
    <span className="open-cue" aria-hidden="true">
      <span className="open-cue__label">{label}</span>
      <span className="open-cue__ring">
        <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor">
          {external ? (
            <>
              <path d="M5 11 11 5" strokeWidth="1.4" />
              <path d="M6 5h5v5" strokeWidth="1.4" />
            </>
          ) : (
            <>
              <path d="M3 8h9" strokeWidth="1.4" />
              <path d="M8.5 4.5 12 8l-3.5 3.5" strokeWidth="1.4" />
            </>
          )}
        </svg>
      </span>
    </span>
  )
}
