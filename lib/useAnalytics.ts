"use client"

import { useCallback } from "react"
import { ANALYTICS_ENABLED } from "./posthog"

// Lazy-import posthog only in the browser to avoid SSR issues
async function ph() {
  if (typeof window === "undefined" || !ANALYTICS_ENABLED) return null
  const { default: posthog } = await import("posthog-js")
  return posthog
}

// ── Event catalogue ───────────────────────────────────────────────────────────
// All product-analytics events are named here to prevent typos across the app.

export type AnalyticsEvent =
  | { event: "search_submitted"; query: string; resultCount: number }
  | { event: "agent_viewed"; agentId: string; agentName: string }
  | { event: "agent_compare_added"; agentId: string }
  | { event: "agent_compare_removed"; agentId: string }
  | { event: "compare_opened"; agentIds: string[] }
  | { event: "watchlist_added"; agentId: string }
  | { event: "watchlist_removed"; agentId: string }
  | { event: "search_saved"; query: string }
  | { event: "agent_external_link_clicked"; agentId: string; url: string }
  | { event: "submission_started" }
  | { event: "submission_completed"; category: string }
  | { event: "signup_completed"; provider: "credentials" | "google" }
  | { event: "login_completed"; provider: "credentials" | "google" }

export function useAnalytics() {
  const track = useCallback(async (payload: AnalyticsEvent) => {
    const client = await ph()
    if (!client) return
    const { event, ...props } = payload
    client.capture(event, props)
  }, [])

  return { track }
}
