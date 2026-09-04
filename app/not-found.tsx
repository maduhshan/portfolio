import Link from 'next/link'

import { FocusBrackets } from '@/components/FocusBrackets'

export const metadata = { title: 'Nothing here' }

export default function NotFound() {
  return (
    <main className="shell flex min-h-dvh flex-col justify-center py-32">
      <div className="relative max-w-xl">
        <FocusBrackets inset={20} />
        <p className="label">404</p>
        <h1 className="heading-1 mt-3">The frame came back empty</h1>
        <p className="text-muted mt-5 text-body">
          Nothing has been exposed at this address.
        </p>
        <Link className="link mt-8 inline-block" href="/">
          Back to the start
        </Link>
      </div>
    </main>
  )
}
