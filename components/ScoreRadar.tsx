import { SCORE_DIMENSIONS } from "@/lib/types"
import type { Agent } from "@prisma/client"

interface ScoreRadarProps {
  agent: Agent
  size?: number
}

const CENTER = 100
const MAX_R = 68

function getPoint(index: number, ratio: number) {
  // 5 axes starting from top (-90°), rotating 72° each
  const angle = (index * 72 - 90) * (Math.PI / 180)
  return {
    x: CENTER + MAX_R * ratio * Math.cos(angle),
    y: CENTER + MAX_R * ratio * Math.sin(angle),
  }
}

function pointsStr(ratios: number[]): string {
  return ratios
    .map((r, i) => {
      const pt = getPoint(i, r)
      return `${pt.x.toFixed(2)},${pt.y.toFixed(2)}`
    })
    .join(" ")
}

export default function ScoreRadar({ agent, size = 220 }: ScoreRadarProps) {
  const scores = SCORE_DIMENSIONS.map((d) => agent[d.key] ?? null)
  const hasData = scores.some((s) => s !== null)

  // Background ring ratios
  const rings = [0.25, 0.5, 0.75, 1.0]

  // Score polygon
  const scoreRatios = scores.map((s) => (s ?? 0) / 10)

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="overflow-visible"
        aria-label="Score radar chart"
      >
        {/* Background rings */}
        {rings.map((ratio) => (
          <polygon
            key={ratio}
            points={pointsStr([ratio, ratio, ratio, ratio, ratio])}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {SCORE_DIMENSIONS.map((_, i) => {
          const outer = getPoint(i, 1)
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={outer.x.toFixed(2)}
              y2={outer.y.toFixed(2)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          )
        })}

        {/* Score polygon */}
        {hasData && (
          <polygon
            points={pointsStr(scoreRatios)}
            fill="#2563eb"
            fillOpacity="0.15"
            stroke="#2563eb"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {/* Score dots */}
        {hasData &&
          scoreRatios.map((r, i) => {
            const pt = getPoint(i, r)
            return (
              <circle
                key={i}
                cx={pt.x.toFixed(2)}
                cy={pt.y.toFixed(2)}
                r="3"
                fill="#2563eb"
              />
            )
          })}

        {/* Axis labels */}
        {SCORE_DIMENSIONS.map((dim, i) => {
          const pt = getPoint(i, 1.28)
          const anchor =
            Math.abs(pt.x - CENTER) < 5
              ? "middle"
              : pt.x < CENTER
              ? "end"
              : "start"
          return (
            <text
              key={i}
              x={pt.x.toFixed(2)}
              y={pt.y.toFixed(2)}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize="10"
              fill="#6b7280"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {dim.label}
            </text>
          )
        })}
      </svg>

      {/* Score values below chart */}
      <div className="grid grid-cols-5 gap-2 w-full text-center">
        {SCORE_DIMENSIONS.map((dim, i) => {
          const score = scores[i]
          const color =
            score === null
              ? "text-gray-300"
              : score >= 8
              ? "text-green-600"
              : score >= 5
              ? "text-amber-500"
              : "text-red-500"
          return (
            <div key={dim.key} className="flex flex-col items-center gap-0.5">
              <span className={`text-sm font-semibold ${color}`}>
                {score !== null ? score.toFixed(1) : "—"}
              </span>
              <span className="text-xs text-gray-400 leading-tight">{dim.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
