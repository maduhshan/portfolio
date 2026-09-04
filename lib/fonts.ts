import localFont from 'next/font/local'

/**
 * Self-hosted through next/font, which preloads the files, hashes their URLs
 * and generates fallback metrics — so the first paint does not shift when the
 * real faces arrive. The files themselves come from Fontsource; only the latin
 * subsets are shipped.
 */
export const newsreader = localFont({
  src: [
    { path: '../assets/fonts/newsreader-latin-wght-normal.woff2', weight: '200 800', style: 'normal' },
    { path: '../assets/fonts/newsreader-latin-wght-italic.woff2', weight: '200 800', style: 'italic' },
  ],
  variable: '--font-newsreader',
  display: 'swap',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
})

export const plexMono = localFont({
  src: [
    { path: '../assets/fonts/ibm-plex-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../assets/fonts/ibm-plex-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-plex-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
})
