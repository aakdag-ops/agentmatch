/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure agent profile pages are always SSR — enforced via route segment config
  // in app/agents/[slug]/page.tsx (export const dynamic = 'force-dynamic' is NOT used;
  // SSR is the default for pages that use server-side data fetching without caching)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

module.exports = nextConfig
