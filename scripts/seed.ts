/**
 * Pushes the seed documents in content/seed/ into Sanity.
 *
 * The same modules are the site's fallback content, so there is one source of
 * truth for the seeded facts: seed once, then edit at /studio and never touch
 * this repo for content again.
 *
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and a
 * write token in SANITY_API_WRITE_TOKEN.
 */
import { createClient } from '@sanity/client'
import { config } from 'dotenv'

import { seedPhotos } from '../content/seed/photos'
import { seedPosts } from '../content/seed/posts'
import { seedRecommendations } from '../content/seed/recommendations'
import { seedProjects } from '../content/seed/projects'
import { seedRoles } from '../content/seed/roles'
import { seedSettings } from '../content/seed/settings'

config({ path: '.env.local' })
config({ path: '.env' })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error(
    [
      'Cannot seed: Sanity is not configured.',
      !projectId && '  NEXT_PUBLIC_SANITY_PROJECT_ID is not set.',
      !token && '  SANITY_API_WRITE_TOKEN is not set (needs Editor rights).',
      '',
      'Put them in .env.local — see .env.example. The site runs without them,',
      'falling back to the same documents this script would push.',
    ]
      .filter(Boolean)
      .join('\n'),
  )
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: '2024-10-01',
  useCdn: false,
})

async function seed() {
  const transaction = client.transaction()

  transaction.createOrReplace({
    _id: 'siteSettings',
    _type: 'siteSettings',
    name: seedSettings.name,
    headline: seedSettings.headline,
    heroNote: seedSettings.heroNote,
    pinnedPosts: seedSettings.pinnedPosts,
    bio: seedSettings.bio,
    stats: seedSettings.stats,
    industries: seedSettings.industries,
    positioning: seedSettings.positioning,
    competencies: seedSettings.competencies,
    caseStudyLabels: seedSettings.caseStudyLabels,
    availabilityStatus: seedSettings.availabilityStatus,
    availabilityDetail: seedSettings.availabilityDetail,
    calendarLink: seedSettings.calendarLink,
    email: seedSettings.email,
    whatsapp: seedSettings.whatsapp,
    linkedin: seedSettings.linkedin,
    github: seedSettings.github,
    instagram: seedSettings.instagram,
    mediumHandle: seedSettings.mediumHandle,
    // heroImage is deliberately not seeded: images are binary uploads, not
    // documents. Upload the opening photograph at /studio.
  })

  for (const role of seedRoles) {
    transaction.createOrReplace({
      _id: role._id,
      _type: 'role',
      company: role.company,
      companyUrl: role.companyUrl,
      title: role.title,
      location: role.location,
      startDate: role.startDate,
      endDate: role.endDate ?? undefined,
      summary: role.summary,
      highlights: role.highlights ?? [],
      order: role.order,
    })
  }

  for (const project of seedProjects) {
    transaction.createOrReplace({
      _id: project._id,
      _type: 'project',
      title: project.title,
      slug: { _type: 'slug', current: project.slug },
      organisation: project.organisation,
      period: project.period,
      featured: project.featured,
      order: project.order,
      stack: project.stack,
      productUrl: project.productUrl,
      productName: project.productName,
      problem: project.problem,
      whatIDid: project.whatIDid,
      impact: project.impact,
    })
  }

  for (const post of seedPosts) {
    transaction.createOrReplace({
      _id: post._id,
      _type: 'post',
      title: post.title,
      slug: { _type: 'slug', current: post.slug },
      publishedAt: post.publishedAt,
      category: post.category,
      topics: post.topics ?? [],
      excerpt: post.excerpt,
      body: post.body,
    })
  }

  for (const photo of seedPhotos) {
    transaction.createOrReplace({
      _id: photo._id,
      _type: 'photo',
      caption: photo.caption,
      location: photo.location,
      species: photo.species,
      featured: photo.featured,
      order: photo.order,
    })
  }

  for (const said of seedRecommendations) {
    transaction.createOrReplace({
      _id: said._id,
      _type: 'recommendation',
      name: said.name,
      role: said.role,
      company: said.company,
      relationship: said.relationship,
      body: said.body,
      receivedOn: said.receivedOn,
      profileUrl: said.profileUrl,
      order: said.order,
    })
  }

  await transaction.commit()

  console.log(
    `Seeded ${dataset}: 1 siteSettings, ${seedRoles.length} roles, ${seedProjects.length} projects, ${seedPosts.length} posts, ${seedPhotos.length} photographs, ${seedRecommendations.length} recommendations.`,
  )
  console.log('Photographs still need uploading by hand at /studio — they are the one thing that cannot be seeded.')
  console.log('Recommendations too: LinkedIn has no API for them, so copy them into /studio yourself.')
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
