import { NextResponse } from "next/server"
import { search } from "@/lib/search/index"
import { SearchRequestSchema } from "@/lib/validators/search"

// Rate limiting is enforced at the infrastructure layer (Vercel Edge Config /
// a middleware rate-limiter). The PRD target is 100 req/min per IP for
// unauthenticated users. See middleware.ts for the IP-based limiter hook.

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = SearchRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const start = Date.now()
    const result = await search(parsed.data)
    const durationMs = Date.now() - start

    // Log slow searches (PRD target: p95 < 1500ms)
    if (durationMs > 1000) {
      console.warn(`[search] slow query (${durationMs}ms): "${parsed.data.query}"`)
    }

    return NextResponse.json({
      ...result,
      meta: { durationMs },
    })
  } catch (error) {
    console.error("[POST /api/search]", error)
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    )
  }
}
