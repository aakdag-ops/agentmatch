import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/api-auth"
import { AgentWriteSchema } from "@/lib/validators/agent"
import { upsertAgentEmbedding } from "@/lib/embeddings"

type Params = { params: { id: string } }

// ── GET /api/agents/[id] ──────────────────────────────────────────────────────
// Public: fetch a single agent by ID
export async function GET(_request: Request, { params }: Params) {
  try {
    const agent = await db.agent.findUnique({
      where: { id: params.id },
    })

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Don't expose deprecated agents to public
    if (agent.status === "deprecated") {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    return NextResponse.json({ agent })
  } catch (error) {
    console.error(`[GET /api/agents/${params.id}]`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── PUT /api/agents/[id] ──────────────────────────────────────────────────────
// Admin only: update agent fields and re-generate embedding
export async function PUT(request: Request, { params }: Params) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const existing = await db.agent.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    const body = await request.json()
    // Allow partial updates by merging with existing data
    const merged = {
      name: existing.name,
      vendor: existing.vendor,
      tagline: existing.tagline,
      description: existing.description,
      categoryTags: existing.categoryTags,
      industryTags: existing.industryTags,
      businessSizeFit: existing.businessSizeFit,
      capabilities: existing.capabilities,
      weaknesses: existing.weaknesses,
      pricingTier: existing.pricingTier,
      pricingNotes: existing.pricingNotes,
      integrationTypes: existing.integrationTypes,
      scoreAccuracy: existing.scoreAccuracy,
      scoreLatency: existing.scoreLatency,
      scoreReliability: existing.scoreReliability,
      scoreEaseOfUse: existing.scoreEaseOfUse,
      scoreCostEfficiency: existing.scoreCostEfficiency,
      lastTestedAt: existing.lastTestedAt?.toISOString(),
      testVersion: existing.testVersion,
      externalUrl: existing.externalUrl,
      status: existing.status,
      ...body,
    }

    const parsed = AgentWriteSchema.safeParse(merged)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data

    const agent = await db.agent.update({
      where: { id: params.id },
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

    // Re-generate embedding after any update
    upsertAgentEmbedding(agent).catch((err) =>
      console.error(`[embedding] re-embed failed for agent ${agent.id}:`, err)
    )

    return NextResponse.json({ agent })
  } catch (error) {
    console.error(`[PUT /api/agents/${params.id}]`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// ── DELETE /api/agents/[id] ───────────────────────────────────────────────────
// Admin only: soft-delete by setting status = deprecated
export async function DELETE(_request: Request, { params }: Params) {
  const auth = await requireAdmin()
  if (auth instanceof NextResponse) return auth

  try {
    const existing = await db.agent.findUnique({ where: { id: params.id } })
    if (!existing) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 })
    }

    // Soft delete — preserve record for score history and audit trail
    await db.agent.update({
      where: { id: params.id },
      data: { status: "deprecated" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`[DELETE /api/agents/${params.id}]`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
