import type { MarkName } from '@/components/icons'

import type { SiteSettings } from './types'

export type ExternalLink = { label: string; href: string; mark: MarkName }

/**
 * Only what actually exists. Missing links are omitted, never invented.
 * GitHub sits beside LinkedIn as a peer, not after the photography.
 *
 * `omit` is for the places that carry a shorter set: GitHub belongs in the
 * contact section and nowhere else.
 */
export function socialLinks(settings: SiteSettings, omit: MarkName[] = []): ExternalLink[] {
  const links: ExternalLink[] = []
  if (settings.linkedin) links.push({ label: 'LinkedIn', href: settings.linkedin, mark: 'linkedin' })
  if (settings.github) links.push({ label: 'GitHub', href: settings.github, mark: 'github' })
  if (settings.instagram)
    links.push({ label: 'Instagram', href: settings.instagram, mark: 'instagram' })
  if (settings.mediumHandle) {
    links.push({
      label: 'Medium',
      href: `https://medium.com/@${settings.mediumHandle}`,
      mark: 'medium',
    })
  }
  return omit.length > 0 ? links.filter((link) => !omit.includes(link.mark)) : links
}

export function mediumProfileUrl(handle?: string): string | null {
  return handle ? `https://medium.com/@${handle}` : null
}

/** wa.me wants digits and nothing else. The stored number stays readable. */
export function whatsappLink(number?: string): string | null {
  if (!number) return null
  const digits = number.replace(/\D/g, '')
  return digits.length >= 8 ? `https://wa.me/${digits}` : null
}

/** "https://instagram.com/_wild_diary" -> "@_wild_diary" */
export function instagramHandle(url?: string): string | null {
  if (!url) return null
  const match = url.match(/instagram\.com\/([^/?#]+)/)
  return match ? `@${match[1]}` : null
}

/**
 * The short label beside the name in the navigation.
 *
 * "Not currently available" returns nothing on purpose: a site that announces
 * unavailability in its header is doing itself no favours, so the indicator
 * simply steps out of the way until there is something worth saying.
 */
export function navAvailability(status?: SiteSettings['availabilityStatus']): string | undefined {
  if (!status || status === 'Not currently available') return undefined
  return status.toLowerCase()
}
