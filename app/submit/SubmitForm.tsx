"use client"

import { useState } from "react"

const CATEGORIES = [
  "Customer Support",
  "Sales & CRM",
  "Marketing",
  "Data & Analytics",
  "Developer Tools",
  "Finance & Accounting",
  "HR & Recruiting",
  "Legal",
  "Research",
  "Productivity",
  "Writing & Content",
  "Other",
]

interface FormState {
  agentName: string
  agentUrl: string
  category: string
  submitterEmail: string
  notes: string
}

const INITIAL: FormState = {
  agentName: "",
  agentUrl: "",
  category: "",
  submitterEmail: "",
  notes: "",
}

export function SubmitForm() {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  )
  const [errorMsg, setErrorMsg] = useState("")

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data.error?.formErrors?.[0] ?? "Something went wrong.")
        setStatus("error")
        return
      }

      setStatus("success")
      setForm(INITIAL)
    } catch {
      setErrorMsg("Network error. Please try again.")
      setStatus("error")
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "0.6rem 0.875rem",
    background: "var(--bg-deep)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box" as const,
  }

  const labelStyle = {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    marginBottom: "0.4rem",
  }

  if (status === "success") {
    return (
      <div
        style={{
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: "var(--radius)",
          padding: "2.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✅</div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          Submission received!
        </h2>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Thanks for the submission. Our team will review it and reach out if we
          need more information.
        </p>
        <button
          onClick={() => setStatus("idle")}
          style={{
            marginTop: "1.5rem",
            padding: "0.6rem 1.5rem",
            background: "var(--amber)",
            color: "#000",
            border: "none",
            borderRadius: "var(--radius)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      {/* Agent Name */}
      <div>
        <label style={labelStyle}>
          Agent Name <span style={{ color: "var(--risk-critical)" }}>*</span>
        </label>
        <input
          style={inputStyle}
          type="text"
          placeholder="e.g. Intercom Fin, Salesforce Einstein"
          value={form.agentName}
          onChange={set("agentName")}
          required
          minLength={2}
          maxLength={200}
        />
      </div>

      {/* Agent URL */}
      <div>
        <label style={labelStyle}>
          Agent URL <span style={{ color: "var(--risk-critical)" }}>*</span>
        </label>
        <input
          style={inputStyle}
          type="url"
          placeholder="https://example.com"
          value={form.agentUrl}
          onChange={set("agentUrl")}
          required
        />
      </div>

      {/* Category */}
      <div>
        <label style={labelStyle}>
          Category <span style={{ color: "var(--risk-critical)" }}>*</span>
        </label>
        <select
          style={{ ...inputStyle, cursor: "pointer" }}
          value={form.category}
          onChange={set("category")}
          required
        >
          <option value="">Select a category…</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Email */}
      <div>
        <label style={labelStyle}>
          Your Email <span style={{ color: "var(--risk-critical)" }}>*</span>
        </label>
        <input
          style={inputStyle}
          type="email"
          placeholder="you@example.com"
          value={form.submitterEmail}
          onChange={set("submitterEmail")}
          required
        />
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginTop: "0.3rem",
          }}
        >
          We&apos;ll only contact you if we need clarification.
        </p>
      </div>

      {/* Notes */}
      <div>
        <label style={labelStyle}>Why should this be listed? (optional)</label>
        <textarea
          style={{
            ...inputStyle,
            resize: "vertical",
            minHeight: "100px",
            fontFamily: "inherit",
          }}
          placeholder="What makes this agent stand out? Any known limitations?"
          value={form.notes}
          onChange={set("notes")}
          maxLength={2000}
        />
      </div>

      {/* Error */}
      {status === "error" && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "var(--radius)",
            padding: "0.75rem 1rem",
            color: "var(--risk-critical)",
            fontSize: "0.85rem",
          }}
        >
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        style={{
          padding: "0.75rem",
          background: status === "submitting" ? "rgba(245,158,11,0.5)" : "var(--amber)",
          color: "#000",
          border: "none",
          borderRadius: "var(--radius)",
          fontWeight: 700,
          fontSize: "0.95rem",
          cursor: status === "submitting" ? "wait" : "pointer",
          transition: "opacity 0.2s",
        }}
      >
        {status === "submitting" ? "Submitting…" : "Submit Agent"}
      </button>
    </form>
  )
}
