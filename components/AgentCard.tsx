"use client"

import Link from "next/link"
import type { Agent } from "@prisma/client"
import { avgScore, PRICING_LABELS, PRICING_COLORS, type Capability } from "@/lib/types"
import ScoreBadge from "./ScoreBadge"
import { useCompare } from "@/context/CompareContext"

interface AgentCardProps {
  agent: Agent
  whyMatched?: string
}

export default function AgentCard({ agent, whyMatched }: AgentCardProps) {
  const { addToCompare, removeFromCompare, isInCompare, isFull } = useCompare()
  const inCompare = isInCompare(agent.id)

  const overall = avgScore([
    agent.scoreAccuracy,
    agent.scoreLatency,
    agent.scoreReliability,
    agent.scoreEaseOfUse,
    agent.scoreCostEfficiency,
  ])

  const capabilities = (agent.capabilities as Capability[] | null) ?? []
  const topCaps = capabilities.slice(0, 3)

  const pricingColor = PRICING_COLORS[agent.pricingTier] ?? "bg-gray-100 text-gray-600"

  function handleCompareToggle(e: React.MouseEvent) {
    e.preventDefault()
    if (inCompare) {
      removeFromCompare(agent.id)
    } else if (!isFull) {
      addToCompare(agent)
    }
  }

  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-150 p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {agent.name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{agent.vendor}</p>
        </div>
        <ScoreBadge score={overall} size="md" />
      </div>

      {/* Tagline */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{agent.tagline}</p>

      {/* Why matched */}
      {whyMatched && (
        <p className="text-xs text-blue-600 italic mb-3 line-clamp-1">
          ✦ {whyMatched}
        </p>
      )}

      {/* Capabilities */}
      {topCaps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {topCaps.map((cap, i) => (
            <span
              key={i}
              className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-0.5 max-w-[160px] truncate"
            >
              {cap.text}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 ${pricingColor}`}>
          {PRICING_LABELS[agent.pricingTier] ?? agent.pricingTier}
        </span>

        <button
          onClick={handleCompareToggle}
          disabled={!inCompare && isFull}
          className={`text-xs rounded-full px-2.5 py-0.5 transition-colors ${
            inCompare
              ? "bg-blue-600 text-white"
              : isFull
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"
          }`}
        >
          {inCompare ? "✓ Comparing" : "+ Compare"}
        </button>
      </div>
    </Link>
  )
}
