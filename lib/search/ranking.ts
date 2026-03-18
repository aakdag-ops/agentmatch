/**
 * AgentMatch — Organic Search Ranking
 *
 * INVARIANT: This module contains ONLY organic ranking signals.
 * It MUST NOT reference any commercial, featured, or sponsored concepts.
 *
 * Ranking formula (from PRD FR-02):
 *   - Semantic similarity score : 40%
 *   - Category relevance score  : 30%
 *   - Recency of last test      : 20%
 *   - User rating signal        : 10%
 *
 * Any featured/sponsored placement logic MUST live in lib/search/featured.ts
 * and MUST NOT modify the ranked results list returned from this module.
 * Featured entries are injected by the caller AFTER organic ranking completes.
 */

export interface RankingCandidate {
  agentId: string
  semanticScore: number   // cosine similarity [0, 1]
  categoryScore: number   // tag overlap score [0, 1]
  lastTestedAt: Date | null
  avgUserRating: number   // [0, 5] — normalised to [0, 1] internally
}

export interface RankedResult {
  agentId: string
  score: number
  breakdown: {
    semantic: number
    category: number
    recency: number
    userRating: number
  }
}

const WEIGHTS = {
  semantic: 0.4,
  category: 0.3,
  recency: 0.2,
  userRating: 0.1,
} as const

// Recency score: decays linearly over 90 days (re-test cadence from Section 9.2)
function recencyScore(lastTestedAt: Date | null): number {
  if (!lastTestedAt) return 0
  const ageMs = Date.now() - lastTestedAt.getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  const DECAY_DAYS = 90
  return Math.max(0, 1 - ageDays / DECAY_DAYS)
}

function normaliseRating(avgRating: number): number {
  return Math.min(1, Math.max(0, avgRating / 5))
}

export function rankCandidates(candidates: RankingCandidate[]): RankedResult[] {
  const results: RankedResult[] = candidates.map((c) => {
    const semantic = c.semanticScore * WEIGHTS.semantic
    const category = c.categoryScore * WEIGHTS.category
    const recency = recencyScore(c.lastTestedAt) * WEIGHTS.recency
    const userRating = normaliseRating(c.avgUserRating) * WEIGHTS.userRating

    return {
      agentId: c.agentId,
      score: semantic + category + recency + userRating,
      breakdown: { semantic, category, recency, userRating },
    }
  })

  return results.sort((a, b) => b.score - a.score)
}
