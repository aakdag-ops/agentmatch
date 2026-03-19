import { z } from "zod"

const CapabilitySchema = z.object({
  text: z.string().min(1),
  evidence: z.string().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
})

const WeaknessSchema = z.object({
  text: z.string().min(1),
  evidence: z.string().optional(),
})

export const AgentFormSchema = z.object({
  name: z.string().min(2).max(200),
  vendor: z.string().min(1).max(200),
  tagline: z.string().min(10).max(160),
  description: z.string().min(20),
  categoryTags: z.array(z.string()).min(1),
  industryTags: z.array(z.string()).default([]),
  businessSizeFit: z
    .array(z.enum(["solo", "smb", "midmarket", "enterprise"]))
    .default([]),
  capabilities: z.array(CapabilitySchema).min(1),
  // PRD editorial invariant #1 — weaknesses MANDATORY, non-empty
  weaknesses: z
    .array(WeaknessSchema)
    .min(1, "At least one weakness is required (editorial invariant)"),
  pricingTier: z.enum(["free", "freemium", "paid", "enterprise"]),
  pricingNotes: z.string().optional(),
  integrationTypes: z.array(z.string()).default([]),
  externalUrl: z.string().url(),
  status: z.enum(["active", "deprecated", "under_review"]).default("active"),
  scoreAccuracy: z.number().min(0).max(10).nullable().optional(),
  scoreLatency: z.number().min(0).max(10).nullable().optional(),
  scoreReliability: z.number().min(0).max(10).nullable().optional(),
  scoreEaseOfUse: z.number().min(0).max(10).nullable().optional(),
  scoreCostEfficiency: z.number().min(0).max(10).nullable().optional(),
  lastTestedAt: z.string().nullable().optional(),
  testVersion: z.string().nullable().optional(),
})

export type AgentFormData = z.infer<typeof AgentFormSchema>
