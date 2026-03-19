/**
 * AgentMatch Search Pipeline Orchestrator
 *
 * Step 1: Extract intent from query (GPT-4o-mini)
 * Step 2: Embed query (text-embedding-3-small)
 * Step 3: Vector similarity search (pgvector, top 50)
 * Step 4: Fetch full agent records for candidates
 * Step 5: Apply client-side filters (industry, pricing, size, etc.)
 * Step 6: Compute ranking inputs (category relevance, recency, user rating)
 * Step 7: Re-rank using ranking.ts (pure organic — no commercial signals)
 * Step 8: Generate "why matched" one-liners
 * Step 9: Return top 20 with featured slots (empty in MVP)
 */

import { extractIntent, categoryRelevanceScore } from "./intent"
import { vectorSearch } from "./vector"
import { rankCandidates } from "./ranking"
import { getFeaturedPlacements } from "./featured"
import { embedQuery } from "@/lib/embeddings"
import { db } from "@/lib/db"
import type { Agent, BusinessSize } from "@prisma/client"

export interface SearchFilters {
  industryTags?: string[]
  businessSizeFit?: string[]
  pricingTier?: string[]
  integrationTypes?: string[]
  minScore?: number // minimum average score threshold (0–10)
}

export interface SearchRequest {
  query: string
  filters?: SearchFilters
  page?: number
  limit?: number
}

export interface SearchResultItem {
  agent: Agent
  score: number
  whyMatched: string
  breakdown: {
    semantic: number
    category: number
    recency: number
    userRating: number
  }
}

export interface SearchResponse {
  results: SearchResultItem[]
  total: number
  page: number
  intent: {
    categoryTags: string[]
    industryContext: string[]
    summary: string
  }
  featured: Awaited<ReturnType<typeof getFeaturedPlacements>>
}

function generateWhyMatched(
  agent: Agent,
  intentTags: string[],
  intentSummary: string
): string {
  // Find which of the agent's category tags overlap with intent
  const matchedTags = agent.categoryTags.filter((tag) =>
    intentTags.some(
      (i) =>
        tag.toLowerCase().includes(i.toLowerCase()) ||
        i.toLowerCase().includes(tag.toLowerCase())
    )
  )

  if (matchedTags.length > 0) {
    const tagStr = matchedTags.slice(0, 2).join(" and ")
    return `Matches your need for ${tagStr}`
  }

  // Fall back to tagline if no direct tag match (semantic match drove it)
  if (intentSummary && intentSummary !== agent.tagline) {
    return agent.tagline
  }

  return agent.tagline
}

function averageScore(agent: Agent): number {
  const scores = [
    agent.scoreAccuracy,
    agent.scoreLatency,
    agent.scoreReliability,
    agent.scoreEaseOfUse,
    agent.scoreCostEfficiency,
  ].filter((s): s is number => s !== null)

  if (scores.length === 0) return 0
  return scores.reduce((a, b) => a + b, 0) / scores.length
}

// ── Keyword fallback (used when OpenAI is unavailable) ──────────────────────
async function keywordFallback(
  query: string,
  topN: number
): Promise<Array<{ agentId: string; similarity: number }>> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2)
  if (terms.length === 0) {
    const all = await db.agent.findMany({
      where: { status: "active" },
      select: { id: true },
      take: topN,
    })
    return all.map((a) => ({ agentId: a.id, similarity: 0.5 }))
  }
  const agents = await db.agent.findMany({
    where: {
      status: "active",
      OR: terms.flatMap((t) => [
        { name: { contains: t, mode: "insensitive" as const } },
        { tagline: { contains: t, mode: "insensitive" as const } },
        { description: { contains: t, mode: "insensitive" as const } },
        { categoryTags: { has: t } },
      ]),
    },
    take: topN,
  })
  return agents.map((a) => ({ agentId: a.id, similarity: 0.6 }))
}

export async function search(req: SearchRequest): Promise<SearchResponse> {
  const { query, filters = {}, page = 1, limit = 20 } = req
  const clampedLimit = Math.min(limit, 20)
  const offset = (page - 1) * clampedLimit

  // ── Step 1: Intent extraction + embedding (with graceful OpenAI fallback) ──
  let intent = {
    categoryTags: [] as string[],
    industryContext: [] as string[],
    summary: query,
  }
  let vectorCandidates: Array<{ agentId: string; similarity: number }> = []

  try {
    const [extractedIntent, queryEmbedding] = await Promise.all([
      extractIntent(query),
      embedQuery(query),
    ])
    intent = extractedIntent
    vectorCandidates = await vectorSearch(queryEmbedding, 50)
  } catch {
    // OpenAI unavailable (quota, network) — fall back to keyword search
    console.warn("[search] OpenAI unavailable, falling back to keyword search")
    vectorCandidates = await keywordFallback(query, 50)
  }

  // If vector search also returned nothing, try keyword fallback
  if (vectorCandidates.length === 0) {
    vectorCandidates = await keywordFallback(query, 50)
  }

  if (vectorCandidates.length === 0) {
    return {
      results: [],
      total: 0,
      page,
      intent: {
        categoryTags: intent.categoryTags,
        industryContext: intent.industryContext,
        summary: intent.summary,
      },
      featured: [],
    }
  }

  const candidateIds = vectorCandidates.map((c) => c.agentId)

  // ── Step 3: Fetch full agent records ──────────────────────────────────────
  const agents = await db.agent.findMany({
    where: {
      id: { in: candidateIds },
      status: "active",
    },
  })

  const agentMap = new Map(agents.map((a) => [a.id, a]))

  // ── Step 4: Apply filters ─────────────────────────────────────────────────
  const filteredCandidates = vectorCandidates.filter((c) => {
    const agent = agentMap.get(c.agentId)
    if (!agent) return false

    if (filters.pricingTier?.length) {
      if (!filters.pricingTier.includes(agent.pricingTier)) return false
    }
    if (filters.industryTags?.length) {
      const hasIndustry = filters.industryTags.some((tag) =>
        agent.industryTags.some((t) =>
          t.toLowerCase().includes(tag.toLowerCase())
        )
      )
      if (!hasIndustry) return false
    }
    if (filters.businessSizeFit?.length) {
      const hasSize = filters.businessSizeFit.some((size) =>
        agent.businessSizeFit.includes(size as BusinessSize)
      )
      if (!hasSize) return false
    }
    if (filters.integrationTypes?.length) {
      const hasIntegration = filters.integrationTypes.some((type) =>
        agent.integrationTypes.some((t) =>
          t.toLowerCase().includes(type.toLowerCase())
        )
      )
      if (!hasIntegration) return false
    }
    if (filters.minScore !== undefined && filters.minScore > 0) {
      if (averageScore(agent) < filters.minScore) return false
    }

    return true
  })

  // ── Step 5: Build ranking inputs ──────────────────────────────────────────
  const allIntentTags = [...intent.categoryTags, ...intent.industryContext]

  const rankingCandidates = filteredCandidates.map((c) => {
    const agent = agentMap.get(c.agentId)!
    // User rating: average score normalised to [0,5] range
    // Real reviews are Phase 2 — using internal test scores as proxy
    const avgRating = averageScore(agent) / 2 // 0–10 → 0–5

    return {
      agentId: c.agentId,
      semanticScore: c.similarity,
      categoryScore: categoryRelevanceScore(
        allIntentTags,
        agent.categoryTags,
        agent.industryTags
      ),
      lastTestedAt: agent.lastTestedAt,
      avgUserRating: avgRating,
    }
  })

  // ── Step 6: Re-rank (pure organic — see ranking.ts) ───────────────────────
  const ranked = rankCandidates(rankingCandidates)

  // ── Step 7: Paginate ──────────────────────────────────────────────────────
  const total = ranked.length
  const paginated = ranked.slice(offset, offset + clampedLimit)

  // ── Step 8: Build response items ─────────────────────────────────────────
  const results: SearchResultItem[] = paginated.map((r) => {
    const agent = agentMap.get(r.agentId)!
    return {
      agent,
      score: r.score,
      whyMatched: generateWhyMatched(agent, allIntentTags, intent.summary),
      breakdown: r.breakdown,
    }
  })

  // Enforce minimum 3 results if we have any (PRD FR-02)
  // If fewer than 3 matched filters, relax filters and pad with next best
  if (results.length > 0 && results.length < 3 && page === 1) {
    const existingIds = new Set(results.map((r) => r.agent.id))
    const extra = ranked
      .filter((r) => !existingIds.has(r.agentId))
      .slice(0, 3 - results.length)
    for (const r of extra) {
      const agent = agentMap.get(r.agentId)!
      results.push({
        agent,
        score: r.score,
        whyMatched: generateWhyMatched(agent, allIntentTags, intent.summary),
        breakdown: r.breakdown,
      })
    }
  }

  // ── Step 9: Featured placements (empty in MVP) ────────────────────────────
  const featured = await getFeaturedPlacements({
    categoryTags: intent.categoryTags,
    industryTags: intent.industryContext,
  })

  return {
    results,
    total,
    page,
    intent: {
      categoryTags: intent.categoryTags,
      industryContext: intent.industryContext,
      summary: intent.summary,
    },
    featured,
  }
}
