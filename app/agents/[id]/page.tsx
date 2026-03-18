// Agent profile page — Server-Side Rendered (SSR) for SEO
// PRD requirement: "All agent profile pages must be server-side rendered for SEO"
// This is a Server Component by default in Next.js 14 App Router.
// Do NOT add "use client" — SSR is enforced by fetching data server-side.
// Do NOT add generateStaticParams — pages are dynamically rendered per request.

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { db } from "@/lib/db"
import ScoreRadar from "@/components/ScoreRadar"
import ScoreBadge from "@/components/ScoreBadge"
import CompareToggle from "./CompareToggle"
import { WatchlistButton } from "@/components/WatchlistButton"
import {
  avgScore,
  PRICING_LABELS,
  PRICING_COLORS,
  SCORE_DIMENSIONS,
  type Capability,
  type Weakness,
} from "@/lib/types"

type Props = { params: { id: string } }

// ── Metadata (OG tags for SEO) ────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const agent = await db.agent.findUnique({ where: { id: params.id } })
  if (!agent || agent.status === "deprecated") return { title: "Agent not found" }

  const overall = avgScore([
    agent.scoreAccuracy,
    agent.scoreLatency,
    agent.scoreReliability,
    agent.scoreEaseOfUse,
    agent.scoreCostEfficiency,
  ])

  return {
    title: `${agent.name} by ${agent.vendor}`,
    description: agent.tagline,
    openGraph: {
      title: `${agent.name} — AgentMatch`,
      description: agent.tagline,
      type: "article",
    },
    other: {
      "agent:score": overall?.toFixed(1) ?? "—",
      "agent:vendor": agent.vendor,
      "agent:pricing": agent.pricingTier,
    },
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AgentProfilePage({ params }: Props) {
  const agent = await db.agent.findUnique({ where: { id: params.id } })

  if (!agent || agent.status === "deprecated") {
    notFound()
  }

  const capabilities = (agent.capabilities as Capability[]) ?? []
  const weaknesses = (agent.weaknesses as Weakness[]) ?? []
  const overall = avgScore([
    agent.scoreAccuracy,
    agent.scoreLatency,
    agent.scoreReliability,
    agent.scoreEaseOfUse,
    agent.scoreCostEfficiency,
  ])
  const pricingColor = PRICING_COLORS[agent.pricingTier] ?? "bg-gray-100 text-gray-600"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-gray-600">Home</Link>
        <span>/</span>
        {agent.categoryTags[0] && (
          <>
            <Link
              href={`/search?q=${encodeURIComponent(agent.categoryTags[0])}`}
              className="hover:text-gray-600 capitalize"
            >
              {agent.categoryTags[0]}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900">{agent.name}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left sidebar ─────────────────────────────────────────── */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Identity card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between mb-1">
              <h1 className="text-xl font-bold text-gray-900">{agent.name}</h1>
              <ScoreBadge score={overall} size="lg" />
            </div>
            <p className="text-sm text-gray-500 mb-4">{agent.vendor}</p>
            <p className="text-sm text-gray-700 mb-5">{agent.tagline}</p>

            <div className="flex flex-col gap-2">
              <a
                href={agent.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Visit {agent.name} →
              </a>
              {/* Client component for compare toggle (needs context) */}
              <CompareToggle agent={agent} />
              {/* Client component for watchlist toggle (needs session) */}
              <WatchlistButton agentId={agent.id} />
            </div>
          </div>

          {/* Score radar */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Score breakdown</h2>
            <ScoreRadar agent={agent} size={200} />
          </div>

          {/* Pricing */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Pricing</h2>
            <span className={`inline-block text-sm font-medium rounded-full px-3 py-1 ${pricingColor}`}>
              {PRICING_LABELS[agent.pricingTier] ?? agent.pricingTier}
            </span>
            {agent.pricingNotes && (
              <p className="text-sm text-gray-500 mt-2">{agent.pricingNotes}</p>
            )}
          </div>

          {/* Test metadata */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm">
            <h2 className="font-semibold text-gray-700 mb-3">Testing details</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-gray-500">Last tested</dt>
                <dd className="font-medium text-gray-800">
                  {agent.lastTestedAt
                    ? new Date(agent.lastTestedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "Not yet tested"}
                </dd>
              </div>
              {agent.testVersion && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Version tested</dt>
                  <dd className="font-medium text-gray-800">{agent.testVersion}</dd>
                </div>
              )}
              {SCORE_DIMENSIONS.map((dim) => {
                const val = agent[dim.key]
                return val !== null ? (
                  <div key={dim.key} className="flex justify-between">
                    <dt className="text-gray-500">{dim.label}</dt>
                    <dd>
                      <ScoreBadge score={val} size="sm" />
                    </dd>
                  </div>
                ) : null
              })}
            </dl>
          </div>

          {/* Integrations */}
          {agent.integrationTypes.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Integrations</h2>
              <div className="flex flex-wrap gap-1.5">
                {agent.integrationTypes.map((t) => (
                  <span
                    key={t}
                    className="text-xs bg-gray-100 text-gray-600 rounded-full px-2.5 py-1"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main content ─────────────────────────────────────────── */}
        <main className="lg:col-span-2 space-y-6">
          {/* Description */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-3">About {agent.name}</h2>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
              {agent.description}
            </div>
          </section>

          {/* Capabilities */}
          {capabilities.length > 0 && (
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">
                Confirmed capabilities
                <span className="ml-2 text-xs font-normal text-gray-400">
                  Based on independent testing
                </span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {capabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-sm bg-green-50 text-green-800 border border-green-200 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-green-500 text-xs">✓</span>
                    <span>{cap.text}</span>
                    {cap.sourceUrl && (
                      <a
                        href={cap.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-600 ml-0.5"
                        title="Evidence"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── WEAKNESSES — must never be hidden, always above fold ── */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-gray-900">Known limitations</h2>
              <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2.5 py-0.5 font-medium">
                Independently verified
              </span>
            </div>
            <p className="text-xs text-amber-700 mb-4">
              AgentMatch requires every agent profile to disclose confirmed limitations.
              This section is mandatory and cannot be hidden or removed by the vendor.
            </p>
            <ul className="space-y-2.5">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="text-amber-500 mt-0.5 shrink-0">⚠</span>
                  <span>
                    {w.text}
                    {w.evidence && (
                      <span className="ml-1 text-xs text-gray-400">— {w.evidence}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Category / industry tags */}
          {(agent.categoryTags.length > 0 || agent.industryTags.length > 0) && (
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Use cases & industries</h2>
              <div className="space-y-3">
                {agent.categoryTags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.categoryTags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/search?q=${encodeURIComponent(tag)}`}
                          className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-full px-2.5 py-1 transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {agent.industryTags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1.5">Industries</p>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.industryTags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/search?q=${encodeURIComponent(tag)}`}
                          className="text-xs bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 rounded-full px-2.5 py-1 transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Reviews placeholder — Phase 2 MVP stub */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-semibold text-gray-900 mb-2">User reviews</h2>
            <p className="text-sm text-gray-400 italic">
              User reviews are coming in Phase 2. Be the first to review {agent.name}.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
