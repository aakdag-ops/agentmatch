import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// DELETE /api/saved-searches/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const record = await db.savedSearch.findUnique({ where: { id: params.id } })
  if (!record || record.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await db.savedSearch.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
