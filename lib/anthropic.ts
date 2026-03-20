import Anthropic from "@anthropic-ai/sdk"

// Lazy singleton
let _client: Anthropic | null = null

export function getAnthropic(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is required")
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

// claude-haiku-4-5 = fastest + cheapest Claude model, ideal for structured extraction
export const INTENT_MODEL = "claude-haiku-4-5" as const
