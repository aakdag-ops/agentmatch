import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { AgentForm } from "../AgentForm"
import Link from "next/link"
import type { AgentFormData } from "@/lib/admin/agentSchema"
import type { Capability, Weakness } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function EditAgentPage({ params }: { params: { id: string } }) {
  const agent = await db.agent.findUnique({ where: { id: params.id } })
  if (!agent) notFound()

  const initial: Partial<AgentFormData> = {
    name: agent.name,
    vendor: agent.vendor,
    tagline: agent.tagline,
    description: agent.description,
    categoryTags: agent.categoryTags,
    industryTags: agent.industryTags,
    businessSizeFit: agent.businessSizeFit as AgentFormData["businessSizeFit"],
    capabilities: agent.capabilities as Capability[],
    weaknesses: agent.weaknesses as Weakness[],
    pricingTier: agent.pricingTier as AgentFormData["pricingTier"],
    pricingNotes: agent.pricingNotes ?? "",
    integrationTypes: agent.integrationTypes,
    externalUrl: agent.externalUrl,
    status: agent.status as AgentFormData["status"],
    scoreAccuracy: agent.scoreAccuracy,
    scoreLatency: agent.scoreLatency,
    scoreReliability: agent.scoreReliability,
    scoreEaseOfUse: agent.scoreEaseOfUse,
    scoreCostEfficiency: agent.scoreCostEfficiency,
    lastTestedAt: agent.lastTestedAt?.toISOString() ?? null,
    testVersion: agent.testVersion ?? null,
  }

  return (
    <div style={{ maxWidth: "860px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
        <Link
          href="/admin/agents"
          style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}
        >
          ← Agents
        </Link>
        <span style={{ color: "var(--border)" }}>/</span>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Edit: {agent.name}
        </h1>
        <Link
          href={`/agents/${agent.id}`}
          target="_blank"
          style={{
            marginLeft: "auto",
            fontSize: "0.78rem",
            color: "var(--amber)",
            textDecoration: "none",
          }}
        >
          View public profile ↗
        </Link>
      </div>
      <AgentForm initial={initial} agentId={agent.id} />
    </div>
  )
}
