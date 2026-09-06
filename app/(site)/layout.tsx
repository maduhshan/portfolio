import { HashLanding } from '@/components/HashLanding'
import { FocusCursor } from '@/components/cursor/FocusCursor'
import { PageResolve } from '@/components/PageResolve'
import { SiteFooter } from '@/components/SiteFooter'
import { hiddenSections } from '@/components/nav/navItems'
import { SiteNav } from '@/components/nav/SiteNav'
import { getLife, getRecommendations, getSiteSettings } from '@/lib/content'
import { navAvailability, socialLinks } from '@/lib/links'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, recommendations, life] = await Promise.all([
    getSiteSettings(),
    getRecommendations(),
    getLife(),
  ])

  const hidden = hiddenSections({ life, recommendations })

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <SiteNav
        name={settings.name}
        availability={navAvailability(settings.availabilityStatus)}
        socials={socialLinks(settings, ['github'])}
        omit={hidden}
      />
      <FocusCursor />
      <HashLanding />
      <PageResolve>
        <main id="main">{children}</main>
      </PageResolve>
      <SiteFooter settings={settings} />
    </>
  )
}
