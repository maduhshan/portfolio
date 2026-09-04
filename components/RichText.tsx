import { PortableText, type PortableTextComponents } from '@portabletext/react'

import type { PortableTextBlock } from '@/lib/types'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
    h3: ({ children }) => <h3>{children}</h3>,
  },
  marks: {
    // Figures render as tabular mono inline — see .prose strong in globals.css.
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    code: ({ children }) => <code>{children}</code>,
    link: ({ value, children }) => {
      const href: string = value?.href ?? '#'
      const external = href.startsWith('http')
      return (
        <a
          className="link"
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      )
    },
  },
  list: { bullet: ({ children }) => <ul>{children}</ul> },
  listItem: { bullet: ({ children }) => <li>{children}</li> },
}

export function RichText({
  value,
  className = '',
}: {
  value: PortableTextBlock[]
  className?: string
}) {
  if (!value?.length) return null
  return (
    <div className={`prose ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  )
}
