import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "./providers"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import CompareBar from "@/components/CompareBar"

export const metadata: Metadata = {
  title: {
    default: "AgentMatch — The Search Engine for AI Agents",
    template: "%s | AgentMatch",
  },
  description:
    "Find the right AI agent for your business process in minutes, not weeks. AgentMatch independently tests and ranks AI agents so you don't have to.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://agentmatch.io"
  ),
  openGraph: {
    type: "website",
    siteName: "AgentMatch",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <Providers>
          <NavBar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <CompareBar />
        </Providers>
      </body>
    </html>
  )
}
