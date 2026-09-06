import { Section } from '@/components/Section'
import { WhatsAppMark, marks } from '@/components/icons'
import { socialLinks, whatsappLink } from '@/lib/links'
import type { SiteSettings } from '@/lib/types'

/** No form. An address, the kind of work that suits, and the places I already am. */
export function Contact({ index, settings }: { index: string; settings: SiteSettings }) {
  const links = socialLinks(settings)
  const whatsapp = whatsappLink(settings.whatsapp)
  const available = settings.availabilityStatus !== 'Not currently available'

  return (
    <Section id="contact" index={index} title="Contact" ground="hide">
      {settings.availabilityStatus ? (
        <p className="flex items-center gap-2">
          {available ? <span aria-hidden className="rounded-dot size-[5px] bg-current" /> : null}
          <span className="label">{settings.availabilityStatus.toLowerCase()}</span>
        </p>
      ) : null}

      {settings.availabilityDetail ? (
        <p className="measure mt-5 text-t3">{settings.availabilityDetail}</p>
      ) : null}

      <a
        className="link heading-1 mt-10 inline-block wrap-anywhere"
        href={`mailto:${settings.email}`}
      >
        {settings.email}
      </a>

      {whatsapp ? (
        <p className="mt-6">
          <a
            className="link text-small inline-flex items-center gap-2.5"
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppMark />
            {settings.whatsapp}
          </a>
        </p>
      ) : null}

      {settings.calendarLink ? (
        <p className="mt-6">
          <a
            className="link text-small"
            href={settings.calendarLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a time
          </a>
        </p>
      ) : null}

      {links.length > 0 ? (
        <ul className="border-rule mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t pt-8">
          {links.map((link) => {
            const Mark = marks[link.mark]
            return (
              <li key={link.href}>
                <a
                  className="link text-small inline-flex items-center gap-2.5"
                  href={link.href}
                  target="_blank"
                  rel="me noopener noreferrer"
                >
                  <Mark />
                  {link.label}
                </a>
              </li>
            )
          })}
        </ul>
      ) : null}
    </Section>
  )
}
