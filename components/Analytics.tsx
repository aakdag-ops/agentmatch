"use client"

import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { POSTHOG_KEY, POSTHOG_HOST, ANALYTICS_ENABLED } from "@/lib/posthog"

// ── Page-view tracker ─────────────────────────────────────────────────────────
// Captures a $pageview event on every route change.
// Wrapped in Suspense because useSearchParams() requires it in Next.js 14.

function PageViewTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!ANALYTICS_ENABLED) return
    const url =
      window.location.origin +
      pathname +
      (searchParams.toString() ? "?" + searchParams.toString() : "")
    posthog.capture("$pageview", { $current_url: url })
  }, [pathname, searchParams])

  return null
}

// ── Provider ──────────────────────────────────────────────────────────────────

function PostHogInit({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!ANALYTICS_ENABLED) return
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // we handle this manually above
      capture_pageleave: true,
      persistence: "localStorage",
      autocapture: false, // explicit event-only tracking
      respect_dnt: true,
    })
  }, [])

  if (!ANALYTICS_ENABLED) return <>{children}</>

  return (
    <PostHogProvider client={posthog}>
      {children}
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </PostHogProvider>
  )
}

export { PostHogInit }
