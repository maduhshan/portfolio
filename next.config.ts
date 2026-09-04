import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Sanity's image CDN and Instagram's media CDNs. Nothing else is remote.
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      // Medium serves article art from its own CDN. This list must stay in
      // step with ALLOWED_IMAGE_HOSTS in lib/medium.ts, which is what decides
      // whether an image from the feed is used at all.
      { protocol: 'https', hostname: '**.medium.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  // CLAUDE.md here is the project brief, not generated tooling notes.
  // Without this, `next dev` overwrites it.
  agentRules: false,
}

export default nextConfig
