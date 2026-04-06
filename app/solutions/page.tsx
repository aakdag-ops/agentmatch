import type { Metadata } from "next"
import Link from "next/link"
import { solutions, colorMap } from "@/lib/solutions"

export const metadata: Metadata = {
  title: "SME Solutions — AgentMatch",
  description: "Real business problems solved end-to-end with AI agent stacks. Discover which agents work together to automate your industry workflows.",
}

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
              Solutions
            </span>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Real problems, solved end-to-end
            </h1>
            <p className="mt-3 text-gray-600 text-lg">
              Businesses don&apos;t look for agents — they look for solutions. Here are five common SME challenges and the AI agent stacks that solve them from start to finish.
            </p>
          </div>
        </div>
      </div>

      {/* Solutions grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution) => {
            const c = colorMap[solution.color]
            return (
              <Link
                key={solution.slug}
                href={`/solutions/${solution.slug}`}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-md transition-all flex flex-col"
              >
                {/* Icon + industry */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`text-3xl w-12 h-12 flex items-center justify-center rounded-xl ${c.bg}`}>
                    {solution.icon}
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${c.badge} ${c.badgeText}`}>
                    {solution.industry}
                  </span>
                </div>

                {/* Title + headline */}
                <h2 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors">
                  {solution.title}
                </h2>
                <p className="text-sm text-gray-600 flex-1">
                  {solution.headline}
                </p>

                {/* Stage count + CTA */}
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {solution.stages.length} agent stages
                  </span>
                  <span className="text-sm font-medium text-blue-600 group-hover:underline">
                    View solution →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Don&apos;t see your industry?
          </h2>
          <p className="text-gray-600 mb-5">
            Search our full catalogue of agents and build your own solution stack.
          </p>
          <Link
            href="/search"
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Browse all agents
          </Link>
        </div>
      </div>
    </div>
  )
}
