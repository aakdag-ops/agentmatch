import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"

const SubmissionSchema = z.object({
  agentName: z.string().min(2).max(200),
  agentUrl: z.string().url(),
  category: z.string().min(2).max(100),
  submitterEmail: z.string().email(),
  notes: z.string().max(2000).optional(),
})

// POST /api/submissions — public agent submission (no auth required)
export async function POST(req: Request) {
  const body = await req.json()
  const parsed = SubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const submission = await db.submission.create({ data: parsed.data })
  return NextResponse.json({ submission }, { status: 201 })
}
