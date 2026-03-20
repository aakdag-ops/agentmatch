import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user || !user.hashedPassword) {
          return null
        }

        const isValid = await compare(credentials.password, user.hashedPassword)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn({ user, account }) {
      // Handle Google OAuth: create or link user record
      if (account?.provider === "google") {
        const existing = await db.user.findUnique({
          where: { email: user.email! },
        })

        if (!existing) {
          await db.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              oauthProvider: "google",
              oauthId: account.providerAccountId,
              emailVerified: true, // Google accounts are pre-verified
            },
          })
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        // Persist role and id into the token on first sign-in
        token.id = user.id
        token.role = (user as { role?: string }).role ?? "user"
      }
      // Re-hydrate role + emailVerified on every request (may have changed)
      if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, emailVerified: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.emailVerified = dbUser.emailVerified
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.emailVerified = token.emailVerified ?? false
      }
      return session
    },
  },
}
