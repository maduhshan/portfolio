import type { Metadata, Viewport } from 'next'

import { NeuralField } from '@/components/field/NeuralField'
import { newsreader, plexMono } from '@/lib/fonts'
import { siteUrl } from '@/lib/site-url'

import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Madushan Chathuranga',
    template: '%s — Madushan Chathuranga',
  },
  description:
    'I build event-driven systems and data platforms that move large volumes of data. I also photograph wildlife.',
  authors: [{ name: 'Madushan Chathuranga' }],
  creator: 'Madushan Chathuranga',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e7e8e5' },
    { media: '(prefers-color-scheme: dark)', color: '#e7e8e5' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-ground="paper" className={`${newsreader.variable} ${plexMono.variable}`}>
      <body className="bg-ground text-fg min-h-dvh">
        <NeuralField />
        {children}
      </body>
    </html>
  )
}
