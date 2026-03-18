import type { Metadata } from "next"

// Search result pages must NOT be indexed (PRD SEO requirement)
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
