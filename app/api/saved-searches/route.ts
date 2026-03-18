import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const SaveSearchSchema = z.object({
  query: z.string().min(1).max(500),
  filters: z.record(z.unknown()).default({}),
})

// GET /api/saved-searches — list saved searches for current user
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searches = await db.savedSearch.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ items: searches })
}

// POST /api/saved-searches — save a search
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = SaveSearchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { query, filters } = parsed.data

  // Limit to 20 saved searches per user
  const count = await db.savedSearch.count({ where: { userId: session.user.id } })
  if (count >= 20) {
    return NextResponse.json(
      { error: "Maximum 20 saved searches allowed" },
      { status: 409 }
    )
  }

  const search = await db.savedSearch.create({
    data: { userId: session.user.id, query, filters: filters as Prisma.InputJsonValue },
  })

  return NextResponse.json({ search }, { status: 201 })
}
