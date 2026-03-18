"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface Props {
  id: string
  query: string
  filters: Record<string, unknown>
}

export function SavedSearchRow({ id, query, filters }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const hasFilters = Object.keys(filters).length > 0
  const url = `/search?q=${encodeURIComponent(query)}`

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/saved-searches/${id}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <div
      style={{
        background: "var(--bg-panel)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "1rem 1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        opacity: deleting ? 0.5 : 1,
      }}
    >
      <div>
        <Link
          href={url}
          style={{
            fontWeight: 600,
            color: "var(--text-primary)",
            textDecoration: "none",
            fontSize: "0.95rem",
          }}
        >
          &ldquo;{query}&rdquo;
        </Link>
        {hasFilters && (
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              marginTop: "0.2rem",
            }}
          >
            {Object.entries(filters)
              .filter(([, v]) => v)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" · ")}
          </div>
        )}
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          cursor: deleting ? "wait" : "pointer",
          fontSize: "1rem",
          padding: "0.25rem 0.5rem",
          borderRadius: "4px",
        }}
        title="Delete saved search"
      >
        ✕
      </button>
    </div>
  )
}
