"use client"

import { SessionProvider } from "next-auth/react"
import { CompareProvider } from "@/context/CompareContext"
import { PostHogInit } from "@/components/Analytics"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CompareProvider>
        <PostHogInit>{children}</PostHogInit>
      </CompareProvider>
    </SessionProvider>
  )
}
