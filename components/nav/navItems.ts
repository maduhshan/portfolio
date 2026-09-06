export type NavItem = {
  id: string
  label: string
  href: string
  /**
   * Whether it appears in the bar across the top. Everything here is tracked
   * for the address and listed in the menu; the bar is the one place with a
   * hard width budget, and a sixth item wraps the nameplate onto two lines.
   */
  inBar?: boolean
}

export const navItems: NavItem[] = [
  { id: 'life', label: 'Life', href: '/#life' },
  { id: 'career', label: 'Career', href: '/#career' },
  { id: 'work', label: 'Work', href: '/#work' },
  { id: 'photography', label: 'Photography', href: '/#photography' },
  { id: 'blog', label: 'Blog', href: '/#blog' },
  { id: 'recommendations', label: 'Recommendations', href: '/#recommendations' },
  { id: 'contact', label: 'Contact', href: '/#contact' },
]

/**
 * Sections with nothing in them yet. They appear neither on the page nor in the
 * navigation: an entry that scrolls to a heading which is not there is worse
 * than no entry at all.
 */
export function hiddenSections(content: { life: unknown; recommendations: unknown[] }) {
  return [
    ...(content.life ? [] : ['life']),
    ...(content.recommendations.length ? [] : ['recommendations']),
  ]
}

/**
 * The number set beside a section heading, and beside the same section in the
 * menu. Counted over what is actually shown, so hiding one renumbers the rest
 * instead of leaving a hole where it used to be.
 */
export function sectionNumber(hidden: string[]) {
  const shown = navItems.filter((item) => !hidden.includes(item.id))
  return (id: string) => String(shown.findIndex((item) => item.id === id) + 1).padStart(2, '0')
}
