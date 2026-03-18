"use client"

import { useRouter } from "next/navigation"
import { useCompare } from "@/context/CompareContext"

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useCompare()
  const router = useRouter()

  if (compareList.length === 0) return null

  function handleCompare() {
    const ids = compareList.map((a) => a.id).join(",")
    router.push(`/compare?agents=${ids}`)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 shrink-0">
          Comparing {compareList.length}/3
        </span>

        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          {compareList.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-full pl-3 pr-1.5 py-1 text-sm shrink-0"
            >
              <span className="max-w-[140px] truncate">{agent.name}</span>
              <button
                onClick={() => removeFromCompare(agent.id)}
                className="w-4 h-4 rounded-full hover:bg-blue-200 flex items-center justify-center transition-colors"
                aria-label={`Remove ${agent.name} from comparison`}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleCompare}
            disabled={compareList.length < 2}
            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Compare now
          </button>
        </div>
      </div>
    </div>
  )
}
