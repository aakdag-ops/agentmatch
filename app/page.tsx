// Homepage — Phase 2 will replace this with the full hero + search UI
// For Phase 0 this is a placeholder that confirms the app boots and auth works

import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-5xl font-bold text-gray-900">AgentMatch</h1>
        <p className="text-xl text-gray-500">
          The Search Engine for AI Agents
        </p>
        <p className="text-sm text-gray-400 bg-amber-50 border border-amber-200 rounded-lg p-4">
          Phase 0 scaffold — auth works, DB schema is live.
          Full UI coming in Phase 2.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Create account
          </Link>
        </div>
      </div>
    </main>
  )
}
