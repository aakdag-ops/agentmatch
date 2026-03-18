import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import type { Metadata } from "next"
import { avgScore } from "@/lib/types"
import { SavedSearchRow } from "./SavedSearchRow"

export const metadata: Metadata = {
  title: "Dashboard — AgentMatch",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

async function getDashboardData(userId: string) {
  const [watchlist, savedSearches] = await Promise.all([
    db.savedAgent.findMany({
      where: { userId },
      include: { agent: true },
      orderBy: { createdAt: "desc" },
    }),
    db.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
  ])
  return { watchlist, savedSearches }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard")
  }

  const { watchlist, savedSearches } = await getDashboardData(session.user.id!)

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "2.5rem 1.5rem",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
          }}
        >
          Dashboard
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        {[
          { label: "Watched Agents", value: watchlist.length, icon: "★" },
          { label: "Saved Searches", value: savedSearches.length, icon: "🔍" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{stat.icon}</span>
            <div>
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "var(--amber)",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginTop: "0.25rem",
                }}
              >
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Watchlist */}
      <section style={{ marginBottom: "3rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            ★ Watching ({watchlist.length})
          </h2>
          <Link
            href="/watchlist"
            style={{
              fontSize: "0.85rem",
              color: "var(--amber)",
              textDecoration: "none",
            }}
          >
            View all →
          </Link>
        </div>

        {watchlist.length === 0 ? (
          <div
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "2rem",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>☆</div>
            <p>No watched agents yet.</p>{" "}
            <Link
              href="/search"
              style={{ color: "var(--amber)", textDecoration: "none" }}
            >
              Search agents →
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {watchlist.slice(0, 6).map(({ agent }) => {
              const avg = avgScore([
                agent.scoreAccuracy,
                agent.scoreLatency,
                agent.scoreReliability,
                agent.scoreEaseOfUse,
                agent.scoreCostEfficiency,
              ])
              return (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "var(--bg-panel)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      padding: "1.25rem",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            fontSize: "0.95rem",
                          }}
                        >
                          {agent.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                            marginTop: "0.2rem",
                          }}
                        >
                          {agent.categoryTags[0]}
                        </div>
                      </div>
                      {avg !== null && (
                        <div
                          style={{
                            background:
                              avg >= 8
                                ? "rgba(34,197,94,0.12)"
                                : avg >= 5
                                  ? "rgba(245,158,11,0.12)"
                                  : "rgba(239,68,68,0.12)",
                            color:
                              avg >= 8
                                ? "var(--risk-low)"
                                : avg >= 5
                                  ? "var(--amber)"
                                  : "var(--risk-critical)",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            borderRadius: "4px",
                            padding: "0.2rem 0.5rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {avg.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-secondary)",
                        marginTop: "0.6rem",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {agent.tagline}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* Saved Searches */}
      <section>
        <h2
          style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "1rem",
          }}
        >
          🔍 Saved Searches ({savedSearches.length})
        </h2>

        {savedSearches.length === 0 ? (
          <div
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "2rem",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <p>No saved searches yet.</p>{" "}
            <Link
              href="/search"
              style={{ color: "var(--amber)", textDecoration: "none" }}
            >
              Try a search →
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {savedSearches.map((s) => (
              <SavedSearchRow
                key={s.id}
                id={s.id}
                query={s.query}
                filters={s.filters as Record<string, unknown>}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
