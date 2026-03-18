import OpenAI from "openai"

// Lazy singleton — only throws at runtime if key is missing, not at import time
// (so build/type-check passes without OPENAI_API_KEY set in CI)
let _client: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required")
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }
  return _client
}

export const EMBEDDING_MODEL = "text-embedding-3-small" as const
export const EMBEDDING_DIMENSIONS = 1536
export const INTENT_MODEL = "gpt-4o-mini" as const
