import { NextResponse } from "next/server"
import { matchSolution } from "@/lib/solutions/matcher"
import { getSolution } from "@/lib/solutions"

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    if (!query || typeof query !== "string") {
      return NextResponse.json({ matched: null })
    }

    const match = await matchSolution(query)
    if (!match) return NextResponse.json({ matched: null })

    const solution = getSolution(match.slug)
    return NextResponse.json({ matched: solution ? { ...solution, ...match } : null })
  } catch {
    return NextResponse.json({ matched: null })
  }
}
