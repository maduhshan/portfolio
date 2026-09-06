import {
  seedLife,
  seedPhotos,
  seedPosts,
  seedProjects,
  seedRecommendations,
  seedRoles,
  seedSettings,
} from '@/content/seed'

import { sanityFetch } from './sanity/client'
import {
  lifeQuery,
  photosQuery,
  postBySlugQuery,
  postsQuery,
  projectBySlugQuery,
  projectSlugsQuery,
  projectsQuery,
  recommendationsQuery,
  rolesQuery,
  siteSettingsQuery,
} from './sanity/queries'
import type {
  Life,
  Photo,
  Post,
  Project,
  ProjectSummary,
  Recommendation,
  Role,
  SiteSettings,
} from './types'

/**
 * The one place the site reads content from.
 *
 * Sanity is the source of truth. When it is unreachable — or simply not
 * configured yet — each getter falls back to the seed documents in
 * `content/seed/`, which are the same documents `npm run seed` pushes into
 * Sanity. Components never see the difference, so nothing in the component
 * tree is coupled to the CMS being up.
 *
 * Cache tags match Sanity document types, so /api/revalidate can invalidate
 * exactly what changed.
 */

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await sanityFetch<SiteSettings | null>({
    query: siteSettingsQuery,
    tags: ['siteSettings'],
  })
  return doc ?? seedSettings
}

export async function getRoles(): Promise<Role[]> {
  const docs = await sanityFetch<Role[]>({ query: rolesQuery, tags: ['role'] })
  return docs?.length ? docs : seedRoles
}

export async function getProjects(): Promise<ProjectSummary[]> {
  const docs = await sanityFetch<ProjectSummary[]>({ query: projectsQuery, tags: ['project'] })
  return docs?.length ? docs : seedProjects
}

export async function getProject(slug: string): Promise<Project | null> {
  const doc = await sanityFetch<Project | null>({
    query: projectBySlugQuery,
    params: { slug },
    tags: ['project'],
  })
  return doc ?? seedProjects.find((project) => project.slug === slug) ?? null
}

export async function getProjectSlugs(): Promise<string[]> {
  const slugs = await sanityFetch<string[]>({ query: projectSlugsQuery, tags: ['project'] })
  return slugs?.length ? slugs : seedProjects.map((project) => project.slug)
}

export async function getPosts(): Promise<Post[]> {
  const docs = await sanityFetch<Post[]>({ query: postsQuery, tags: ['post'] })
  return docs?.length ? docs : seedPosts
}

export async function getPost(slug: string): Promise<Post | null> {
  const doc = await sanityFetch<Post | null>({
    query: postBySlugQuery,
    params: { slug },
    tags: ['post'],
  })
  return doc ?? seedPosts.find((post) => post.slug === slug) ?? null
}

export async function getPhotos(): Promise<Photo[]> {
  const docs = await sanityFetch<Photo[]>({ query: photosQuery, tags: ['photo'] })
  return docs?.length ? docs : seedPhotos
}

/**
 * His own account of himself. A singleton, so it is either written or it is not:
 * there is no half of it worth showing, and every caller treats null as "the
 * section does not exist yet" rather than rendering an empty shell.
 */
export async function getLife(): Promise<Life | null> {
  const doc = await sanityFetch<Life | null>({ query: lifeQuery, tags: ['life'] })
  const written = Boolean(doc?.intro?.trim() || doc?.body?.length || doc?.photos?.length)
  return written ? doc : seedLife
}

export async function getRecommendations(): Promise<Recommendation[]> {
  const docs = await sanityFetch<Recommendation[]>({
    query: recommendationsQuery,
    tags: ['recommendation'],
  })
  return docs?.length ? docs : seedRecommendations
}
