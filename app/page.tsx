// Dynamically rendered — live DB counts and recently tested agents
export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import SearchInput from "@/components/SearchInput"
import AgentCard from "@/components/AgentCard"
import { solutions, colorMap } from "@/lib/solutions"

const CATEGORIES = [
  { name: "Customer Support", slug: "customer-support", icon: "💬" },
  { name: "Sales Outreach", slug: "sales-outreach", icon: "📈" },
  { name: "Data Extraction", slug: "data-extraction", icon: "🔄" },
  { name: "Finance & Invoicing", slug: "finance-invoicing", icon: "💰" },
  { name: "Scheduling", slug: "scheduling", icon: "📅" },
  { name: "Marketing Content", slug: "marketing-content", icon: "✍️" },
  { name: "Coding & Dev", slug: "coding-dev", icon: "💻" },
  { name: "HR & Recruiting", slug: "hr-recruiting", icon: "👥" },
  { name: "Research", slug: "research-summarisation", icon: "🔍" },
  { name: "Productivity", slug: "general-productivity", icon: "⚡" },
]

async function getStats() {
  try {
    const [agentCount, categoryCount, testedCount] = await Promise.all([
      db.agent.count({ where: { status: "active" } }),
      db.category.count(),
      db.agent.count({ where: { status: "active", lastTestedAt: { not: null } } }),
    ])
    return { agentCount, categoryCount, testedCount }
  } catch {
    return { agentCount: 0, categoryCount: 14, testedCount: 0 }
  }
}

async function getRecentlyTested() {
  try {
    return await db.agent.findMany({
      where: { status: "active", lastTestedAt: { not: null } },
      orderBy: { lastTestedAt: "desc" },
      take: 4,
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [stats, recentAgents] = await Promise.all([getStats(), getRecentlyTested()])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-4 sm:px-6 pt-16 pb-14">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Describe your business problem.
            <br />
            <span className="text-blue-600">We&apos;ll find the agent stack to solve it.</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Most problems need more than one agent.
            <br className="hidden sm:block" />
            Tell us what&apos;s slowing you down — we&apos;ll map out the full solution.
          </p>
          <SearchInput size="hero" showSuggestions placeholder="e.g. our lawyers spend too much time on invoicing…" />
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-gray-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-center">
            <Stat value={stats.agentCount} label="agents indexed" />
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <Stat value={stats.testedCount} label="agents tested" />
            <div className="w-px h-8 bg-gray-200 hidden sm:block" />
            <Stat value={stats.categoryCount} label="categories" />
          </div>
        </div>
      </section>

      {/* SME Solutions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Real business problems, solved end-to-end</h2>
            <p className="text-sm text-gray-500 mt-1">Each solution is a curated stack of agents working together.</p>
          </div>
          <Link href="/solutions" className="text-sm text-blue-600 hover:underline shrink-0">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {solutions.map((solution) => {
            const c = colorMap[solution.color]
            return (
              <Link
                key={solution.slug}
                href={`/solutions/${solution.slug}`}
                className="group flex items-start gap-4 bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className={`text-2xl w-11 h-11 flex items-center justify-center rounded-xl shrink-0 ${c.bg}`}>
                  {solution.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                      {solution.title}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${c.badge} ${c.badgeText}`}>
                      {solution.stages.length} agents
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{solution.headline}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Category grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 pt-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Browse by category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?q=${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-center"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently tested */}
      {recentAgents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recently tested</h2>
            <Link href="/search" className="text-sm text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-gray-50 border-y border-gray-200 py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-10">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Describe your problem", body: "Tell us what's slowing your business down — in plain language, not technical terms." },
              { step: "2", title: "Get the full solution", body: "We match your problem to an end-to-end agent stack, not just a single tool." },
              { step: "3", title: "Compare and deploy", body: "Review each agent, compare alternatives, and click through to get started." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">{item.step}</span>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial promise */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-14 text-center">
        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider mb-3">Our promise</p>
        <p className="text-lg text-gray-700">
          Search rankings are never influenced by commercial relationships.
          Every agent profile discloses confirmed limitations.
          Sponsored placements are always clearly labelled.
        </p>
      </section>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-gray-900">{value > 0 ? value.toLocaleString() : "—"}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  )
}
