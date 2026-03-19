/**
 * PostHog analytics helpers
 *
 * Set NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST in .env.local to enable.
 * When the key is absent (e.g. local dev or CI) all calls are no-ops.
 */

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ""
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com"

export const ANALYTICS_ENABLED = !!POSTHOG_KEY
