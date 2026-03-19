import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"

export interface VectorCandidate {
  agentId: string
  similarity: number // cosine similarity [0, 1]
}

/**
 * Retrieve the top N most semantically similar agents using pgvector cosine similarity.
 * Returns raw candidates — re-ranking happens in lib/search/index.ts.
 *
 * NOTE: ranking.ts is the only place where the organic score is computed.
 * This function returns raw similarity scores only.
 */
export async function vectorSearch(
  queryEmbedding: number[],
  limit = 50
): Promise<VectorCandidate[]> {
  const vectorLiteral = `[${queryEmbedding.join(",")}]`

  const rows = await db.$queryRaw<Array<{ agentId: string; similarity: number }>>(
    Prisma.sql`
      SELECT
        ae."agentId"::text AS "agentId",
        (1 - (ae.embedding <=> ${vectorLiteral}::vector))::float AS similarity
      FROM agent_embeddings ae
      JOIN agents a ON a.id = ae."agentId"
      WHERE a.status = 'active'
        AND ae.embedding IS NOT NULL
      ORDER BY ae.embedding <=> ${vectorLiteral}::vector
      LIMIT ${limit}
    `
  )

  return rows.map((r) => ({
    agentId: r.agentId,
    similarity: Number(r.similarity),
  }))
}
