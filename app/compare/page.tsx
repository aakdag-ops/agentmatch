"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import ScoreBadge from "@/components/ScoreBadge"
import {
  PRICING_LABELS,
  SCORE_DIMENSIONS,
  avgScore,
  type Capability,
  type Weakness,
} from "@/lib/types"
import type { Agent } from "@prisma/client"

function ComparePageContent() {
  const searchParams = useSearchParams()
  const agentIds = (searchParams.get("agents") ?? "").split(",").filter(Boolean).slice(0, 3)

  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!agentIds.length) {
      setLoading(false)
      return
    }
    Promise.all(
      agentIds.map((id) =>
        fetch(`/api/agents/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => d?.agent ?? null)
      )
    ).then((results) => {
      setAgents(results.filter(Boolean))
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("agents")])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!agents.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-gray-500 mb-4">No agents selected for comparison.</p>
        <Link href="/search" className="text-blue-600 hover:underline text-sm">
          Browse agents →
        </Link>
      </div>
    )
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/compare?agents=${agentIds.join(",")}`
      : ""

  // Determine which scores are highest/lowest per dimension for color coding
  function scoreCellClass(score: number | null, allScores: (number | null)[]): string {
    const valid = allScores.filter((s): s is number => s !== null)
    if (score === null || valid.length < 2) return "text-gray-500"
    const max = Math.max(...valid)
    const min = Math.min(...valid)
    if (score === max) return "text-green-600 font-semibold"
    if (score === min) return "text-amber-500"
    return "text-gray-700"
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Comparison</h1>
          <p className="text-sm text-gray-500">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} compared
          </p>
        </div>
        <div className="flex items-center gap-3">
          {shareUrl && (
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
            >
              Copy share link
            </button>
          )}
          <Link
            href="/search"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to search
          </Link>
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3 px-4 w-40 shrink-0">
                Field
              </th>
              {agents.map((agent) => (
                <th key={agent.id} className="py-3 px-4 text-left min-w-[200px]">
                  <div className="font-semibold text-gray-900">{agent.name}</div>
                  <div className="text-xs text-gray-400 font-normal">{agent.vendor}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Overall score */}
            <CompareRow label="Overall score">
              {agents.map((a) => {
                const score = avgScore([
                  a.scoreAccuracy, a.scoreLatency, a.scoreReliability,
                  a.scoreEaseOfUse, a.scoreCostEfficiency,
                ])
                const allOverall = agents.map((ag) =>
                  avgScore([ag.scoreAccuracy, ag.scoreLatency, ag.scoreReliability,
                    ag.scoreEaseOfUse, ag.scoreCostEfficiency])
                )
                return (
                  <td key={a.id} className="py-3 px-4">
                    <span className={scoreCellClass(score, allOverall)}>
                      {score !== null ? score.toFixed(1) : "—"}
                    </span>
                  </td>
                )
              })}
            </CompareRow>

            {/* Individual scores */}
            {SCORE_DIMENSIONS.map((dim) => (
              <CompareRow key={dim.key} label={dim.label}>
                {agents.map((a) => {
                  const score = a[dim.key]
                  const allScores = agents.map((ag) => ag[dim.key])
                  return (
                    <td key={a.id} className="py-3 px-4">
                      <span className={scoreCellClass(score, allScores)}>
                        {score !== null ? score.toFixed(1) : "—"}
                      </span>
                    </td>
                  )
                })}
              </CompareRow>
            ))}

            {/* Pricing */}
            <CompareRow label="Pricing" shaded>
              {agents.map((a) => (
                <td key={a.id} className="py-3 px-4 text-gray-700">
                  {PRICING_LABELS[a.pricingTier] ?? a.pricingTier}
                  {a.pricingNotes && (
                    <p className="text-xs text-gray-400 mt-0.5">{a.pricingNotes}</p>
                  )}
                </td>
              ))}
            </CompareRow>

            {/* Business size */}
            <CompareRow label="Business size">
              {agents.map((a) => (
                <td key={a.id} className="py-3 px-4 text-gray-700">
                  {a.businessSizeFit.join(", ") || "—"}
                </td>
              ))}
            </CompareRow>

            {/* Integrations */}
            <CompareRow label="Integrations" shaded>
              {agents.map((a) => (
                <td key={a.id} className="py-3 px-4 text-gray-700">
                  {a.integrationTypes.length > 0
                    ? a.integrationTypes.join(", ")
                    : "—"}
                </td>
              ))}
            </CompareRow>

            {/* Capabilities */}
            <CompareRow label="Capabilities">
              {agents.map((a) => {
                const caps = (a.capabilities as Capability[]) ?? []
                return (
                  <td key={a.id} className="py-3 px-4">
                    <ul className="space-y-1">
                      {caps.slice(0, 4).map((c, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <span className="text-green-500 shrink-0">✓</span>
                          {c.text}
                        </li>
                      ))}
                      {caps.length > 4 && (
                        <li className="text-xs text-gray-400">+{caps.length - 4} more</li>
                      )}
                    </ul>
                  </td>
                )
              })}
            </CompareRow>

            {/* Weaknesses */}
            <CompareRow label="Limitations" shaded highlight>
              {agents.map((a) => {
                const ws = (a.weaknesses as Weakness[]) ?? []
                return (
                  <td key={a.id} className="py-3 px-4">
                    <ul className="space-y-1">
                      {ws.slice(0, 4).map((w, i) => (
                        <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                          <span className="text-amber-400 shrink-0">⚠</span>
                          {w.text}
                        </li>
                      ))}
                    </ul>
                  </td>
                )
              })}
            </CompareRow>

            {/* Last tested */}
            <CompareRow label="Last tested">
              {agents.map((a) => (
                <td key={a.id} className="py-3 px-4 text-gray-700">
                  {a.lastTestedAt
                    ? new Date(a.lastTestedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                  {a.testVersion && (
                    <span className="ml-1 text-xs text-gray-400">v{a.testVersion}</span>
                  )}
                </td>
              ))}
            </CompareRow>

            {/* Links */}
            <CompareRow label="Visit" shaded>
              {agents.map((a) => (
                <td key={a.id} className="py-3 px-4">
                  <a
                    href={a.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    {a.name} →
                  </a>
                </td>
              ))}
            </CompareRow>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Highest in category
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" /> Lowest in category
        </span>
      </div>
    </div>
  )
}

function CompareRow({
  label,
  children,
  shaded,
  highlight,
}: {
  label: string
  children: React.ReactNode
  shaded?: boolean
  highlight?: boolean
}) {
  return (
    <tr className={highlight ? "bg-amber-50" : shaded ? "bg-gray-50/60" : ""}>
      <td className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide align-top">
        {label}
      </td>
      {children}
    </tr>
  )
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  )
}
