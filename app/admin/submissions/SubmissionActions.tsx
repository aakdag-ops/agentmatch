"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

interface Props {
  submissionId: string
  currentStatus: string
}

export function SubmissionActions({ submissionId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function update(status: "accepted" | "rejected" | "pending") {
    setLoading(true)
    await fetch(`/api/admin/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    router.refresh()
  }

  if (currentStatus !== "pending") {
    return (
      <button
        onClick={() => update("pending")}
        disabled={loading}
        style={{
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "0.3rem 0.75rem",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        Reset to pending
      </button>
    )
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
      <button
        onClick={() => update("accepted")}
        disabled={loading}
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "var(--risk-low)",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: "var(--radius)",
          padding: "0.35rem 0.875rem",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        ✓ Accept
      </button>
      <button
        onClick={() => update("rejected")}
        disabled={loading}
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: "var(--risk-critical)",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.3)",
          borderRadius: "var(--radius)",
          padding: "0.35rem 0.875rem",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        ✕ Reject
      </button>
    </div>
  )
}
