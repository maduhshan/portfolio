/**
 * The shared Open Graph card. Monochrome, framed by the same corner brackets
 * the site uses, and set entirely in IBM Plex Mono — a spec plate rather than a
 * hero image, because the photographs belong on the site, not on a social card.
 */
export const OG_SIZE = { width: 1200, height: 630 }

const PAPER = '#e7e8e5'
const INK = '#141715'
const GRAPHITE = '#5b615d'
const RULE = 'rgba(20, 23, 21, 0.22)'

export function OgCard({
  title,
  subtitle,
  label,
  footer,
}: {
  title: string
  subtitle?: string
  label: string
  footer?: string
}) {
  const bracket = (position: Record<string, number>, borders: Record<string, string>) => ({
    position: 'absolute' as const,
    width: 26,
    height: 26,
    ...position,
    ...borders,
  })

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: PAPER,
        color: INK,
        fontFamily: 'IBM Plex Mono',
        padding: 56,
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          height: '100%',
          border: `1px solid ${RULE}`,
          padding: 56,
        }}
      >
        <div style={bracket({ top: -9, left: -9 }, { borderTop: `2px solid ${INK}`, borderLeft: `2px solid ${INK}` })} />
        <div style={bracket({ top: -9, right: -9 }, { borderTop: `2px solid ${INK}`, borderRight: `2px solid ${INK}` })} />
        <div style={bracket({ bottom: -9, left: -9 }, { borderBottom: `2px solid ${INK}`, borderLeft: `2px solid ${INK}` })} />
        <div style={bracket({ bottom: -9, right: -9 }, { borderBottom: `2px solid ${INK}`, borderRight: `2px solid ${INK}` })} />

        <div style={{ display: 'flex', fontSize: 20, letterSpacing: 2, color: GRAPHITE }}>
          {label}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: title.length > 28 ? 62 : 78, lineHeight: 1.05 }}>
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                display: 'flex',
                marginTop: 22,
                fontSize: 26,
                lineHeight: 1.4,
                color: GRAPHITE,
                maxWidth: 880,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 20,
            color: GRAPHITE,
            borderTop: `1px solid ${RULE}`,
            paddingTop: 22,
          }}
        >
          <span>{footer ?? 'madushan chathuranga'}</span>
          <span>@_wild_diary</span>
        </div>
      </div>
    </div>
  )
}
