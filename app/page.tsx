// Dynamically rendered — live DB counts and recently tested agents
export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import SearchInput from "@/components/SearchInput"
import AgentCard from "@/components/AgentCard"

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
            Find the right AI agent
            <br />
            <span className="text-blue-600">in minutes, not weeks</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            We independently test every agent so you don&apos;t have to.
            <br className="hidden sm:block" />
            Search by what you need to automate — not by product name.
          </p>
          <SearchInput size="hero" showSuggestions placeholder="e.g. automate customer support emails…" />
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

      {/* Category grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
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
              { step: "1", title: "Describe your need", body: "Tell us what process you want to automate in plain language." },
              { step: "2", title: "Get ranked matches", body: "We score agents across accuracy, speed, reliability, ease of use, and cost." },
              { step: "3", title: "Compare and decide", body: "View full profiles, compare side-by-side, and click through to the agent." },
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
