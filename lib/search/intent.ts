import { getOpenAI, INTENT_MODEL } from "@/lib/openai"

export interface QueryIntent {
  categoryTags: string[]
  industryContext: string[]
  scaleHints: string[]
  integrationHints: string[]
  summary: string
}

const SYSTEM_PROMPT = `You are an intent classifier for an AI agent search engine called AgentMatch.
Extract structured intent from a user's natural language query about automating a business process.

Return a JSON object with these fields:
- categoryTags: array of business function category strings (e.g. ["customer support", "email automation", "invoice processing"])
- industryContext: array of industries explicitly or strongly implied (e.g. ["ecommerce", "healthcare"]) — empty if not clear
- scaleHints: array of business size hints if mentioned (e.g. ["small business", "enterprise"]) — empty if not clear
- integrationHints: array of integration preferences (e.g. ["zapier", "api", "no-code"]) — empty if not mentioned
- summary: one sentence describing what the user needs in plain English

Only populate fields with clear evidence from the query. Prefer empty arrays over guessing.`

export async function extractIntent(query: string): Promise<QueryIntent> {
  try {
    const response = await getOpenAI().chat.completions.create({
      model: INTENT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query.slice(0, 500) }, // cap at 500 chars per FR-01
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 300,
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error("Empty response from intent model")

    const parsed = JSON.parse(content)
    return {
      categoryTags: Array.isArray(parsed.categoryTags) ? parsed.categoryTags : [],
      industryContext: Array.isArray(parsed.industryContext) ? parsed.industryContext : [],
      scaleHints: Array.isArray(parsed.scaleHints) ? parsed.scaleHints : [],
      integrationHints: Array.isArray(parsed.integrationHints) ? parsed.integrationHints : [],
      summary: typeof parsed.summary === "string" ? parsed.summary : query,
    }
  } catch (error) {
    // Graceful degradation: search still works, just without intent signals
    console.error("[intent] extraction failed, degrading gracefully:", error)
    return {
      categoryTags: [],
      industryContext: [],
      scaleHints: [],
      integrationHints: [],
      summary: query,
    }
  }
}

/**
 * Score how well an agent's tags match the extracted intent.
 * Returns a value in [0, 1].
 */
export function categoryRelevanceScore(
  intentTags: string[],
  agentCategoryTags: string[],
  agentIndustryTags: string[]
): number {
  if (intentTags.length === 0) return 0.5 // no intent signal → neutral

  const agentTags = [...agentCategoryTags, ...agentIndustryTags].map((t) =>
    t.toLowerCase()
  )
  const intentLower = intentTags.map((t) => t.toLowerCase())

  let score = 0
  for (const intent of intentLower) {
    for (const tag of agentTags) {
      if (tag === intent) {
        score += 1
        break
      } else if (tag.includes(intent) || intent.includes(tag)) {
        score += 0.5
        break
      }
    }
  }

  return Math.min(1, score / intentLower.length)
}
