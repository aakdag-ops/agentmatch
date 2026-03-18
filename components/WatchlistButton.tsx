"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Props {
  agentId: string
  initialSaved?: boolean
}

export function WatchlistButton({ agentId, initialSaved = false }: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!session?.user) return
    fetch(`/api/watchlist/${agentId}`)
      .then((r) => r.json())
      .then((d) => setSaved(d.saved))
      .catch(() => {})
  }, [agentId, session])

  async function toggle() {
    if (!session?.user) {
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname))
      return
    }
    setLoading(true)
    try {
      if (saved) {
        await fetch(`/api/watchlist/${agentId}`, { method: "DELETE" })
        setSaved(false)
      } else {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId }),
        })
        setSaved(true)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1.25rem",
        borderRadius: "var(--radius)",
        border: saved ? "1px solid var(--amber)" : "1px solid var(--border)",
        background: saved ? "rgba(245,158,11,0.1)" : "var(--bg-panel)",
        color: saved ? "var(--amber)" : "var(--text-secondary)",
        cursor: loading ? "wait" : "pointer",
        fontSize: "0.875rem",
        fontWeight: 500,
        transition: "all 0.2s",
      }}
    >
      <span style={{ fontSize: "1rem" }}>{saved ? "★" : "☆"}</span>
      {saved ? "Watching" : "Watch"}
    </button>
  )
}
