import type { Metadata } from "next"
import { SubmitForm } from "./SubmitForm"

export const metadata: Metadata = {
  title: "Submit an Agent — AgentMatch",
  description:
    "Know an AI agent that should be listed on AgentMatch? Submit it for review and we'll evaluate it against our scoring rubric.",
  openGraph: {
    title: "Submit an AI Agent — AgentMatch",
    description: "Nominate an AI agent for independent evaluation and listing on AgentMatch.",
  },
}

export default function SubmitPage() {
  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        padding: "3rem 1.5rem",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📬</div>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
            marginBottom: "0.75rem",
          }}
        >
          Submit an AI Agent
        </h1>
        <p
          style={{
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            fontSize: "0.95rem",
          }}
        >
          Know an agent that deserves independent evaluation? Submit it below.
          Our team reviews every submission and evaluates it against our{" "}
          <strong style={{ color: "var(--text-primary)" }}>scoring rubric</strong>{" "}
          — including mandatory weaknesses disclosure.
        </p>
      </div>

      {/* Promise box */}
      <div
        style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "var(--radius)",
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--amber)" }}>Our editorial promise:</strong>{" "}
        Submission does not guarantee listing. Rankings are never influenced by
        commercial relationships. All listed agents must have documented weaknesses.
      </div>

      <SubmitForm />
    </div>
  )
}
