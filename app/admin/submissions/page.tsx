import { db } from "@/lib/db"
import { SubmissionActions } from "./SubmissionActions"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: { status?: string }
}

export default async function AdminSubmissionsPage({ searchParams }: Props) {
  const status = searchParams.status as "pending" | "accepted" | "rejected" | undefined

  const submissions = await db.submission.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  })

  const counts = await db.submission.groupBy({
    by: ["status"],
    _count: { _all: true },
  })
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]))

  const STATUS_COLORS: Record<string, string> = {
    pending: "rgba(245,158,11,0.15)",
    accepted: "rgba(34,197,94,0.15)",
    rejected: "rgba(239,68,68,0.15)",
  }
  const STATUS_TEXT: Record<string, string> = {
    pending: "var(--amber)",
    accepted: "var(--risk-low)",
    rejected: "var(--risk-critical)",
  }

  const TABS = [
    { label: "All", value: "" },
    { label: `Pending (${countMap.pending ?? 0})`, value: "pending" },
    { label: `Accepted (${countMap.accepted ?? 0})`, value: "accepted" },
    { label: `Rejected (${countMap.rejected ?? 0})`, value: "rejected" },
  ]

  return (
    <div>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "1.5rem",
        }}
      >
        Submissions ({submissions.length})
      </h1>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1.5rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "0",
        }}
      >
        {TABS.map((tab) => (
          <a
            key={tab.value}
            href={`/admin/submissions${tab.value ? `?status=${tab.value}` : ""}`}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              fontWeight: 500,
              color: (status ?? "") === tab.value ? "var(--amber)" : "var(--text-secondary)",
              borderBottom: (status ?? "") === tab.value ? "2px solid var(--amber)" : "2px solid transparent",
              textDecoration: "none",
              marginBottom: "-1px",
            }}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {submissions.length === 0 ? (
        <div
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "3rem",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          No submissions.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {submissions.map((sub) => (
            <div
              key={sub.id}
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
                  alignItems: "flex-start",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                      {sub.agentName}
                    </span>
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
                  <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                    Category: {sub.category} · Submitted by: {sub.submitterEmail}
                  </div>
                  <a
                    href={sub.agentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.8rem", color: "var(--amber)", textDecoration: "none" }}
                  >
                    {sub.agentUrl} ↗
                  </a>
                  {sub.notes && (
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "var(--text-muted)",
                        marginTop: "0.5rem",
                        lineHeight: 1.5,
                      }}
                    >
                      {sub.notes}
                    </p>
                  )}
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                    {new Date(sub.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <SubmissionActions submissionId={sub.id} currentStatus={sub.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
