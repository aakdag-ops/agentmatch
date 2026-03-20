"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"

export default function VerificationBanner() {
  const { data: session } = useSession()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Only show for email/password users who haven't verified yet
  if (
    !session?.user ||
    session.user.emailVerified ||
    dismissed
  ) {
    return null
  }

  async function handleResend() {
    setSending(true)
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" })
      setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      style={{
        background: "rgba(245,158,11,0.08)",
        borderBottom: "1px solid rgba(245,158,11,0.3)",
        padding: "0.6rem 1rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        fontSize: "0.85rem",
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: "var(--text-secondary)" }}>
        📧 Please verify your email address to unlock all features.
      </span>

      {sent ? (
        <span style={{ color: "var(--amber)", fontWeight: 600 }}>
          ✓ Verification email sent — check your inbox.
        </span>
      ) : (
        <button
          onClick={handleResend}
          disabled={sending}
          style={{
            background: "none",
            border: "none",
            color: "var(--amber)",
            fontWeight: 600,
            cursor: sending ? "not-allowed" : "pointer",
            opacity: sending ? 0.6 : 1,
            padding: 0,
            fontSize: "0.85rem",
            textDecoration: "underline",
          }}
        >
          {sending ? "Sending…" : "Resend email"}
        </button>
      )}

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          cursor: "pointer",
          padding: "0 0.25rem",
          fontSize: "1rem",
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
