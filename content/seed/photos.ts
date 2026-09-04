import type { Photo } from '@/lib/types'

/**
 * Manual curation, and the fallback the gallery uses when Instagram is
 * unavailable. Empty until photographs are uploaded at /studio — the gallery
 * renders an honest empty state and a link to Instagram rather than filler.
 *
 * TODO(madushan): upload a dozen frames in Studio. They are the only colour on
 * the site, and the only thing here that cannot be written for you.
 */
export const seedPhotos: Photo[] = []
