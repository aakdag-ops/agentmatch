// Shared domain types used across the app

export type Capability = {
  text: string
  evidence?: string
  sourceUrl?: string
}

export type Weakness = {
  text: string
  evidence?: string
}

// Normalised score 0–10 for display helpers
export function scoreColor(score: number | null | undefined): string {
  if (score === null || score === undefined) return "text-gray-400"
  if (score >= 8) return "text-green-600"
  if (score >= 5) return "text-amber-500"
  return "text-red-500"
}

export function scoreBg(score: number | null | undefined): string {
  if (score === null || score === undefined) return "bg-gray-100 text-gray-400"
  if (score >= 8) return "bg-green-50 text-green-700 ring-green-200"
  if (score >= 5) return "bg-amber-50 text-amber-700 ring-amber-200"
  return "bg-red-50 text-red-700 ring-red-200"
}

export function avgScore(scores: (number | null)[]): number | null {
  const valid = scores.filter((s): s is number => s !== null)
  if (!valid.length) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}

export const PRICING_LABELS: Record<string, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  enterprise: "Enterprise",
}

export const PRICING_COLORS: Record<string, string> = {
  free: "bg-green-50 text-green-700",
  freemium: "bg-blue-50 text-blue-700",
  paid: "bg-purple-50 text-purple-700",
  enterprise: "bg-gray-100 text-gray-700",
}

export const SUGGESTION_PROMPTS = [
  "Automate customer support email replies",
  "Extract data from PDF invoices",
  "Generate sales outreach sequences",
  "Schedule meetings from natural language",
  "Summarise long research documents",
  "Write marketing copy for social media",
]

export const SCORE_DIMENSIONS = [
  { key: "scoreAccuracy" as const, label: "Accuracy" },
  { key: "scoreLatency" as const, label: "Speed" },
  { key: "scoreReliability" as const, label: "Reliability" },
  { key: "scoreEaseOfUse" as const, label: "Ease of Use" },
  { key: "scoreCostEfficiency" as const, label: "Cost" },
]
