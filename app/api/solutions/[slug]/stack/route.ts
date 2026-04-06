import { NextResponse } from "next/server"
import { getSolution } from "@/lib/solutions"
import { embedQuery } from "@/lib/embeddings"
import { vectorSearch } from "@/lib/search/vector"
import { db } from "@/lib/db"
import type { Agent } from "@prisma/client"

export interface StageMatch {
  step: number
  topAgent: Agent | null
  alternatives: Agent[]
  similarity: number
}

export interface StackResponse {
  stages: StageMatch[]
}

// Minimum cosine similarity to surface a match (0–1)
const SIMILARITY_THRESHOLD = 0.45

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const solution = getSolution(params.slug)
  if (!solution) {
    return NextResponse.json({ error: "Solution not found" }, { status: 404 })
  }

  try {
    // Embed all stage descriptions in parallel
    const embeddings = await Promise.all(
      solution.stages.map((stage) =>
        embedQuery(`${stage.agentRole}: ${stage.title}. ${stage.description}`)
          .catch(() => null)
      )
    )

    // Vector search per stage in parallel (top 5 candidates each)
    const candidateSets = await Promise.all(
      embeddings.map((embedding) =>
        embedding
          ? vectorSearch(embedding, 5).catch(() => [])
          : Promise.resolve([])
      )
    )

    // Collect all unique agent IDs needed
    const seen = new Set<string>()
    const allAgentIds: string[] = []
    for (const set of candidateSets) {
      for (const c of set) {
        if (!seen.has(c.agentId)) {
          seen.add(c.agentId)
          allAgentIds.push(c.agentId)
        }
      }
    }

    // Fetch all agent records in one query
    const agents = await db.agent.findMany({
      where: { id: { in: allAgentIds }, status: "active" },
    })
    const agentMap = new Map(agents.map((a) => [a.id, a]))

    // Build per-stage results with deduplication of top picks
    const usedTopIds = new Set<string>()
    const stages: StageMatch[] = candidateSets.map((candidates, i) => {
      const stage = solution.stages[i]

      // Filter to agents above threshold, sorted by similarity desc
      const qualified = candidates
        .filter(
          (c) =>
            c.similarity >= SIMILARITY_THRESHOLD && agentMap.has(c.agentId)
        )
        .sort((a, b) => b.similarity - a.similarity)

      // Pick top agent — prefer one not already used as a top pick
      const topCandidate =
        qualified.find((c) => !usedTopIds.has(c.agentId)) ?? qualified[0] ?? null

      const topAgent = topCandidate ? agentMap.get(topCandidate.agentId) ?? null : null
      if (topAgent) usedTopIds.add(topAgent.id)

      // Alternatives: next 2 that aren't the top pick
      const alternatives = qualified
        .filter((c) => c.agentId !== topAgent?.id)
        .slice(0, 2)
        .map((c) => agentMap.get(c.agentId)!)
        .filter(Boolean)

      return {
        step: stage.step,
        topAgent,
        alternatives,
        similarity: topCandidate?.similarity ?? 0,
      }
    })

    return NextResponse.json({ stages } satisfies StackResponse)
  } catch (error) {
    console.error("[stack] error building solution stack:", error)
    return NextResponse.json(
      { error: "Failed to build agent stack" },
      { status: 500 }
    )
  }
}
