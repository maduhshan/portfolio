/**
 * The four corner marks of a viewfinder's focus frame. The only decorative
 * mark on the site, and the same shape the cursor reticle draws when it locks.
 */
export function FocusBrackets({ inset = 0 }: { inset?: number }) {
  const corners = [
    'left-0 top-0 border-l border-t',
    'right-0 top-0 border-r border-t',
    'left-0 bottom-0 border-l border-b',
    'right-0 bottom-0 border-r border-b',
  ]

  return (
    <span aria-hidden className="pointer-events-none absolute" style={{ inset: -inset }}>
      {corners.map((corner) => (
        <span
          key={corner}
          className={`border-rule-strong absolute size-3.5 ${corner}`}
        />
      ))}
    </span>
  )
}
