import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import type { Metadata } from "next"
import { avgScore } from "@/lib/types"
import { WatchlistGrid } from "./WatchlistGrid"

export const metadata: Metadata = {
  title: "My Watchlist — AgentMatch",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login?callbackUrl=/watchlist")
  }

  const watchlist = await db.savedAgent.findMany({
    where: { userId: session.user.id! },
    include: { agent: true },
    orderBy: { createdAt: "desc" },
  })

  const items = watchlist.map(({ agent, createdAt }) => ({
    id: agent.id,
    name: agent.name,
    tagline: agent.tagline,
    categoryName: agent.categoryTags[0] ?? null,
    pricingModel: agent.pricingTier,
    avg: avgScore([
      agent.scoreAccuracy,
      agent.scoreLatency,
      agent.scoreReliability,
      agent.scoreEaseOfUse,
      agent.scoreCostEfficiency,
    ]),
    savedAt: createdAt.toISOString(),
  }))

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "2.5rem 1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              fontFamily: "var(--font-display)",
            }}
          >
            ★ My Watchlist
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            {items.length} agent{items.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <Link
          href="/search"
          style={{
            padding: "0.6rem 1.25rem",
            background: "var(--amber)",
            color: "#000",
            borderRadius: "var(--radius)",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          + Discover more agents
        </Link>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>☆</div>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            Your watchlist is empty
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Browse agents and click the Watch button to save them here.
          </p>
          <Link
            href="/search"
            style={{
              padding: "0.6rem 1.5rem",
              background: "var(--amber)",
              color: "#000",
              borderRadius: "var(--radius)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Search agents
          </Link>
        </div>
      ) : (
        <WatchlistGrid items={items} />
      )}
    </div>
  )
}
