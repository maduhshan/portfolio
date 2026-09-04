import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { ImageResponse } from 'next/og'

import { OG_SIZE, OgCard } from '@/lib/og'
import { excerpt } from '@/lib/portable-text'
import { getSiteSettings } from '@/lib/content'

export const alt = 'Madushan Chathuranga — distributed systems, data platforms, wildlife photography'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function OpengraphImage() {
  const [settings, mono] = await Promise.all([
    getSiteSettings(),
    readFile(fileURLToPath(new URL('../assets/ibm-plex-mono-400.woff', import.meta.url))),
  ])

  return new ImageResponse(
    <OgCard label="portfolio" title={settings.name} subtitle={excerpt(settings.headline, 120)} />,
    {
      ...size,
      fonts: [{ name: 'IBM Plex Mono', data: mono, style: 'normal', weight: 400 }],
    },
  )
}
