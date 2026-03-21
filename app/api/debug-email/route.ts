import { NextResponse } from "next/server"
import { sendVerificationEmail } from "@/lib/email"

// TEMPORARY DEBUG ENDPOINT — remove after testing
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get("secret")
  const to = searchParams.get("to")

  if (secret !== process.env.NEXTAUTH_SECRET?.slice(0, 16)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }
  if (!to) {
    return NextResponse.json({ error: "?to= required" }, { status: 400 })
  }

  try {
    await sendVerificationEmail(to, "debug-token-123")
    return NextResponse.json({ ok: true, message: "Email sent successfully" })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    return NextResponse.json({ ok: false, error: message, stack }, { status: 500 })
  }
}
