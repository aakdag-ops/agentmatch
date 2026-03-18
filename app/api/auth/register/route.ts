import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { z } from "zod"
import { db } from "@/lib/db"

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
        emailVerified: false, // Phase 2: send verification email via Resend
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("[register]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
