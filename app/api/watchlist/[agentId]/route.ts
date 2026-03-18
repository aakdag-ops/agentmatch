import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// DELETE /api/watchlist/[agentId] — remove agent from watchlist
export async function DELETE(
  _req: Request,
  { params }: { params: { agentId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = params

  try {
    await db.savedAgent.delete({
      where: { userId_agentId: { userId: session.user.id, agentId } },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}

// GET /api/watchlist/[agentId] — check if agent is in watchlist
export async function GET(
  _req: Request,
  { params }: { params: { agentId: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ saved: false })
  }

  const { agentId } = params
  const record = await db.savedAgent.findUnique({
    where: { userId_agentId: { userId: session.user.id, agentId } },
  })

  return NextResponse.json({ saved: !!record })
}
