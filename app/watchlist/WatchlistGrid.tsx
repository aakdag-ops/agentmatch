"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface WatchlistItem {
  id: string
  name: string
  tagline: string
  categoryName: string | null
  pricingModel: string
  avg: number | null
  savedAt: string
}

interface Props {
  items: WatchlistItem[]
}

const PRICING_LABELS: Record<string, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  enterprise: "Enterprise",
}

export function WatchlistGrid({ items: initial }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleRemove(agentId: string) {
    setRemoving(agentId)
    await fetch(`/api/watchlist/${agentId}`, { method: "DELETE" })
    setItems((prev) => prev.filter((i) => i.id !== agentId))
    setRemoving(null)
    router.refresh()
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1rem",
      }}
    >
      {items.map((agent) => (
        <div
          key={agent.id}
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            opacity: removing === agent.id ? 0.5 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {/* Top row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}
          >
            <div style={{ flex: 1 }}>
              <Link
                href={`/agents/${agent.id}`}
                style={{
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  fontSize: "1rem",
                  textDecoration: "none",
                }}
              >
                {agent.name}
              </Link>
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  marginTop: "0.2rem",
                }}
              >
                {agent.categoryName} ·{" "}
                {PRICING_LABELS[agent.pricingModel] ?? agent.pricingModel}
              </div>
            </div>

            {agent.avg !== null && (
              <div
                style={{
                  background:
                    agent.avg >= 8
                      ? "rgba(34,197,94,0.12)"
                      : agent.avg >= 5
                        ? "rgba(245,158,11,0.12)"
                        : "rgba(239,68,68,0.12)",
                  color:
                    agent.avg >= 8
                      ? "var(--risk-low)"
                      : agent.avg >= 5
                        ? "var(--amber)"
                        : "var(--risk-critical)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  borderRadius: "4px",
                  padding: "0.2rem 0.5rem",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {agent.avg.toFixed(1)}
              </div>
            )}
          </div>

          {/* Tagline */}
          <p
            style={{
              fontSize: "0.83rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {agent.tagline}
          </p>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              paddingTop: "0.5rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <Link
              href={`/agents/${agent.id}`}
              style={{
                fontSize: "0.82rem",
                color: "var(--amber)",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              View profile →
            </Link>
            <button
              onClick={() => handleRemove(agent.id)}
              disabled={removing === agent.id}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "0.25rem 0.75rem",
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                cursor: removing === agent.id ? "wait" : "pointer",
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
