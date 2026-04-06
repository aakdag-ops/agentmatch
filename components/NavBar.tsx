"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import SearchInput from "./SearchInput"

export default function NavBar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isHomepage = pathname === "/"

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 font-bold text-gray-900 text-lg tracking-tight hover:text-blue-600 transition-colors"
        >
          AgentMatch
        </Link>

        {/* Search — hidden on homepage (hero has the main search) */}
        {!isHomepage && (
          <div className="flex-1 max-w-xl hidden sm:block">
            <SearchInput size="compact" />
          </div>
        )}

        <div className="flex-1" />

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link
            href="/search"
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Browse
          </Link>
          <Link
            href="/solutions"
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Solutions
          </Link>
          <Link
            href="/submit"
            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Submit Agent
          </Link>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {session ? (
            <>
              {session.user.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-xs text-purple-600 font-medium bg-purple-50 px-2.5 py-1 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/watchlist"
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ★ Watchlist
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
