import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { AgentFormSchema } from "@/lib/admin/agentSchema"
import { requireAdmin } from "@/lib/admin/requireAdmin"
import { Prisma } from "@prisma/client"

type Ctx = { params: { id: string } }

// PUT /api/admin/agents/[id] — update agent
export async function PUT(req: Request, { params }: Ctx) {
  const denied = await requireAdmin()
  if (denied) return denied

  const body = await req.json()
  const parsed = AgentFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
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
      capabilities: data.capabilities as Prisma.InputJsonValue,
      weaknesses: data.weaknesses as Prisma.InputJsonValue,
      pricingTier: data.pricingTier,
      pricingNotes: data.pricingNotes,
      integrationTypes: data.integrationTypes,
      externalUrl: data.externalUrl,
      status: data.status,
      scoreAccuracy: data.scoreAccuracy ?? null,
      scoreLatency: data.scoreLatency ?? null,
      scoreReliability: data.scoreReliability ?? null,
      scoreEaseOfUse: data.scoreEaseOfUse ?? null,
      scoreCostEfficiency: data.scoreCostEfficiency ?? null,
      lastTestedAt: data.lastTestedAt ? new Date(data.lastTestedAt) : null,
      testVersion: data.testVersion ?? null,
    },
  })

  return NextResponse.json({ agent })
}

// DELETE /api/admin/agents/[id]
export async function DELETE(_req: Request, { params }: Ctx) {
  const denied = await requireAdmin()
  if (denied) return denied

  await db.agent.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
