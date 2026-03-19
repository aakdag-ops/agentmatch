import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/requireAdmin"
import { z } from "zod"

const PatchSchema = z.object({
  status: z.enum(["pending", "accepted", "rejected"]),
  notes: z.string().optional(),
})

// PATCH /api/admin/submissions/[id]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  const body = await req.json()
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const submission = await db.submission.update({
    where: { id: params.id },
    data: parsed.data,
  })

  return NextResponse.json({ submission })
}

// DELETE /api/admin/submissions/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdmin()
  if (denied) return denied

  await db.submission.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
