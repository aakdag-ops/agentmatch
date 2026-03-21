import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import CompareBar from "@/components/CompareBar"
import VerificationBanner from "@/components/VerificationBanner"

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL ?? "https://unagent.ai").trim()

export const metadata: Metadata = {
  title: {
    default: "AgentMatch — The Search Engine for AI Agents",
    template: "%s | AgentMatch",
  },
  description:
    "Find the right AI agent for your business process in minutes, not weeks. AgentMatch independently tests and ranks AI agents so you don't have to.",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    siteName: "AgentMatch",
    title: "AgentMatch — The Search Engine for AI Agents",
    description:
      "Find the right AI agent for your business process in minutes, not weeks.",
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "AgentMatch — The Search Engine for AI Agents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentMatch — The Search Engine for AI Agents",
    description: "Independently tested AI agents, ranked by real-world performance.",
    images: [`${BASE_URL}/og-default.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification token here
    google: process.env.GOOGLE_SITE_VERIFICATION ?? "",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <Providers>
          <NavBar />
          <VerificationBanner />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CompareBar />
        </Providers>
      </body>
    </html>
  )
}
