import { CsvImportForm } from "./CsvImportForm"
import Link from "next/link"

export default function CsvImportPage() {
  return (
    <div style={{ maxWidth: "720px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
        <Link
          href="/admin/agents"
          style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}
        >
          ← Agents
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
          CSV Import
        </h1>
      </div>

      <div
        style={{
          background: "rgba(245,158,11,0.05)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "var(--radius)",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          fontSize: "0.83rem",
          color: "var(--text-secondary)",
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: "var(--amber)" }}>Required CSV columns:</strong>{" "}
        <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
          name, vendor, tagline, description, externalUrl, pricingTier, categoryTags, weaknesses, capabilities
        </code>
        <br />
        <strong style={{ color: "var(--amber)" }}>Optional:</strong>{" "}
        <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
          industryTags, businessSizeFit, integrationTypes, scoreAccuracy, scoreLatency, scoreReliability,
          scoreEaseOfUse, scoreCostEfficiency, testVersion, lastTestedAt, status
        </code>
        <br />
        <strong style={{ color: "var(--amber)" }}>Multi-value columns</strong> use{" "}
        <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>|</code> as separator.
        <br />
        <strong style={{ color: "var(--risk-critical)" }}>⚠️ weaknesses must be non-empty</strong> — rows
        without weaknesses will be skipped (editorial invariant).
      </div>

      <CsvImportForm />

      <div
        style={{
          marginTop: "1.5rem",
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "1rem 1.25rem",
        }}
      >
        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
          Example CSV row
        </div>
        <pre
          style={{
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            overflowX: "auto",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
{`name,vendor,tagline,description,externalUrl,pricingTier,categoryTags,weaknesses,capabilities
"Fin","Intercom","AI support agent for SaaS","Fin resolves 50%+ of support tickets autonomously.","https://intercom.com/fin",freemium,"customer support|helpdesk","Requires setup|No phone support","Resolves tickets|Drafts replies"`}
        </pre>
      </div>
    </div>
  )
}
