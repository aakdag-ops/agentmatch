"use client"

import { useCompare } from "@/context/CompareContext"
import type { Agent } from "@prisma/client"

export default function CompareToggle({ agent }: { agent: Agent }) {
  const { addToCompare, removeFromCompare, isInCompare, isFull } = useCompare()
  const inCompare = isInCompare(agent.id)

  return (
    <button
      onClick={() => (inCompare ? removeFromCompare(agent.id) : addToCompare(agent))}
      disabled={!inCompare && isFull}
      className={`w-full text-sm font-medium py-2.5 rounded-lg border transition-colors ${
        inCompare
          ? "border-blue-600 text-blue-600 bg-blue-50 hover:bg-blue-100"
          : isFull
          ? "border-gray-200 text-gray-300 cursor-not-allowed"
          : "border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      {inCompare ? "✓ Added to compare" : isFull ? "Compare full (max 3)" : "+ Add to compare"}
    </button>
  )
}
