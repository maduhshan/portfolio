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
  { id: 'career', label: 'Career', href: '/#career' },
  { id: 'work', label: 'Work', href: '/#work' },
  { id: 'photography', label: 'Photography', href: '/#photography' },
  { id: 'blog', label: 'Blog', href: '/#blog' },
  { id: 'recommendations', label: 'Recommendations', href: '/#recommendations' },
  { id: 'contact', label: 'Contact', href: '/#contact' },
]
