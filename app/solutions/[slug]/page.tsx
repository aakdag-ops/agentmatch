import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getSolution, solutions, colorMap } from "@/lib/solutions"
import SolutionStack from "@/components/SolutionStack"

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const solution = getSolution(params.slug)
  if (!solution) return {}
  return {
    title: `${solution.title} — AgentMatch Solutions`,
    description: solution.headline,
  }
}

export default function SolutionDetailPage({ params }: Props) {
  const solution = getSolution(params.slug)
  if (!solution) notFound()

  const c = colorMap[solution.color]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <nav className="text-sm text-gray-500 flex items-center gap-2">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/solutions" className="hover:text-gray-900 transition-colors">Solutions</Link>
            <span>/</span>
            <span className="text-gray-900">{solution.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className={`${c.bg} border-b ${c.border}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-start gap-5">
            <div className={`text-4xl w-16 h-16 flex items-center justify-center rounded-2xl bg-white border ${c.border} shadow-sm shrink-0`}>
              {solution.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.badge} ${c.badgeText}`}>
                  {solution.industry}
                </span>
                <span className="text-xs text-gray-500">{solution.stages.length} agent stages</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {solution.title}
              </h1>
              <p className={`mt-2 text-base font-medium ${c.text}`}>
                {solution.headline}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main: value flow */}
          <div className="lg:col-span-2 space-y-6">

            {/* The pain */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-3">The problem</h2>
              <p className="text-gray-600 leading-relaxed">{solution.pain}</p>
            </div>

            {/* Value flow */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-6">The agent solution</h2>
              <div className="space-y-0">
                {solution.stages.map((stage, index) => (
                  <div key={stage.step} className="flex gap-4">
                    {/* Step indicator + connector */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={`w-8 h-8 rounded-full ${c.step} ${c.stepText} flex items-center justify-center text-sm font-bold shrink-0`}>
                        {stage.step}
                      </div>
                      {index < solution.stages.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 my-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className={`pb-8 flex-1 ${index === solution.stages.length - 1 ? "pb-0" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{stage.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.badge} ${c.badgeText} font-medium`}>
                          {stage.agentRole}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Agent stack */}
            <SolutionStack slug={solution.slug} stageCount={solution.stages.length} />

            {/* Find agents CTA */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Find these agents</h3>
              <p className="text-sm text-gray-600 mb-4">
                Search AgentMatch for tools that cover each stage of this workflow.
              </p>
              <Link
                href={`/search?q=${encodeURIComponent(solution.searchQuery)}`}
                className={`block text-center text-sm font-medium text-white px-4 py-2.5 rounded-lg transition-colors ${c.step} hover:opacity-90`}
              >
                Search relevant agents
              </Link>
            </div>

            {/* Stages summary */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Workflow stages</h3>
              <div className="space-y-2">
                {solution.stages.map((stage) => (
                  <div key={stage.step} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${c.step} ${c.stepText} flex items-center justify-center text-xs font-bold shrink-0`}>
                      {stage.step}
                    </div>
                    <span className="text-sm text-gray-700">{stage.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Other solutions */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Other solutions</h3>
              <div className="space-y-2">
                {solutions
                  .filter((s) => s.slug !== solution.slug)
                  .map((s) => (
                    <Link
                      key={s.slug}
                      href={`/solutions/${s.slug}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors py-1"
                    >
                      <span>{s.icon}</span>
                      <span>{s.title}</span>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
