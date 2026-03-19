/**
 * JSON-LD structured data for agent profile pages.
 * Injected as a <script> tag in the <head> — improves Google rich results.
 * Uses SoftwareApplication schema with AggregateRating when scores exist.
 */

interface Agent {
  id: string
  name: string
  vendor: string
  tagline: string
  description: string
  externalUrl: string
  pricingTier: string
  categoryTags: string[]
  scoreAccuracy: number | null
  scoreLatency: number | null
  scoreReliability: number | null
  scoreEaseOfUse: number | null
  scoreCostEfficiency: number | null
}

function avgScore(agent: Agent): number | null {
  const vals = [
    agent.scoreAccuracy,
    agent.scoreLatency,
    agent.scoreReliability,
    agent.scoreEaseOfUse,
    agent.scoreCostEfficiency,
  ].filter((v): v is number => v !== null)
  if (!vals.length) return null
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

const PRICING_MAP: Record<string, string> = {
  free: "https://schema.org/Free",
  freemium: "https://schema.org/Free",
  paid: "https://schema.org/PaidService",
  enterprise: "https://schema.org/PaidService",
}

export function AgentStructuredData({ agent }: { agent: Agent }) {
  const avg = avgScore(agent)
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://agentmatch.io"

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: agent.name,
    description: agent.tagline,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${BASE_URL}/agents/${agent.id}`,
    sameAs: agent.externalUrl,
    author: {
      "@type": "Organization",
      name: agent.vendor,
    },
    offers: {
      "@type": "Offer",
      price: agent.pricingTier === "free" ? "0" : undefined,
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
      priceSpecification: {
        "@type": "PriceSpecification",
        eligibleTransactionVolume: PRICING_MAP[agent.pricingTier],
      },
    },
    keywords: agent.categoryTags.join(", "),
  }

  // Add AggregateRating if we have scores (0–10 → 0–5 star conversion)
  if (avg !== null) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: (avg / 2).toFixed(1), // convert 0–10 to 0–5
      bestRating: "5",
      worstRating: "0",
      ratingCount: "1", // our single independent test
      description: "AgentMatch independent test score",
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
