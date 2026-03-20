import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { randomBytes } from "crypto"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, emailVerified: true },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 })
  }

  // Delete any existing tokens for this user and create a fresh one
  await db.emailVerificationToken.deleteMany({ where: { userId: session.user.id } })

  const token = randomBytes(32).toString("hex")
  await db.emailVerificationToken.create({
    data: {
      userId: session.user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  await sendVerificationEmail(user.email, token)

  return NextResponse.json({ ok: true })
}
