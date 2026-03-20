"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"

export default function VerifyEmailPage() {
  const params = useSearchParams()
  const success = params.get("success") === "true"
  const error = params.get("error")
  const [resent, setResent] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleResend() {
    setResending(true)
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" })
      setResent(true)
    } finally {
      setResending(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "2.5rem",
          textAlign: "center",
        }}
      >
        {success ? (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Email verified!
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Your email address has been confirmed. You now have full access to AgentMatch.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "0.6rem 1.5rem",
                background: "var(--amber)",
                color: "#000",
                fontWeight: 700,
                borderRadius: "var(--radius)",
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              Go to AgentMatch →
            </Link>
          </>
        ) : error === "expired" ? (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏰</div>
            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Link expired
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              This verification link has expired (links are valid for 24 hours). Request a new one below.
            </p>
            {resent ? (
              <p style={{ color: "var(--risk-low)", fontWeight: 600 }}>
                ✓ New verification email sent — check your inbox.
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                style={{
                  padding: "0.6rem 1.5rem",
                  background: "var(--amber)",
                  color: "#000",
                  fontWeight: 700,
                  borderRadius: "var(--radius)",
                  border: "none",
                  cursor: resending ? "not-allowed" : "pointer",
                  opacity: resending ? 0.6 : 1,
                  fontSize: "0.9rem",
                }}
              >
                {resending ? "Sending…" : "Resend verification email"}
              </button>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>❌</div>
            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "0.5rem",
              }}
            >
              Invalid link
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              This verification link is invalid or has already been used.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-block",
                padding: "0.6rem 1.5rem",
                background: "var(--bg-panel)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                fontWeight: 600,
                borderRadius: "var(--radius)",
                textDecoration: "none",
                fontSize: "0.9rem",
              }}
            >
              Back to home
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
