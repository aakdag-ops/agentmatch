"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { AgentFormData } from "@/lib/admin/agentSchema"

interface Props {
  initial?: Partial<AgentFormData>
  agentId?: string // if editing
}

const PRICING_TIERS = ["free", "freemium", "paid", "enterprise"]
const STATUSES = ["active", "under_review", "deprecated"]
const BUSINESS_SIZES = ["solo", "smb", "midmarket", "enterprise"]
const INTEGRATION_TYPES = ["api", "zapier", "n8n", "native", "no-code", "slack", "chrome-extension"]

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  background: "var(--bg-deep)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  color: "var(--text-primary)",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "var(--text-secondary)",
  marginBottom: "0.35rem",
}

const sectionStyle: React.CSSProperties = {
  background: "var(--bg-panel)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "1.25rem",
  marginBottom: "1.25rem",
}

const sectionTitle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "var(--text-primary)",
  marginBottom: "1rem",
  paddingBottom: "0.5rem",
  borderBottom: "1px solid var(--border)",
}

function Field({
  label,
  children,
  required,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div style={{ marginBottom: "0.875rem" }}>
      <label style={labelStyle}>
        {label}
        {required && (
          <span style={{ color: "var(--risk-critical)", marginLeft: "0.25rem" }}>*</span>
        )}
      </label>
      {children}
    </div>
  )
}

export function AgentForm({ initial, agentId }: Props) {
  const router = useRouter()
  const isEdit = !!agentId

  const [form, setForm] = useState<AgentFormData>({
    name: initial?.name ?? "",
    vendor: initial?.vendor ?? "",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    categoryTags: initial?.categoryTags ?? [],
    industryTags: initial?.industryTags ?? [],
    businessSizeFit: initial?.businessSizeFit ?? [],
    capabilities: initial?.capabilities ?? [{ text: "" }],
    weaknesses: initial?.weaknesses ?? [{ text: "" }],
    pricingTier: initial?.pricingTier ?? "freemium",
    pricingNotes: initial?.pricingNotes ?? "",
    integrationTypes: initial?.integrationTypes ?? [],
    externalUrl: initial?.externalUrl ?? "",
    status: initial?.status ?? "active",
    scoreAccuracy: initial?.scoreAccuracy ?? null,
    scoreLatency: initial?.scoreLatency ?? null,
    scoreReliability: initial?.scoreReliability ?? null,
    scoreEaseOfUse: initial?.scoreEaseOfUse ?? null,
    scoreCostEfficiency: initial?.scoreCostEfficiency ?? null,
    lastTestedAt: initial?.lastTestedAt ?? null,
    testVersion: initial?.testVersion ?? null,
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function set<K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function parseTagsFromInput(value: string) {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  }

  function toggleArrayValue<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const url = isEdit ? `/api/admin/agents/${agentId}` : "/api/admin/agents"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        const msg =
          data.error?.fieldErrors
            ? Object.entries(data.error.fieldErrors)
                .map(([k, v]) => `${k}: ${(v as string[]).join(", ")}`)
                .join(" | ")
            : data.error ?? "Save failed"
        setError(msg)
        return
      }

      router.push("/admin/agents")
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic Info */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Basic Information</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="Agent Name" required>
            <input
              style={inputStyle}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              minLength={2}
              placeholder="e.g. Fin by Intercom"
            />
          </Field>
          <Field label="Vendor" required>
            <input
              style={inputStyle}
              value={form.vendor}
              onChange={(e) => set("vendor", e.target.value)}
              required
              placeholder="e.g. Intercom"
            />
          </Field>
        </div>
        <Field label="Tagline (max 160 chars)" required>
          <input
            style={inputStyle}
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            required
            maxLength={160}
            placeholder="One-line value proposition"
          />
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            {form.tagline.length}/160
          </div>
        </Field>
        <Field label="Description (markdown)" required>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: "120px", fontFamily: "var(--font-mono)" }}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            required
          />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="External URL" required>
            <input
              style={inputStyle}
              type="url"
              value={form.externalUrl}
              onChange={(e) => set("externalUrl", e.target.value)}
              required
              placeholder="https://"
            />
          </Field>
          <Field label="Status">
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.status}
              onChange={(e) => set("status", e.target.value as AgentFormData["status"])}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Taxonomy */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Taxonomy</div>
        <Field label="Category Tags (comma-separated)" required>
          <input
            style={inputStyle}
            value={form.categoryTags.join(", ")}
            onChange={(e) => set("categoryTags", parseTagsFromInput(e.target.value))}
            placeholder="customer support, live chat, helpdesk"
          />
        </Field>
        <Field label="Industry Tags (comma-separated)">
          <input
            style={inputStyle}
            value={form.industryTags.join(", ")}
            onChange={(e) => set("industryTags", parseTagsFromInput(e.target.value))}
            placeholder="e-commerce, saas, healthcare"
          />
        </Field>
        <Field label="Business Size Fit">
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
            {BUSINESS_SIZES.map((size) => (
              <label
                key={size}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.businessSizeFit.includes(size as never)}
                  onChange={() =>
                    set("businessSizeFit", toggleArrayValue(form.businessSizeFit, size as never))
                  }
                />
                {size}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Integration Types">
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
            {INTEGRATION_TYPES.map((type) => (
              <label
                key={type}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.integrationTypes.includes(type)}
                  onChange={() =>
                    set("integrationTypes", toggleArrayValue(form.integrationTypes, type))
                  }
                />
                {type}
              </label>
            ))}
          </div>
        </Field>
      </div>

      {/* Capabilities */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Capabilities</div>
        {form.capabilities.map((cap, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-deep)",
              borderRadius: "var(--radius)",
              padding: "0.875rem",
              marginBottom: "0.5rem",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Capability #{i + 1}
              </span>
              {form.capabilities.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "capabilities",
                      form.capabilities.filter((_, idx) => idx !== i)
                    )
                  }
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--risk-critical)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              style={{ ...inputStyle, marginBottom: "0.4rem" }}
              placeholder="Capability description *"
              value={cap.text}
              onChange={(e) =>
                set(
                  "capabilities",
                  form.capabilities.map((c, idx) =>
                    idx === i ? { ...c, text: e.target.value } : c
                  )
                )
              }
              required
            />
            <input
              style={{ ...inputStyle, marginBottom: "0.4rem" }}
              placeholder="Evidence (optional)"
              value={cap.evidence ?? ""}
              onChange={(e) =>
                set(
                  "capabilities",
                  form.capabilities.map((c, idx) =>
                    idx === i ? { ...c, evidence: e.target.value } : c
                  )
                )
              }
            />
            <input
              style={inputStyle}
              placeholder="Source URL (optional)"
              type="url"
              value={cap.sourceUrl ?? ""}
              onChange={(e) =>
                set(
                  "capabilities",
                  form.capabilities.map((c, idx) =>
                    idx === i ? { ...c, sourceUrl: e.target.value } : c
                  )
                )
              }
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("capabilities", [...form.capabilities, { text: "" }])}
          style={{
            fontSize: "0.82rem",
            color: "var(--amber)",
            background: "none",
            border: "1px dashed var(--amber)",
            borderRadius: "var(--radius)",
            padding: "0.4rem 0.875rem",
            cursor: "pointer",
            width: "100%",
          }}
        >
          + Add Capability
        </button>
      </div>

      {/* Weaknesses — PRD invariant: MANDATORY */}
      <div
        style={{
          ...sectionStyle,
          borderColor: "rgba(245,158,11,0.4)",
          background: "rgba(245,158,11,0.03)",
        }}
      >
        <div style={{ ...sectionTitle, color: "var(--amber)" }}>
          ⚠️ Weaknesses (REQUIRED — editorial invariant)
        </div>
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            marginBottom: "0.875rem",
            lineHeight: 1.6,
          }}
        >
          Every agent listing must document at least one weakness. Rankings are not influenced
          by commercial relationships and honest disclosure is mandatory per the PRD.
        </p>
        {form.weaknesses.map((w, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-deep)",
              borderRadius: "var(--radius)",
              padding: "0.875rem",
              marginBottom: "0.5rem",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 600 }}>
                Weakness #{i + 1}
              </span>
              {form.weaknesses.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "weaknesses",
                      form.weaknesses.filter((_, idx) => idx !== i)
                    )
                  }
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--risk-critical)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            <input
              style={{ ...inputStyle, marginBottom: "0.4rem" }}
              placeholder="Weakness description *"
              value={w.text}
              onChange={(e) =>
                set(
                  "weaknesses",
                  form.weaknesses.map((x, idx) =>
                    idx === i ? { ...x, text: e.target.value } : x
                  )
                )
              }
              required
            />
            <input
              style={inputStyle}
              placeholder="Evidence (optional)"
              value={w.evidence ?? ""}
              onChange={(e) =>
                set(
                  "weaknesses",
                  form.weaknesses.map((x, idx) =>
                    idx === i ? { ...x, evidence: e.target.value } : x
                  )
                )
              }
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => set("weaknesses", [...form.weaknesses, { text: "" }])}
          style={{
            fontSize: "0.82rem",
            color: "var(--amber)",
            background: "none",
            border: "1px dashed var(--amber)",
            borderRadius: "var(--radius)",
            padding: "0.4rem 0.875rem",
            cursor: "pointer",
            width: "100%",
          }}
        >
          + Add Weakness
        </button>
      </div>

      {/* Pricing */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Pricing</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="Pricing Tier" required>
            <select
              style={{ ...inputStyle, cursor: "pointer" }}
              value={form.pricingTier}
              onChange={(e) => set("pricingTier", e.target.value as AgentFormData["pricingTier"])}
            >
              {PRICING_TIERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Pricing Notes">
            <input
              style={inputStyle}
              value={form.pricingNotes ?? ""}
              onChange={(e) => set("pricingNotes", e.target.value)}
              placeholder="e.g. Free up to 100 tickets/mo"
            />
          </Field>
        </div>
      </div>

      {/* Scores */}
      <div style={sectionStyle}>
        <div style={sectionTitle}>Test Scores (0.0 – 10.0)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
          {[
            { key: "scoreAccuracy" as const, label: "Accuracy" },
            { key: "scoreLatency" as const, label: "Speed" },
            { key: "scoreReliability" as const, label: "Reliability" },
            { key: "scoreEaseOfUse" as const, label: "Ease of Use" },
            { key: "scoreCostEfficiency" as const, label: "Cost Efficiency" },
          ].map(({ key, label }) => (
            <Field key={key} label={label}>
              <input
                style={inputStyle}
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={form[key] ?? ""}
                onChange={(e) =>
                  set(key, e.target.value === "" ? null : parseFloat(e.target.value))
                }
                placeholder="—"
              />
            </Field>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <Field label="Last Tested At">
            <input
              style={inputStyle}
              type="date"
              value={form.lastTestedAt?.slice(0, 10) ?? ""}
              onChange={(e) => set("lastTestedAt", e.target.value || null)}
            />
          </Field>
          <Field label="Test Version">
            <input
              style={inputStyle}
              value={form.testVersion ?? ""}
              onChange={(e) => set("testVersion", e.target.value || null)}
              placeholder="e.g. 3.2.1"
            />
          </Field>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "var(--radius)",
            padding: "0.75rem 1rem",
            color: "var(--risk-critical)",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: "0.6rem 1.25rem",
            background: "var(--bg-panel)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "0.6rem 1.5rem",
            background: saving ? "rgba(245,158,11,0.5)" : "var(--amber)",
            color: "#000",
            border: "none",
            borderRadius: "var(--radius)",
            fontWeight: 700,
            cursor: saving ? "wait" : "pointer",
          }}
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Agent"}
        </button>
      </div>
    </form>
  )
}
