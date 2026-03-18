import { z } from "zod"

// Weakness item schema — must be a non-empty array (enforces PRD invariant at API layer)
const WeaknessSchema = z.object({
  text: z.string().min(1),
  evidence: z.string().optional(),
})

const CapabilitySchema = z.object({
  text: z.string().min(1),
  evidence: z.string().optional(),
  sourceUrl: z.string().url().optional(),
})

export const AgentWriteSchema = z.object({
  name: z.string().min(1).max(200),
  vendor: z.string().min(1).max(200),
  tagline: z.string().min(1).max(160),
  description: z.string().min(1),

  categoryTags: z.array(z.string()).min(1),
  industryTags: z.array(z.string()).default([]),
  businessSizeFit: z
    .array(z.enum(["solo", "smb", "midmarket", "enterprise"]))
    .min(1),

  // INVARIANT: weaknesses must be a non-empty array — mirrors DB constraint
  capabilities: z.array(CapabilitySchema).min(1, {
    message: "At least one capability is required",
  }),
  weaknesses: z.array(WeaknessSchema).min(1, {
    message: "At least one weakness is required — this field is mandatory",
  }),

  pricingTier: z.enum(["free", "freemium", "paid", "enterprise"]),
  pricingNotes: z.string().optional(),
  integrationTypes: z.array(z.string()).default([]),

  scoreAccuracy: z.number().min(0).max(10).nullable().optional(),
  scoreLatency: z.number().min(0).max(10).nullable().optional(),
  scoreReliability: z.number().min(0).max(10).nullable().optional(),
  scoreEaseOfUse: z.number().min(0).max(10).nullable().optional(),
  scoreCostEfficiency: z.number().min(0).max(10).nullable().optional(),

  lastTestedAt: z.string().datetime().nullable().optional(),
  testVersion: z.string().optional(),

  externalUrl: z.string().url(),
  status: z.enum(["active", "deprecated", "under_review"]).default("active"),
})

export type AgentWriteInput = z.infer<typeof AgentWriteSchema>
