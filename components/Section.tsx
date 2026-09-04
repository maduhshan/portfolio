import Link from 'next/link'

export function Section({
  id,
  index,
  title,
  href,
  ground,
  children,
  className = '',
}: {
  id: string
  index: string
  title: string
  /** Where the heading goes. A page where one exists, otherwise the section
   *  itself — which on a drum is also how you get back to its first item. */
  href?: string
  ground?: 'paper' | 'hide'
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      data-ground={ground}
      className={`${
        ground === 'hide' ? 'bg-ground' : 'ground-open'
      } text-fg border-rule scroll-mt-24 border-t py-20 md:py-28 ${className}`}
    >
      <div className="shell grid gap-x-8 gap-y-10 md:grid-cols-12">
        <header className="md:sticky md:top-28 md:col-span-3 md:self-start">
          <p className="label">{index}</p>
          <h2 className="heading-1 mt-2">
            {href ? (
              <Link className="section-link" href={href}>
                {title}
              </Link>
            ) : (
              title
            )}
          </h2>
        </header>
        <div className="md:col-span-9">{children}</div>
      </div>
    </section>
  )
}
