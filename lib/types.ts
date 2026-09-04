import type { PortableTextBlock } from '@portabletext/types'

export type { PortableTextBlock }

export type SanityImage = {
  alt?: string
  asset?: {
    _id?: string
    url: string
    metadata?: {
      lqip?: string
      dimensions?: { width: number; height: number; aspectRatio?: number }
      palette?: { dominant?: { background?: string } }
    }
  }
}

export type Role = {
  _id: string
  company: string
  companyUrl?: string
  title: string
  location: string
  /** ISO date. */
  startDate: string
  /** ISO date, or null while he is still there. */
  endDate: string | null
  summary?: string
  highlights?: string[]
  order: number
}

export type ProjectSummary = {
  _id: string
  title: string
  slug: string
  organisation: string
  period: string
  featured: boolean
  order: number
  stack: string[]
  /** A live third-party product. Linked, never embedded. */
  productUrl?: string
  productName?: string
  coverImage?: SanityImage | null
}

export type Project = ProjectSummary & {
  problem: PortableTextBlock[]
  whatIDid: PortableTextBlock[]
  impact: PortableTextBlock[]
}

export type Photo = {
  _id: string
  caption: string
  location?: string
  /** Binomial name. Set in italic, field-guide style. */
  species?: string
  featured: boolean
  order: number
  image?: SanityImage | null
}

export type Stat = { value: string; label: string }
export type Competency = { area: string; items: string[] }

export type AvailabilityStatus =
  | 'Available for consulting'
  | 'Open to selected work'
  | 'Not currently available'

/** A post written here, in Sanity. */
export type BlogCategory = 'Technology' | 'Misc'

/** A post written here, in Sanity. */
export type Post = {
  _id: string
  title: string
  slug: string
  publishedAt: string
  category?: BlogCategory
  topics?: string[]
  excerpt?: string
  body: PortableTextBlock[]
}

/**
 * One entry in the blog index, from either source. Medium carries the technical
 * writing; anything written on this site comes from Sanity.
 */
export type BlogEntry = {
  slug: string
  title: string
  publishedAt: string
  topics: string[]
  excerpt: string
  readingMinutes: number
  category: BlogCategory
  source: 'medium' | 'here'
  /** Set for Medium entries. The canonical original. */
  externalUrl?: string
}

export type SiteSettings = {
  name: string
  headline: string
  /** The second line of the opening. The other half of what he does. */
  /** Post URLs to pull to the front of the Instagram grid, in order. */
  pinnedPosts?: string[]
  heroNote?: string
  /** The opening photograph. Its own slot, not the first frame of the gallery. */
  heroImage?: (SanityImage & { credit?: string }) | null
  bio: PortableTextBlock[]
  stats?: Stat[]
  industries?: string[]
  positioning?: PortableTextBlock[]
  competencies?: Competency[]
  availabilityStatus?: AvailabilityStatus
  availabilityDetail?: string
  calendarLink?: string
  email: string
  whatsapp?: string
  linkedin?: string
  github?: string
  instagram?: string
  mediumHandle?: string
  cvUrl?: string | null
}

/** A photograph in the gallery, from either Instagram or Sanity. */
export type Frame = {
  id: string
  src: string
  caption: string
  href?: string
  species?: string
  location?: string
  featured: boolean
  width?: number
  height?: number
  blurDataURL?: string
  /** Sampled from the photograph itself. The only colour the UI ever uses. */
  tint?: string
  source: 'instagram' | 'sanity'
  takenAt?: string
}
