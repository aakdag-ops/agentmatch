"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface ImportResult {
  message: string
  created: number
  skipped: number
  errors: string[]
}

export function CsvImportForm() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)

  async function handleSubmit(file: File) {
    setStatus("uploading")
    setResult(null)

    const fd = new FormData()
    fd.append("file", file)

    try {
      const res = await fetch("/api/admin/import", { method: "POST", body: fd })
      const data = await res.json()
      setResult(data)
      setStatus("done")
      router.refresh()
    } catch {
      setStatus("error")
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleSubmit(file)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith(".csv")) handleSubmit(file)
  }

  return (
    <div>
      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragOver ? "var(--amber)" : "var(--border)"}`,
          borderRadius: "var(--radius)",
          padding: "3rem",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "rgba(245,158,11,0.04)" : "var(--bg-panel)",
          transition: "all 0.2s",
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: "none" }}
          onChange={onFileChange}
        />
        {status === "uploading" ? (
          <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⏳</div>
            Importing…
          </div>
        ) : (
          <>
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>📥</div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
              Drop CSV file here or click to browse
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              .csv files only
            </div>
          </>
        )}
      </div>

      {/* Results */}
      {result && (
        <div
          style={{
            marginTop: "1.25rem",
            background: result.skipped > 0 && result.created === 0
              ? "rgba(239,68,68,0.06)"
              : "rgba(34,197,94,0.06)",
            border: `1px solid ${result.skipped > 0 && result.created === 0
              ? "rgba(239,68,68,0.25)"
              : "rgba(34,197,94,0.25)"}`,
            borderRadius: "var(--radius)",
            padding: "1.25rem",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            {result.message}
          </div>
          <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", marginBottom: result.errors.length ? "0.75rem" : 0 }}>
            <span style={{ color: "var(--risk-low)" }}>✅ {result.created} created</span>
            {result.skipped > 0 && (
              <span style={{ color: "var(--risk-critical)" }}>⚠️ {result.skipped} skipped</span>
            )}
          </div>
          {result.errors.length > 0 && (
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                Errors:
              </div>
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {result.errors.map((e, i) => (
                  <li key={i} style={{ fontSize: "0.78rem", color: "var(--risk-critical)", marginBottom: "0.2rem" }}>
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
