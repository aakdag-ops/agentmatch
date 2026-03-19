"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AgentTableActions({ agentId }: { agentId: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm("Delete this agent? This cannot be undone.")) return
    setDeleting(true)
    await fetch(`/api/admin/agents/${agentId}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Link
        href={`/admin/agents/${agentId}`}
        style={{
          fontSize: "0.78rem",
          color: "var(--amber)",
          textDecoration: "none",
          fontWeight: 500,
        }}
      >
        Edit
      </Link>
      <span style={{ color: "var(--border)" }}>|</span>
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          fontSize: "0.78rem",
          color: "var(--risk-critical)",
          background: "none",
          border: "none",
          cursor: deleting ? "wait" : "pointer",
          padding: 0,
          fontWeight: 500,
        }}
      >
        {deleting ? "…" : "Delete"}
      </button>
    </div>
  )
}
