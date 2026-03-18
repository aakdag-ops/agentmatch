"use client"

import { Suspense, useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import SearchInput from "@/components/SearchInput"
import AgentCard from "@/components/AgentCard"
import FilterSidebar from "@/components/FilterSidebar"
import type { SearchFilters } from "@/lib/search/index"
import type { Agent } from "@prisma/client"

interface SearchResult {
  agent: Agent
  score: number
  whyMatched: string
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const q = searchParams.get("q") ?? ""
  const [filters, setFilters] = useState<SearchFilters>({})
  const [results, setResults] = useState<SearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [intent, setIntent] = useState<{ categoryTags: string[]; summary: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const abortRef = useRef<AbortController | null>(null)

  const runSearch = useCallback(
    async (query: string, activeFilters: SearchFilters) => {
      if (!query.trim()) return
      abortRef.current?.abort()
      abortRef.current = new AbortController()
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, filters: activeFilters }),
          signal: abortRef.current.signal,
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? "Search failed")
        setResults(data.results ?? [])
        setTotal(data.total ?? 0)
        setIntent(data.intent ?? null)
      } catch (e: unknown) {
        if ((e as Error).name !== "AbortError") {
          setError("Search failed. Please try again.")
        }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Run search when URL query changes
  useEffect(() => {
    if (q) runSearch(q, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  // Re-run search when filters change (only if we have a query)
  useEffect(() => {
    if (q) runSearch(q, filters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  function handleSearch(query: string) {
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const hasActiveFilters = Object.values(filters).some((v) =>
    Array.isArray(v) ? v.length > 0 : !!v
  )

  return (
    <>
      {/* noindex for search result pages */}
      <meta name="robots" content="noindex,follow" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Mobile search */}
        <div className="sm:hidden mb-4">
          <SearchInput initialValue={q} onSearch={handleSearch} />
        </div>

        <div className="flex gap-8">
          {/* Sidebar — desktop always visible, mobile as overlay */}
          <aside
            className={`shrink-0 w-56 ${
              sidebarOpen
                ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto sm:relative sm:inset-auto sm:z-auto sm:p-0"
                : "hidden sm:block"
            }`}
          >
            {sidebarOpen && (
              <button
                className="sm:hidden mb-4 text-sm text-gray-500"
                onClick={() => setSidebarOpen(false)}
              >
                ← Close filters
              </button>
            )}
            <FilterSidebar filters={filters} onChange={setFilters} />
          </aside>

          {/* Main results */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4 gap-4">
              <div>
                {q && !loading && (
                  <p className="text-sm text-gray-500">
                    {total > 0 ? (
                      <>
                        <span className="font-medium text-gray-900">{total}</span> results for{" "}
                        <span className="font-medium text-gray-900">&ldquo;{q}&rdquo;</span>
                        {intent?.summary && intent.summary !== q && (
                          <span className="ml-1 text-gray-400">— {intent.summary}</span>
                        )}
                      </>
                    ) : (
                      <>No results for &ldquo;{q}&rdquo;</>
                    )}
                  </p>
                )}
              </div>
              <button
                className="sm:hidden flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5"
                onClick={() => setSidebarOpen(true)}
              >
                Filters {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600" />}
              </button>
            </div>

            {/* Intent tags */}
            {intent?.categoryTags && intent.categoryTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {intent.categoryTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-50 text-blue-600 rounded-full px-2.5 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* States */}
            {loading && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {error && !loading && (
              <div className="text-center py-16 text-red-600">{error}</div>
            )}

            {!loading && !error && results.length === 0 && q && (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-2">No agents found for &ldquo;{q}&rdquo;</p>
                <p className="text-sm text-gray-400">
                  Try a broader search or{" "}
                  <button
                    onClick={() => setFilters({})}
                    className="text-blue-600 hover:underline"
                  >
                    clear filters
                  </button>
                </p>
              </div>
            )}

            {!loading && !q && (
              <div className="text-center py-16 text-gray-400">
                Enter a search above to find AI agents
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((r) => (
                  <AgentCard key={r.agent.id} agent={r.agent} whyMatched={r.whyMatched} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}
