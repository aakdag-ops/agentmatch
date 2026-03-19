import { Prisma } from "@prisma/client"
import { getVoyage, EMBEDDING_MODEL } from "@/lib/voyage"
import { db } from "@/lib/db"
import type { Agent } from "@prisma/client"

/**
 * Build a rich text representation of an agent for embedding.
 * Includes capabilities and weaknesses so semantic search can match
 * queries like "something that can't do X" correctly.
 */
function agentToEmbeddingText(agent: Agent): string {
  const parts: string[] = [
    agent.name,
    agent.vendor,
    agent.tagline,
    agent.description.slice(0, 1200),
    `Categories: ${agent.categoryTags.join(", ")}`,
    `Industries: ${agent.industryTags.join(", ")}`,
    `Integrations: ${agent.integrationTypes.join(", ")}`,
    `Pricing: ${agent.pricingTier}`,
    `Business size: ${agent.businessSizeFit.join(", ")}`,
  ]

  const capabilities = agent.capabilities as Array<{ text: string }> | null
  if (capabilities?.length) {
    parts.push(`Capabilities: ${capabilities.map((c) => c.text).join("; ")}`)
  }

  // Include weaknesses — helps match "does NOT support X" type queries
  const weaknesses = agent.weaknesses as Array<{ text: string }>
  if (weaknesses?.length) {
    parts.push(`Limitations: ${weaknesses.map((w) => w.text).join("; ")}`)
  }

  return parts.filter(Boolean).join("\n")
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getVoyage().embed({
    model: EMBEDDING_MODEL,
    input: text,
    inputType: "query",
  })
  const embedding = response.data?.[0]?.embedding
  if (!embedding) throw new Error("No embedding returned from Voyage AI")
  return embedding as number[]
}

/**
 * Generate and upsert the embedding for a single agent.
 * Uses raw SQL because Prisma does not support pgvector natively.
 */
export async function upsertAgentEmbedding(agent: Agent): Promise<void> {
  const text = agentToEmbeddingText(agent)
  const voyage = getVoyage()
  const response = await voyage.embed({
    model: EMBEDDING_MODEL,
    input: text,
    inputType: "document",
  })
  const embedding = response.data?.[0]?.embedding as number[] | undefined
  if (!embedding) throw new Error("No embedding returned from Voyage AI")

  const vectorLiteral = `[${embedding.join(",")}]`

  await db.$executeRaw(
    Prisma.sql`
      INSERT INTO agent_embeddings (id, "agentId", embedding, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${agent.id}::uuid, ${vectorLiteral}::vector, NOW(), NOW())
      ON CONFLICT ("agentId")
      DO UPDATE SET
        embedding   = ${vectorLiteral}::vector,
        "updatedAt" = NOW()
    `
  )
}

/**
 * Embed a search query string.
 */
export async function embedQuery(query: string): Promise<number[]> {
  return generateEmbedding(query)
}
