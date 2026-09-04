import type { PortableTextBlock } from './types'

type Span = { _type?: string; text?: string }

/** Plain text for metadata and OG descriptions. */
export function toPlainText(blocks: PortableTextBlock[] | undefined): string {
  if (!blocks?.length) return ''
  return blocks
    .map((block) => {
      const candidate = block as unknown as { _type?: string; children?: Span[] }
      if (candidate._type !== 'block' || !Array.isArray(candidate.children)) return ''
      return candidate.children.map((child) => child.text ?? '').join('')
    })
    .filter(Boolean)
    .join(' ')
    .trim()
}

export function excerpt(text: string, max = 160): string {
  if (text.length <= max) return text
  return `${text.slice(0, text.lastIndexOf(' ', max - 1)).trimEnd()}…`
}
