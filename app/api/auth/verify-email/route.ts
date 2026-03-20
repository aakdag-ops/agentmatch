import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")
  const base = new URL(request.url).origin

  if (!token) {
    return NextResponse.redirect(`${base}/verify-email?error=missing`)
  }

  const record = await db.emailVerificationToken.findUnique({
    where: { token },
  })

  if (!record) {
    return NextResponse.redirect(`${base}/verify-email?error=invalid`)
  }

  if (record.expiresAt < new Date()) {
    await db.emailVerificationToken.delete({ where: { token } })
    return NextResponse.redirect(`${base}/verify-email?error=expired`)
  }

  // Mark user as verified and delete the token atomically
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    }),
    db.emailVerificationToken.delete({ where: { token } }),
  ])

  return NextResponse.redirect(`${base}/verify-email?success=true`)
}
