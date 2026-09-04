import 'server-only'

import { getPhotos } from './content'
import { getInstagramMedia } from './instagram'
import type { Frame, SiteSettings } from './types'

/**
 * The opening photograph. It comes from its own field rather than from the
 * gallery, so the gallery stays what it says it is.
 */
export function heroFrame(settings: SiteSettings, fallback: Frame | null): Frame | null {
  const image = settings.heroImage
  const url = image?.asset?.url
  if (!url) return fallback

  return {
    id: 'hero',
    src: url,
    caption: image?.alt ?? '',
    location: image?.credit,
    featured: true,
    blurDataURL: image?.asset?.metadata?.lqip,
    width: image?.asset?.metadata?.dimensions?.width,
    height: image?.asset?.metadata?.dimensions?.height,
    source: 'sanity',
  }
}

/** The post id in an Instagram permalink: .../p/<code>/ */
function shortcode(url?: string): string | null {
  if (!url) return null
  const match = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
  return match ? match[1] : url.trim() || null
}

/**
 * The subset for the home page, in display order.
 *
 * Instagram does not expose Story Highlights or pinned posts through the API —
 * /me/media returns posts newest first and nothing else. So the order is chosen
 * here: URLs listed in `pinnedPosts` come first in the order given, then
 * anything flagged featured in Sanity, then the rest by date. Sorting is stable,
 * so original order survives inside each group.
 */
export function curatedFrames(frames: Frame[], count = 12, pinned: string[] = []): Frame[] {
  const order = pinned.map((entry) => shortcode(entry)).filter((code): code is string => !!code)

  const rank = (frame: Frame) => {
    const code = shortcode(frame.href)
    const index = code ? order.indexOf(code) : -1
    if (index >= 0) return index
    return order.length + (frame.featured ? 0 : 1)
  }

  return [...frames].sort((a, b) => rank(a) - rank(b)).slice(0, count)
}

/**
 * One list of frames for the gallery, from Instagram when it answers and from
 * Sanity when it does not. Callers never learn which — the gallery is simply
 * never empty because a token lapsed.
 */
export async function getFrames(limit = 24): Promise<{
  frames: Frame[]
  source: 'instagram' | 'sanity' | 'none'
}> {
  const media = await getInstagramMedia(limit)

  if (media.length > 0) {
    return {
      source: 'instagram',
      frames: media.map((item, index) => ({
        id: item.id,
        src: item.media_url ?? item.thumbnail_url ?? '',
        caption: cleanCaption(item.caption) || 'Wildlife photograph',
        href: item.permalink,
        featured: index === 0,
        source: 'instagram' as const,
        takenAt: item.timestamp,
      })),
    }
  }

  const photos = await getPhotos()
  if (photos.length === 0) return { frames: [], source: 'none' }

  return {
    source: 'sanity',
    frames: photos
      .filter((photo) => photo.image?.asset?.url)
      .map((photo) => {
        const asset = photo.image?.asset
        return {
          id: photo._id,
          src: asset?.url ?? '',
          caption: photo.caption,
          species: photo.species,
          location: photo.location,
          featured: photo.featured,
          width: asset?.metadata?.dimensions?.width,
          height: asset?.metadata?.dimensions?.height,
          blurDataURL: asset?.metadata?.lqip,
          // The one colour the interface ever uses is taken from the
          // photograph itself.
          tint: asset?.metadata?.palette?.dominant?.background,
          source: 'sanity' as const,
        }
      }),
  }
}

/**
 * Instagram captions carry hashtag blocks. The first paragraph is the caption;
 * the tags are noise on a page that is already quiet.
 */
function cleanCaption(caption?: string): string {
  if (!caption) return ''
  const withoutTags = caption
    .split('\n')
    .filter((line) => !/^\s*(#\w+\s*)+$/.test(line))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  return withoutTags.length > 180
    ? `${withoutTags.slice(0, withoutTags.lastIndexOf(' ', 179))}…`
    : withoutTags
}
