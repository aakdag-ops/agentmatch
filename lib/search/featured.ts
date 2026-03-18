/**
 * AgentMatch — Featured / Sponsored Placement Logic
 *
 * This module is the ONLY place where commercial placement logic may live.
 * It MUST NOT influence the organic ranked results from lib/search/ranking.ts.
 *
 * Featured entries are injected ALONGSIDE organic results — never inside them.
 * Every featured entry must carry `isFeatured: true` so the UI renders a
 * clear "Sponsored" label (PRD Section 7.3: "any featured placement is clearly
 * labelled 'Sponsored'").
 *
 * Phase 2+ feature — this file is a stub for MVP.
 */

export interface FeaturedEntry {
  agentId: string
  isFeatured: true   // always true — used as discriminator in UI
  placementSlot: "top" | "sidebar"
}

/**
 * Returns featured placement entries for the given query context.
 * Returns empty array in MVP (monetisation is Phase 2+).
 *
 * When implemented: query the `featured_placements` table, check active
 * campaigns, verify keyword match — then return slots. Do NOT sort or
 * re-order the organic results array from ranking.ts.
 */
export async function getFeaturedPlacements(
  _queryContext: { categoryTags: string[]; industryTags: string[] } // Phase 2: use this
): Promise<FeaturedEntry[]> {
  // Phase 2: implement featured placement retrieval here
  return []
}
