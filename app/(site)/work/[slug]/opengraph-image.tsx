import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { ImageResponse } from 'next/og'

import { getProject } from '@/lib/content'
import { OG_SIZE, OgCard } from '@/lib/og'
import { excerpt, toPlainText } from '@/lib/portable-text'

export const alt = 'Case study'
export const size = OG_SIZE
export const contentType = 'image/png'

export default async function ProjectOpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [project, mono] = await Promise.all([
    getProject(slug),
    readFile(fileURLToPath(new URL('../../../../assets/ibm-plex-mono-400.woff', import.meta.url))),
  ])

  return new ImageResponse(
    <OgCard
      label={project?.organisation ?? 'case study'}
      title={project?.title ?? 'Case study'}
      subtitle={project ? excerpt(toPlainText(project.problem), 130) : undefined}
      footer={project?.period}
    />,
    { ...size, fonts: [{ name: 'IBM Plex Mono', data: mono, style: 'normal', weight: 400 }] },
  )
}
