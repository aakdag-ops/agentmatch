import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { randomBytes } from "crypto"
import { z } from "zod"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  name: z.string().min(1).max(100).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, name } = parsed.data
    const normalisedEmail = email.toLowerCase().trim()

    const existing = await db.user.findUnique({
      where: { email: normalisedEmail },
    })

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await hash(password, 12)

    const user = await db.user.create({
      data: {
        email: normalisedEmail,
        hashedPassword,
        name: name ?? null,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    // Create verification token and send email (non-blocking — don't fail registration if email fails)
    try {
      const token = randomBytes(32).toString("hex")
      await db.emailVerificationToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      })
      await sendVerificationEmail(normalisedEmail, token)
    } catch (emailError) {
      console.error("[register] Failed to send verification email:", emailError)
      // Continue — user is created, they can request a new email later
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("[register]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
