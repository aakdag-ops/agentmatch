"use client"

import { SessionProvider } from "next-auth/react"
import { CompareProvider } from "@/context/CompareContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CompareProvider>{children}</CompareProvider>
    </SessionProvider>
  )
}
