import { AgentForm } from "../AgentForm"
import Link from "next/link"

export default function NewAgentPage() {
  return (
    <div style={{ maxWidth: "860px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
        <Link
          href="/admin/agents"
          style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}
        >
          ← Agents
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
          New Agent
        </h1>
      </div>
      <AgentForm />
    </div>
  )
}
