import { db } from "@/lib/db"
import Link from "next/link"
import { AgentTableActions } from "./AgentTableActions"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: { q?: string; page?: string; status?: string }
}

const PAGE_SIZE = 20

export default async function AdminAgentsPage({ searchParams }: Props) {
  const q = searchParams.q ?? ""
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10))
  const status = searchParams.status as "active" | "deprecated" | "under_review" | undefined

  const where = {
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { vendor: { contains: q, mode: "insensitive" as const } },
      ],
    }),
    ...(status && { status }),
  }

  const [agents, total] = await Promise.all([
    db.agent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      select: {
        id: true,
        name: true,
        vendor: true,
        status: true,
        pricingTier: true,
        categoryTags: true,
        scoreAccuracy: true,
        scoreLatency: true,
        scoreReliability: true,
        scoreEaseOfUse: true,
        scoreCostEfficiency: true,
        createdAt: true,
      },
    }),
    db.agent.count({ where }),
  ])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  const STATUS_COLORS: Record<string, string> = {
    active: "rgba(34,197,94,0.15)",
    deprecated: "rgba(107,114,128,0.15)",
    under_review: "rgba(245,158,11,0.15)",
  }
  const STATUS_TEXT: Record<string, string> = {
    active: "var(--risk-low)",
    deprecated: "var(--text-muted)",
    under_review: "var(--amber)",
  }

  function avgScore(agent: typeof agents[0]) {
    const vals = [
      agent.scoreAccuracy,
      agent.scoreLatency,
      agent.scoreReliability,
      agent.scoreEaseOfUse,
      agent.scoreCostEfficiency,
    ].filter((v): v is number => v !== null)
    if (!vals.length) return null
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          Agents ({total})
        </h1>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link
            href="/admin/agents/import"
            style={{
              padding: "0.5rem 1rem",
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              borderRadius: "var(--radius)",
              fontWeight: 500,
              fontSize: "0.85rem",
              textDecoration: "none",
            }}
          >
            📥 CSV Import
          </Link>
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

      {/* Filters */}
      <form
        method="GET"
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or vendor…"
          style={{
            flex: "1 1 200px",
            padding: "0.5rem 0.875rem",
            background: "var(--bg-deep)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
            outline: "none",
          }}
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          style={{
            padding: "0.5rem 0.875rem",
            background: "var(--bg-deep)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--text-primary)",
            fontSize: "0.875rem",
            outline: "none",
            cursor: "pointer",
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="under_review">Under review</option>
          <option value="deprecated">Deprecated</option>
        </select>
        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            background: "var(--amber)",
            color: "#000",
            border: "none",
            borderRadius: "var(--radius)",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--border)",
                background: "rgba(0,0,0,0.02)",
              }}
            >
              {["Name", "Vendor", "Category", "Pricing", "Avg Score", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0.625rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                  }}
                >
                  No agents found.
                </td>
              </tr>
            ) : (
              agents.map((agent, i) => {
                const avg = avgScore(agent)
                return (
                  <tr
                    key={agent.id}
                    style={{
                      borderBottom:
                        i < agents.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      <Link
                        href={`/agents/${agent.id}`}
                        target="_blank"
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {agent.name}
                      </Link>
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {agent.vendor}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {agent.categoryTags[0]}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {agent.pricingTier}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {avg !== null ? (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            color:
                              avg >= 8
                                ? "var(--risk-low)"
                                : avg >= 5
                                  ? "var(--amber)"
                                  : "var(--risk-critical)",
                          }}
                        >
                          {avg.toFixed(1)}
                        </span>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                          background: STATUS_COLORS[agent.status] ?? "rgba(107,114,128,0.15)",
                          color: STATUS_TEXT[agent.status] ?? "var(--text-muted)",
                        }}
                      >
                        {agent.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <AgentTableActions agentId={agent.id} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
          }}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/agents?q=${q}&status=${status ?? ""}&page=${p}`}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                background: p === page ? "var(--amber)" : "var(--bg-panel)",
                color: p === page ? "#000" : "var(--text-secondary)",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: p === page ? 700 : 400,
              }}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
