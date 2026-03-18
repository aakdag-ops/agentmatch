import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import type { Session } from "next-auth"

export async function getSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

/**
 * Returns the session if authenticated, otherwise returns a 401 NextResponse.
 * Usage: const result = await requireAuth(); if (result instanceof NextResponse) return result;
 */
export async function requireAuth(): Promise<Session | NextResponse> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  return session
}

/**
 * Returns the session if user has admin role, otherwise returns 401/403.
 */
export async function requireAdmin(): Promise<Session | NextResponse> {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }
  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 })
  }
  return session
}
