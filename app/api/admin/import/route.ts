import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/admin/requireAdmin"
import { Prisma } from "@prisma/client"
import { z } from "zod"

// CSV columns (all string, parsed below):
// name,vendor,tagline,description,externalUrl,pricingTier,categoryTags,industryTags,
// businessSizeFit,integrationTypes,capabilities,weaknesses,
// scoreAccuracy,scoreLatency,scoreReliability,scoreEaseOfUse,scoreCostEfficiency,
// testVersion,lastTestedAt,status

function parseList(val: string): string[] {
  return val
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
}

function parseJsonList(val: string): { text: string }[] {
  if (!val) return []
  return val
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((text) => ({ text }))
}

function parseFloat2(val: string): number | null {
  const n = parseFloat(val)
  return isNaN(n) ? null : Math.min(10, Math.max(0, n))
}

const RowSchema = z.object({
  name: z.string().min(1),
  vendor: z.string().min(1),
  tagline: z.string().min(1).max(160),
  description: z.string().min(1),
  externalUrl: z.string().url(),
  pricingTier: z.enum(["free", "freemium", "paid", "enterprise"]),
  categoryTags: z.string(),
  industryTags: z.string().default(""),
  businessSizeFit: z.string().default(""),
  integrationTypes: z.string().default(""),
  capabilities: z.string().min(1),
  weaknesses: z.string().min(1),
  scoreAccuracy: z.string().default(""),
  scoreLatency: z.string().default(""),
  scoreReliability: z.string().default(""),
  scoreEaseOfUse: z.string().default(""),
  scoreCostEfficiency: z.string().default(""),
  testVersion: z.string().default(""),
  lastTestedAt: z.string().default(""),
  status: z.enum(["active", "deprecated", "under_review"]).default("active"),
})

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"(.*)"$/, "$1"))
  return lines.slice(1).map((line) => {
    // Simple CSV parse (handles quoted commas)
    const values: string[] = []
    let cur = ""
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === "," && !inQuotes) {
        values.push(cur.trim())
        cur = ""
      } else {
        cur += ch
      }
    }
    values.push(cur.trim())
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]))
  })
}

// POST /api/admin/import — multipart/form-data with "file" field (CSV)
export async function POST(req: Request) {
  const denied = await requireAdmin()
  if (denied) return denied

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const text = await file.text()
  const rows = parseCsv(text)
  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV is empty or invalid" }, { status: 400 })
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i]
    const parsed = RowSchema.safeParse(raw)
    if (!parsed.success) {
      results.errors.push(`Row ${i + 2}: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`)
      results.skipped++
      continue
    }
    const r = parsed.data

    // Check weaknesses invariant
    const weaknesses = parseJsonList(r.weaknesses)
    if (weaknesses.length === 0) {
      results.errors.push(`Row ${i + 2}: weaknesses column is empty (editorial invariant requires ≥1)`)
      results.skipped++
      continue
    }

    try {
      await db.agent.create({
        data: {
          name: r.name,
          vendor: r.vendor,
          tagline: r.tagline,
          description: r.description,
          externalUrl: r.externalUrl,
          pricingTier: r.pricingTier,
          categoryTags: parseList(r.categoryTags),
          industryTags: parseList(r.industryTags),
          businessSizeFit: parseList(r.businessSizeFit) as Prisma.AgentCreateInput["businessSizeFit"],
          integrationTypes: parseList(r.integrationTypes),
          capabilities: parseJsonList(r.capabilities) as Prisma.InputJsonValue,
          weaknesses: weaknesses as Prisma.InputJsonValue,
          scoreAccuracy: parseFloat2(r.scoreAccuracy),
          scoreLatency: parseFloat2(r.scoreLatency),
          scoreReliability: parseFloat2(r.scoreReliability),
          scoreEaseOfUse: parseFloat2(r.scoreEaseOfUse),
          scoreCostEfficiency: parseFloat2(r.scoreCostEfficiency),
          testVersion: r.testVersion || null,
          lastTestedAt: r.lastTestedAt ? new Date(r.lastTestedAt) : null,
          status: r.status,
        },
      })
      results.created++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.errors.push(`Row ${i + 2} (${r.name}): ${msg}`)
      results.skipped++
    }
  }

  return NextResponse.json({
    message: `Import complete: ${results.created} created, ${results.skipped} skipped`,
    ...results,
  })
}
