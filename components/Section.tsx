export function Section({
  id,
  index,
  title,
  ground,
  children,
  className = '',
}: {
  id: string
  index: string
  title: string
  ground?: 'paper' | 'hide'
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      id={id}
      data-ground={ground}
      className={`bg-ground text-fg border-rule scroll-mt-24 border-t py-20 md:py-28 ${className}`}
    >
      <div className="shell grid gap-x-8 gap-y-10 md:grid-cols-12">
        <header className="md:col-span-3">
          <p className="label">{index}</p>
          <h2 className="heading-1 mt-2">{title}</h2>
        </header>
        <div className="md:col-span-9">{children}</div>
      </div>
    </section>
  )
}
