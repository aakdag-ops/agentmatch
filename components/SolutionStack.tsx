"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import type { StageMatch } from "@/app/api/solutions/[slug]/stack/route"
import { avgScore, scoreBg } from "@/lib/types"
import type { Agent } from "@prisma/client"

function agentAvgScore(agent: Agent): number | null {
  return avgScore([
    agent.scoreAccuracy,
    agent.scoreLatency,
    agent.scoreReliability,
    agent.scoreEaseOfUse,
    agent.scoreCostEfficiency,
  ])
}

interface Props {
  slug: string
  stageCount: number
}

function AgentMatchCard({ agent, similarity }: { agent: import("@prisma/client").Agent; similarity: number }) {
  const score = agentAvgScore(agent)
  const confidence = Math.round(similarity * 100)

  return (
    <Link
      href={`/agents/${agent.id}`}
      className="block bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900 text-sm group-hover:text-blue-700 truncate">
              {agent.name}
            </span>
            <span className="text-xs text-gray-400 shrink-0">{agent.vendor}</span>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">{agent.tagline}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {score !== null && score > 0 && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreBg(score)}`}>
              {score.toFixed(1)}
            </span>
          )}
          <span className="text-xs text-gray-400">{confidence}% match</span>
        </div>
      </div>
    </Link>
  )
}

function NoMatchCard() {
  return (
    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 text-center">
      <p className="text-xs text-gray-400">No agent in our catalogue covers this stage yet.</p>
      <Link
        href="/submit"
        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
      >
        Submit one →
      </Link>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-full" />
        </div>
        <div className="w-10 h-5 bg-gray-200 rounded-full" />
      </div>
    </div>
  )
}

export default function SolutionStack({ slug, stageCount }: Props) {
  const [stages, setStages] = useState<StageMatch[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/solutions/${slug}/stack`)
      .then((r) => r.json())
      .then((data) => {
        if (data.stages) setStages(data.stages)
        else setError(true)
      })
      .catch(() => setError(true))
  }, [slug])

  if (error) return null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Recommended agent stack</h2>
        <span className="text-xs text-gray-400">Matched from our catalogue</span>
      </div>

      <div className="space-y-6">
        {Array.from({ length: stageCount }, (_, i) => {
          const match = stages?.find((s) => s.step === i + 1)
          return (
            <div key={i + 1}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stage {i + 1}
                </span>
              </div>
              {!stages ? (
                <SkeletonCard />
              ) : match?.topAgent ? (
                <div className="space-y-2">
                  <AgentMatchCard
                    agent={match.topAgent}
                    similarity={match.similarity}
                  />
                  {match.alternatives.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1.5">Alternatives</p>
                      <div className="space-y-1.5">
                        {match.alternatives.map((agent) => (
                          <Link
                            key={agent.id}
                            href={`/agents/${agent.id}`}
                            className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <span>{agent.name}</span>
                            <span className="text-xs text-gray-400">{agent.vendor}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <NoMatchCard />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          Matches are based on semantic similarity to each stage description.{" "}
          <Link href="/submit" className="text-blue-600 hover:underline">
            Submit an agent
          </Link>{" "}
          to improve coverage.
        </p>
      </div>
    </div>
  )
}
