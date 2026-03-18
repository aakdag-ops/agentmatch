import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/watchlist — list all saved agents for the current user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const saved = await db.savedAgent.findMany({
    where: { userId: session.user.id },
    include: { agent: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ items: saved })
}

// POST /api/watchlist — add an agent to watchlist
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await req.json()
  if (!agentId) {
    return NextResponse.json({ error: "agentId required" }, { status: 400 })
  }

  // Check agent exists
  const agent = await db.agent.findUnique({ where: { id: agentId } })
  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  const saved = await db.savedAgent.upsert({
    where: { userId_agentId: { userId: session.user.id, agentId } },
    create: { userId: session.user.id, agentId },
    update: {},
  })

  return NextResponse.json({ saved }, { status: 201 })
}
