import { VoyageAIClient } from "voyageai"

// Lazy singleton
let _client: VoyageAIClient | null = null

export function getVoyage(): VoyageAIClient {
  if (!_client) {
    if (!process.env.VOYAGE_API_KEY) {
      throw new Error("VOYAGE_API_KEY environment variable is required")
    }
    _client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY })
  }
  return _client
}

// voyage-3-lite: 512 dims, fast, generous free tier (200M tokens/month)
// voyage-3: 1024 dims, higher quality — upgrade when you hit scale
export const EMBEDDING_MODEL = "voyage-3-lite" as const
export const EMBEDDING_DIMENSIONS = 512
