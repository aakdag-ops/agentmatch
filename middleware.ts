import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token

    // Admin routes require admin role
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/?error=unauthorized", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Only run the middleware function above if user is authenticated
      // For unauthenticated users, NextAuth redirects to signIn page automatically
      authorized: ({ token, req }) => {
        // /admin always requires auth
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token
        }
        // /dashboard and /watchlist require auth
        if (
          req.nextUrl.pathname.startsWith("/dashboard") ||
          req.nextUrl.pathname.startsWith("/watchlist")
        ) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/watchlist/:path*"],
}
