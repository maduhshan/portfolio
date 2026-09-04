import { marks } from '@/components/icons'
import { socialLinks } from '@/lib/links'
import type { SiteSettings } from '@/lib/types'

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const links = socialLinks(settings, ['github'])
  const year = new Date().getFullYear()

  return (
    <footer data-ground="hide" className="bg-ground text-fg border-rule border-t">
      <div className="shell flex flex-col gap-8 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label">write to me</p>
          <a className="link mt-2 inline-block text-t3 wrap-anywhere" href={`mailto:${settings.email}`}>
            {settings.email}
          </a>
        </div>

        {links.length > 0 ? (
          <nav aria-label="Elsewhere">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {links.map((link) => {
                const Mark = marks[link.mark]
                return (
                  <li key={link.href}>
                    <a
                      className="link meta inline-flex items-center gap-2"
                      href={link.href}
                      rel="me noopener noreferrer"
                      target="_blank"
                    >
                      <Mark />
                      {link.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </nav>
        ) : null}
      </div>

      <div className="shell">
        <div className="border-rule flex flex-col gap-2 border-t py-6 sm:flex-row sm:justify-between">
          <p className="meta">
            Set in Newsreader and IBM Plex Mono. Every photograph here is mine.
          </p>
          <p className="meta">
            {settings.name}, {year}
          </p>
        </div>
      </div>
    </footer>
  )
}
