import { groq } from 'next-sanity'

const imageFields = groq`
  alt,
  asset->{
    _id,
    url,
    metadata { lqip, dimensions, palette { dominant { background } } }
  }
`

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{
    name, headline, bio, stats, industries, positioning, competencies, caseStudyLabels,
    availabilityStatus, availabilityDetail, calendarLink,
    email, whatsapp, linkedin, github, instagram, mediumHandle,
    pinnedPosts,
    heroNote,
    heroImage{credit, ${imageFields}},
    "cvUrl": cvFile.asset->url
  }
`

export const rolesQuery = groq`
  *[_type == "role"] | order(order asc){
    _id, company, companyUrl, title, location, startDate, endDate, summary, highlights, order
  }
`

export const projectsQuery = groq`
  *[_type == "project"] | order(order asc){
    _id, title, "slug": slug.current, organisation, period, featured, order, stack,
    productUrl, productName,
    coverImage{${imageFields}}
  }
`

export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, organisation, period, featured, order, stack,
    productUrl, productName,
    problem, whatIDid, impact,
    coverImage{${imageFields}}
  }
`

export const projectSlugsQuery = groq`
  *[_type == "project" && defined(slug.current)][].slug.current
`

export const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    _id, title, "slug": slug.current, publishedAt, category, topics, excerpt, body
  }
`

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0]{
    _id, title, "slug": slug.current, publishedAt, category, topics, excerpt, body
  }
`

export const photosQuery = groq`
  *[_type == "photo"] | order(order asc){
    _id, caption, location, species, featured, order,
    image{${imageFields}}
  }
`
