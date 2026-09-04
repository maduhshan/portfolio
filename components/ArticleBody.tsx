import parse, { domToReact, Element, type DOMNode, type HTMLReactParserOptions } from 'html-react-parser'
import Image from 'next/image'

/**
 * Renders an article that was written on Medium.
 *
 * The HTML arriving here has already been through a strict allowlist in
 * lib/medium.ts. This converts it to React elements rather than injecting it —
 * there is no dangerouslySetInnerHTML anywhere in this file — and swaps three
 * things for the site's own versions: images run through next/image, code
 * blocks get a surface, and links get the site's underline.
 */
export function ArticleBody({ html }: { html: string }) {
  return <div className="prose article">{parse(html, options)}</div>
}

const options: HTMLReactParserOptions = {
  replace: (node) => {
    if (!(node instanceof Element)) return undefined

    if (node.name === 'img') {
      const src = node.attribs.src
      if (!src) return <></>
      const width = Number(node.attribs.width) || 1600
      const height = Number(node.attribs.height) || 900
      return (
        <Image
          src={src}
          alt={node.attribs.alt ?? ''}
          width={width}
          height={height}
          sizes="(max-width: 768px) 92vw, 720px"
          className="h-auto w-full"
        />
      )
    }

    if (node.name === 'a') {
      const href = node.attribs.href ?? '#'
      const external = href.startsWith('http')
      return (
        <a
          className="link"
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {domToReact(node.children as DOMNode[], options)}
        </a>
      )
    }

    if (node.name === 'pre') {
      return (
        <pre className="code-block">
          <code>{domToReact(node.children as DOMNode[])}</code>
        </pre>
      )
    }

    return undefined
  },
}
