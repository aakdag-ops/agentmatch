import { getAnthropic, INTENT_MODEL } from "@/lib/anthropic"
import { solutions } from "@/lib/solutions"

export interface SolutionMatch {
  slug: string
  confidence: number // 0–1
  reason: string
}

const SOLUTION_LIST = solutions
  .map((s) => `- slug: "${s.slug}" | title: "${s.title}" | industry: "${s.industry}" | problem: "${s.headline}"`)
  .join("\n")

const SYSTEM_PROMPT = `You are a business problem classifier for AgentMatch, a platform that helps SMEs solve operational problems with AI agents.

Given a user's query, decide if it maps to one of the following known SME solution templates:

${SOLUTION_LIST}

Return a JSON object:
- slug: the matching solution slug, or null if none fits
- confidence: float 0.0–1.0 (how confident you are this is the right template)
- reason: one short sentence explaining the match

Only return a match if confidence >= 0.6. Return null slug if the query is too generic, about a single tool, or doesn't match any template.`

export async function matchSolution(query: string): Promise<SolutionMatch | null> {
  try {
    const response = await getAnthropic().messages.create({
      model: INTENT_MODEL,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: query.slice(0, 500) }],
      temperature: 0,
      max_tokens: 150,
    })

    const block = response.content[0]
    const content = block.type === "text" ? block.text : null
    if (!content) return null

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.slug || parsed.confidence < 0.6) return null

    const solution = solutions.find((s) => s.slug === parsed.slug)
    if (!solution) return null

    return {
      slug: parsed.slug,
      confidence: parsed.confidence,
      reason: parsed.reason ?? "",
    }
  } catch {
    return null
  }
}
