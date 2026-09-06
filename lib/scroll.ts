/**
 * How far below the top of the viewport a scroll target should come to rest.
 *
 * The browser adds two things together: the scroll container's own padding,
 * which is what keeps every anchor on this site clear of the fixed header, and
 * whatever margin the target asks for on top of that. Reading only the margin
 * lands the target underneath the header. Setting both to the same value, as
 * this site did, lands it twice as far down as intended.
 *
 * So the padding on `html` is the one place the header height is expressed, and
 * anything scrolling by hand asks here rather than reading half of the answer.
 */
export function scrollInset(target: Element) {
  const container = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
  const own = parseFloat(getComputedStyle(target).scrollMarginTop) || 0
  return container + own
}
