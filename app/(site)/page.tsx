import type { Metadata } from 'next'

import { Section } from '@/components/Section'
import { About } from '@/components/sections/About'
import { Career } from '@/components/sections/Career'
import { Contact } from '@/components/sections/Contact'
import { Photography } from '@/components/sections/Photography'
import { Hero } from '@/components/sections/Hero'
import { Work } from '@/components/sections/Work'
import { Blog } from '@/components/sections/Blog'
import { getProjects, getRoles, getSiteSettings } from '@/lib/content'
import { getFrames, heroFrame } from '@/lib/gallery'
import { mediumProfileUrl, socialLinks } from '@/lib/links'
import { excerpt } from '@/lib/portable-text'
import { siteUrl } from '@/lib/site-url'
import { getBlogEntries } from '@/lib/blog'

/** ISR backstop. Sanity webhooks revalidate by tag well before this. */
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const description = excerpt(settings.headline, 155)
  return {
    description,
    openGraph: {
      type: 'profile',
      url: siteUrl,
      title: settings.name,
      description,
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function HomePage() {
  const settings = await getSiteSettings()
  const [roles, projects, gallery, entries] = await Promise.all([
    getRoles(),
    getProjects(),
    // Deep enough that a pinned post from a couple of years back is in the
    // set. Only the grid's worth is rendered.
    getFrames(60),
    getBlogEntries(settings.mediumHandle),
  ])

  const currentRole = roles.find((role) => role.endDate === null) ?? roles[0] ?? null

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: settings.name,
    url: siteUrl,
    email: `mailto:${settings.email}`,
    jobTitle: currentRole?.title,
    worksFor: currentRole ? { '@type': 'Organization', name: currentRole.company } : undefined,
    description: settings.headline,
    sameAs: socialLinks(settings).map((link) => link.href),
    knowsAbout: [
      'Event-driven systems',
      'Payments infrastructure',
      'Apache Kafka',
      'Go',
      'Java',
      'Spring Boot',
      'Google Cloud Platform',
      'Amazon Web Services',
      'Wildlife photography',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <Hero settings={settings} frame={heroFrame(settings, gallery.frames[0] ?? null)} />
      <About settings={settings} />
      <Section id="career" index="01" title="Career">
        <Career roles={roles} />
      </Section>
      <Section id="work" index="02" title="Selected work">
        <Work projects={projects} />
      </Section>
      <Photography
        frames={gallery.frames}
        instagram={settings.instagram}
        pinned={settings.pinnedPosts}
      />
      <Blog entries={entries} profileUrl={mediumProfileUrl(settings.mediumHandle)} />
      <Contact settings={settings} />
    </>
  )
}
