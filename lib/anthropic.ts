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

export const INTENT_MODEL = "claude-haiku-4-5" as const
