import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/api-auth"
import { AgentWriteSchema } from "@/lib/validators/agent"
import { upsertAgentEmbedding } from "@/lib/embeddings"
import type { AgentStatus, Prisma } from "@prisma/client"

// ── GET /api/agents ──────────────────────────────────────────────────────────
// Public: paginated list of agents with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")))
    const status = (searchParams.get("status") ?? "active") as AgentStatus
    const category = searchParams.get("category") ?? undefined
    const pricingTier = searchParams.get("pricingTier") ?? undefined

    const where: Prisma.AgentWhereInput = { status }

    if (category) {
      where.categoryTags = { has: category }
    }
    if (pricingTier) {
      where.pricingTier = pricingTier as Prisma.EnumPricingTierFilter
    }

    const [agents, total] = await Promise.all([
      db.agent.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { updatedAt: "desc" },
      }),
      db.agent.count({ where }),
    ])

    return NextResponse.json({
      agents,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("[GET /api/agents]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── POST /api/agents ─────────────────────────────────────────────────────────
// Admin only: create a new agent and trigger embedding generation
export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const body = await request.json()
    const parsed = AgentWriteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    const agent = await db.agent.create({
      data: {
        name: data.name,
        vendor: data.vendor,
        tagline: data.tagline,
        description: data.description,
        categoryTags: data.categoryTags,
        industryTags: data.industryTags,
        businessSizeFit: data.businessSizeFit,
        capabilities: data.capabilities,
        weaknesses: data.weaknesses,
        pricingTier: data.pricingTier,
        pricingNotes: data.pricingNotes,
        integrationTypes: data.integrationTypes,
        scoreAccuracy: data.scoreAccuracy ?? null,
        scoreLatency: data.scoreLatency ?? null,
        scoreReliability: data.scoreReliability ?? null,
        scoreEaseOfUse: data.scoreEaseOfUse ?? null,
        scoreCostEfficiency: data.scoreCostEfficiency ?? null,
        lastTestedAt: data.lastTestedAt ? new Date(data.lastTestedAt) : null,
        testVersion: data.testVersion,
        externalUrl: data.externalUrl,
        status: data.status,
      },
    })

    // Generate embedding asynchronously — don't block the response
    upsertAgentEmbedding(agent).catch((err) =>
      console.error(`[embedding] failed for agent ${agent.id}:`, err)
    )

    return NextResponse.json({ agent }, { status: 201 })
  } catch (error) {
    console.error("[POST /api/agents]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
