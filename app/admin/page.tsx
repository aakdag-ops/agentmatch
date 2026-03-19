import { db } from "@/lib/db"
import Link from "next/link"

export const dynamic = "force-dynamic"

async function getStats() {
  const [agents, submissions, users, pendingSubmissions] = await Promise.all([
    db.agent.count(),
    db.submission.count(),
    db.user.count(),
    db.submission.count({ where: { status: "pending" } }),
  ])
  return { agents, submissions, users, pendingSubmissions }
}

async function getRecentSubmissions() {
  return db.submission.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  })
}

async function getRecentAgents() {
  return db.agent.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      vendor: true,
      status: true,
      createdAt: true,
      categoryTags: true,
    },
  })
}

const STATUS_COLORS: Record<string, string> = {
  pending: "rgba(245,158,11,0.15)",
  accepted: "rgba(34,197,94,0.15)",
  rejected: "rgba(239,68,68,0.15)",
  active: "rgba(34,197,94,0.15)",
  deprecated: "rgba(107,114,128,0.15)",
  under_review: "rgba(245,158,11,0.15)",
}
const STATUS_TEXT: Record<string, string> = {
  pending: "var(--amber)",
  accepted: "var(--risk-low)",
  rejected: "var(--risk-critical)",
  active: "var(--risk-low)",
  deprecated: "var(--text-muted)",
  under_review: "var(--amber)",
}

export default async function AdminOverviewPage() {
  const [stats, recentSubmissions, recentAgents] = await Promise.all([
    getStats(),
    getRecentSubmissions(),
    getRecentAgents(),
  ])

  const statCards = [
    { label: "Total Agents", value: stats.agents, href: "/admin/agents", icon: "🤖" },
    { label: "Total Users", value: stats.users, href: null, icon: "👤" },
    { label: "Total Submissions", value: stats.submissions, href: "/admin/submissions", icon: "📬" },
    {
      label: "Pending Review",
      value: stats.pendingSubmissions,
      href: "/admin/submissions",
      icon: "⏳",
      highlight: stats.pendingSubmissions > 0,
    },
  ]

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Overview
        </h1>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link
            href="/admin/agents/new"
            style={{
              padding: "0.5rem 1rem",
              background: "var(--amber)",
              color: "#000",
              borderRadius: "var(--radius)",
              fontWeight: 600,
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            + Add Agent
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: card.highlight
                ? "rgba(245,158,11,0.06)"
                : "var(--bg-panel)",
              border: card.highlight
                ? "1px solid rgba(245,158,11,0.3)"
                : "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: card.highlight ? "var(--amber)" : "var(--text-primary)",
                    lineHeight: 1,
                  }}
                >
                  {card.value}
                </div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    marginTop: "0.3rem",
                  }}
                >
                  {card.label}
                </div>
              </div>
              <span style={{ fontSize: "1.25rem" }}>{card.icon}</span>
            </div>
            {card.href && (
              <Link
                href={card.href}
                style={{
                  display: "block",
                  marginTop: "0.75rem",
                  fontSize: "0.75rem",
                  color: "var(--amber)",
                  textDecoration: "none",
                }}
              >
                View all →
              </Link>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* Recent Agents */}
        <div
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Recent Agents
            </h2>
            <Link
              href="/admin/agents"
              style={{ fontSize: "0.78rem", color: "var(--amber)", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {recentAgents.map((agent) => (
              <Link
                key={agent.id}
                href={`/admin/agents/${agent.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textDecoration: "none",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {agent.name}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {agent.vendor} · {agent.categoryTags[0]}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "4px",
                    background: STATUS_COLORS[agent.status] ?? "rgba(107,114,128,0.15)",
                    color: STATUS_TEXT[agent.status] ?? "var(--text-muted)",
                  }}
                >
                  {agent.status}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Submissions */}
        <div
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Recent Submissions
            </h2>
            <Link
              href="/admin/submissions"
              style={{ fontSize: "0.78rem", color: "var(--amber)", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {recentSubmissions.length === 0 ? (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                No submissions yet.
              </p>
            ) : (
              recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {sub.agentName}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {sub.category} · {sub.submitterEmail}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      padding: "0.15rem 0.5rem",
                      borderRadius: "4px",
                      background: STATUS_COLORS[sub.status] ?? "rgba(107,114,128,0.15)",
                      color: STATUS_TEXT[sub.status] ?? "var(--text-muted)",
                    }}
                  >
                    {sub.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
