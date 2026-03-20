/** @type {import('next').NextConfig} */

const securityHeaders = [
  // Prevent MIME type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // XSS protection for older browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // HTTPS only (HSTS) — 2 year max-age
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Referrer policy
  { key: "Referrer-Policy", value: "origin-when-cross-origin" },
  // Permissions policy — disable unused browser APIs
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
]

const nextConfig = {
  // Required for Docker — produces a standalone server.js bundle
  output: "standalone",

  // Prevent Next.js from bundling Prisma during build — it must run server-side only
  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  images: {
    // Allow any remote image host (agent logos sourced from vendors)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    // Next.js image optimisation format preference
    formats: ["image/avif", "image/webp"],
  },

  // Compress responses
  compress: true,

  // Power headers for all routes
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Long-lived cache for static assets served by Next.js
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache agent profile pages for 60s at CDN, revalidate in background
      {
        source: "/agents/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ]
  },

  // Redirect legacy / non-canonical paths
  async redirects() {
    return [
      // www → apex
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.agentmatch.io" }],
        destination: "https://agentmatch.io/:path*",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
