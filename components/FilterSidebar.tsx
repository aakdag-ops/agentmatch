"use client"

import type { SearchFilters } from "@/lib/search/index"

const INDUSTRIES = [
  "Finance",
  "Healthcare",
  "E-commerce",
  "Legal",
  "Real Estate",
  "HR & Recruiting",
  "Marketing",
  "Sales",
]

const BUSINESS_SIZES = [
  { value: "solo", label: "Solo / Freelancer" },
  { value: "smb", label: "Small Business" },
  { value: "midmarket", label: "Mid-market" },
  { value: "enterprise", label: "Enterprise" },
]

const PRICING_TIERS = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "enterprise", label: "Enterprise" },
]

const INTEGRATION_TYPES = [
  { value: "api", label: "API" },
  { value: "no-code", label: "No-code" },
  { value: "zapier", label: "Zapier" },
  { value: "n8n", label: "n8n" },
  { value: "native", label: "Native integration" },
]

interface FilterSidebarProps {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
}

function CheckGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
        {title}
      </h4>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => onToggle(opt.value)}
              className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              {opt.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

function toggle(arr: string[] | undefined, val: string): string[] {
  const a = arr ?? []
  return a.includes(val) ? a.filter((v) => v !== val) : [...a, val]
}

export default function FilterSidebar({ filters, onChange }: FilterSidebarProps) {
  function handleMinScore(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...filters, minScore: Number(e.target.value) })
  }

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {Object.values(filters).some((v) =>
          Array.isArray(v) ? v.length > 0 : !!v
        ) && (
          <button
            onClick={() => onChange({})}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <CheckGroup
        title="Industry"
        options={INDUSTRIES.map((v) => ({ value: v.toLowerCase(), label: v }))}
        selected={filters.industryTags ?? []}
        onToggle={(v) => onChange({ ...filters, industryTags: toggle(filters.industryTags, v) })}
      />

      <CheckGroup
        title="Business size"
        options={BUSINESS_SIZES}
        selected={filters.businessSizeFit ?? []}
        onToggle={(v) =>
          onChange({ ...filters, businessSizeFit: toggle(filters.businessSizeFit, v) })
        }
      />

      <CheckGroup
        title="Pricing"
        options={PRICING_TIERS}
        selected={filters.pricingTier ?? []}
        onToggle={(v) =>
          onChange({ ...filters, pricingTier: toggle(filters.pricingTier, v) })
        }
      />

      <CheckGroup
        title="Integration"
        options={INTEGRATION_TYPES}
        selected={filters.integrationTypes ?? []}
        onToggle={(v) =>
          onChange({ ...filters, integrationTypes: toggle(filters.integrationTypes, v) })
        }
      />

      {/* Min score slider */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
          Min. score
        </h4>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={filters.minScore ?? 0}
          onChange={handleMinScore}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>0</span>
          <span className="font-medium text-gray-600">
            {filters.minScore ? `≥ ${filters.minScore}` : "Any"}
          </span>
          <span>10</span>
        </div>
      </div>
    </aside>
  )
}
