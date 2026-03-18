import { z } from "zod"

export const SearchFiltersSchema = z.object({
  industryTags: z.array(z.string()).optional(),
  businessSizeFit: z
    .array(z.enum(["solo", "smb", "midmarket", "enterprise"]))
    .optional(),
  pricingTier: z
    .array(z.enum(["free", "freemium", "paid", "enterprise"]))
    .optional(),
  integrationTypes: z.array(z.string()).optional(),
  minScore: z.number().min(0).max(10).optional(),
})

export const SearchRequestSchema = z.object({
  query: z
    .string()
    .min(1, "Query is required")
    .max(500, "Query must be 500 characters or fewer"),
  filters: SearchFiltersSchema.optional(),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(20).optional().default(20),
})

export type SearchRequestInput = z.infer<typeof SearchRequestSchema>
