import type { PortableTextBlock } from '@portabletext/types'

/**
 * Builds portable text for the seed documents. `**wrapped**` becomes a figure
 * mark, which renders as tabular mono inline — that is how numbers stay
 * glanceable without a stat block.
 */
export function pt(...paragraphs: string[]): PortableTextBlock[] {
  return paragraphs.map((text, index) => {
    const children = text
      .split('**')
      .map((part, i) => ({
        _type: 'span' as const,
        _key: `s${index}-${i}`,
        text: part,
        marks: i % 2 === 1 ? ['strong'] : [],
      }))
      .filter((span) => span.text.length > 0)

    return {
      _type: 'block',
      _key: `b${index}`,
      style: 'normal',
      markDefs: [],
      children,
    } as unknown as PortableTextBlock
  })
}
