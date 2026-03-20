"use client"

import Link from "next/link"

const NAV = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/agents", label: "Agents", icon: "🤖" },
  { href: "/admin/submissions", label: "Submissions", icon: "📬" },
]

export default function AdminSidebar() {
  return (
    <aside
      style={{
        width: "220px",
        flexShrink: 0,
        background: "var(--bg-panel)",
        borderRight: "1px solid var(--border)",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      <div
        style={{
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          padding: "0 0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        Admin Panel
      </div>
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius)",
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 500,
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.background =
              "rgba(245,158,11,0.08)"
            ;(e.currentTarget as HTMLElement).style.color =
              "var(--text-primary)"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = "transparent"
            ;(e.currentTarget as HTMLElement).style.color =
              "var(--text-secondary)"
          }}
        >
          <span>{item.icon}</span>
          {item.label}
        </Link>
      ))}

      <div style={{ flex: 1 }} />

      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "var(--radius)",
          color: "var(--text-muted)",
          textDecoration: "none",
          fontSize: "0.8rem",
          marginTop: "1rem",
        }}
      >
        ← Back to site
      </Link>
    </aside>
  )
}
