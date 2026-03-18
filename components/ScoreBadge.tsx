import { scoreBg } from "@/lib/types"

interface ScoreBadgeProps {
  score: number | null | undefined
  size?: "sm" | "md" | "lg"
  label?: string
}

export default function ScoreBadge({ score, size = "md", label }: ScoreBadgeProps) {
  const display = score !== null && score !== undefined ? score.toFixed(1) : "—"
  const colorClass = scoreBg(score)

  const sizeClass = {
    sm: "text-xs px-2 py-0.5 ring-1",
    md: "text-sm px-2.5 py-1 ring-1",
    lg: "text-base px-3 py-1.5 ring-1",
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ring-inset ${colorClass} ${sizeClass}`}
    >
      {display}
      {label && <span className="font-normal opacity-70">{label}</span>}
    </span>
  )
}
