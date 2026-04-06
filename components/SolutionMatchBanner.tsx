import Link from "next/link"
import type { Solution } from "@/lib/solutions"
import { colorMap } from "@/lib/solutions"

interface Props {
  solution: Solution & { confidence: number; reason: string }
}

export default function SolutionMatchBanner({ solution }: Props) {
  const c = colorMap[solution.color]

  return (
    <div className={`mb-6 rounded-xl border ${c.border} ${c.bg} p-4 flex items-start gap-4`}>
      {/* Icon */}
      <div className={`text-2xl w-11 h-11 flex items-center justify-center rounded-xl bg-white border ${c.border} shadow-sm shrink-0`}>
        {solution.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>
            Solution match
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge} ${c.badgeText}`}>
            {solution.industry}
          </span>
        </div>
        <p className="font-semibold text-gray-900 text-sm">
          {solution.title}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {solution.reason}
        </p>
      </div>

      {/* CTA */}
      <Link
        href={`/solutions/${solution.slug}`}
        className={`shrink-0 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${c.step} text-white hover:opacity-90`}
      >
        View agent stack →
      </Link>
    </div>
  )
}
