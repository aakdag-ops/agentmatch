export type SolutionStage = {
  step: number
  title: string
  agentRole: string
  description: string
}

export type Solution = {
  slug: string
  title: string
  industry: string
  icon: string
  color: string
  headline: string
  pain: string
  stages: SolutionStage[]
  searchQuery: string
}

export const solutions: Solution[] = [
  {
    slug: "raw-material-import",
    title: "Raw Material Import",
    industry: "Chemical Manufacturing",
    icon: "🧪",
    color: "blue",
    headline: "Sourcing raw materials from China to Spain without losing control",
    pain: "International procurement means juggling supplier emails in Mandarin, chasing quotes across time zones, checking EU import regulations, and tracking shipments that go silent for weeks. One missed document can hold up production for a month.",
    stages: [
      {
        step: 1,
        title: "Supplier Discovery",
        agentRole: "Research Agent",
        description: "Finds and vets verified chemical suppliers in China — checking certifications, export history, and risk signals automatically.",
      },
      {
        step: 2,
        title: "Multilingual Outreach",
        agentRole: "Communication Agent",
        description: "Translates RFQ documents and drafts supplier emails in Mandarin, handling back-and-forth without a human translator.",
      },
      {
        step: 3,
        title: "Quote Analysis",
        agentRole: "Analysis Agent",
        description: "Compares incoming quotes side by side — price, lead time, minimum order quantity, and payment terms — and flags risks.",
      },
      {
        step: 4,
        title: "Compliance Check",
        agentRole: "Compliance Agent",
        description: "Verifies that materials meet EU REACH regulations, customs HS codes, and Spanish import documentation requirements.",
      },
      {
        step: 5,
        title: "Shipment Tracking",
        agentRole: "Monitoring Agent",
        description: "Tracks the shipment in real time and alerts the team on delays, customs holds, or missing paperwork before they become problems.",
      },
    ],
    searchQuery: "international procurement supplier research compliance",
  },
  {
    slug: "law-firm-invoicing",
    title: "Time-Based Client Invoicing",
    industry: "Legal Services",
    icon: "⚖️",
    color: "purple",
    headline: "Turning billable hours into accurate invoices without the admin overhead",
    pain: "Lawyers track time inconsistently — some log it daily, others reconstruct it at month end from memory. Billing descriptions are vague, clients dispute charges, and the invoicing cycle is always late. Hours of billable work are lost every month.",
    stages: [
      {
        step: 1,
        title: "Time Capture",
        agentRole: "Tracking Agent",
        description: "Automatically captures time from calendar events, email threads, and document edits — so lawyers stop relying on memory at month end.",
      },
      {
        step: 2,
        title: "Matter Assignment",
        agentRole: "Classification Agent",
        description: "Maps each time entry to the correct client and legal matter, flagging ambiguous entries for quick human review.",
      },
      {
        step: 3,
        title: "Billing Description",
        agentRole: "Writing Agent",
        description: "Converts raw notes like 'call with client re: contract' into professional, defensible billing descriptions that hold up to client scrutiny.",
      },
      {
        step: 4,
        title: "Invoice Generation",
        agentRole: "Document Agent",
        description: "Generates formatted PDF invoices per client, grouped by matter, with correct rates, totals, and firm branding applied.",
      },
      {
        step: 5,
        title: "Payment Follow-up",
        agentRole: "Monitoring Agent",
        description: "Tracks payment status, sends polite reminders at set intervals, and escalates overdue invoices to the billing partner.",
      },
    ],
    searchQuery: "time tracking invoicing billing automation legal",
  },
  {
    slug: "hotel-booking-automation",
    title: "Guest Booking Automation",
    industry: "Hospitality",
    icon: "🏨",
    color: "amber",
    headline: "Automating every touchpoint from first inquiry to post-stay review",
    pain: "Front desk staff spend most of their day answering the same booking questions by email and phone. Guests feel ignored between booking and arrival, special requests get lost, and review opportunities slip away after checkout.",
    stages: [
      {
        step: 1,
        title: "Inquiry Handling",
        agentRole: "Conversation Agent",
        description: "Responds to booking inquiries 24/7 — answering questions about availability, room types, pricing, and policies without staff involvement.",
      },
      {
        step: 2,
        title: "Pre-Arrival Communication",
        agentRole: "Communication Agent",
        description: "Sends personalized pre-arrival emails with check-in instructions, parking details, local tips, and upsell offers timed to the booking date.",
      },
      {
        step: 3,
        title: "Special Request Management",
        agentRole: "Operations Agent",
        description: "Captures and routes special requests — dietary needs, accessibility requirements, celebrations — to the right department automatically.",
      },
      {
        step: 4,
        title: "Check-in Automation",
        agentRole: "Operations Agent",
        description: "Notifies guests when their room is ready, delivers digital room information, and surfaces upsell opportunities at the right moment.",
      },
      {
        step: 5,
        title: "Post-Stay Follow-up",
        agentRole: "Retention Agent",
        description: "Sends thank-you messages, review requests, and personalised re-booking offers based on the guest's stay history and preferences.",
      },
    ],
    searchQuery: "hotel booking guest communication customer experience automation",
  },
  {
    slug: "charity-elderly-trips",
    title: "Elderly Trip Coordination",
    industry: "Non-Profit / Charity",
    icon: "🧓",
    color: "green",
    headline: "Organizing safe, well-coordinated trips for elderly participants without burning out staff",
    pain: "Coordinating trips for elderly people means collecting health information, managing accessibility requirements, arranging appropriate transport, keeping families informed, and handling the unexpected on the day. It is extremely manual and one mistake has serious consequences.",
    stages: [
      {
        step: 1,
        title: "Participant Intake",
        agentRole: "Data Collection Agent",
        description: "Collects participant details through a simple form — health conditions, mobility needs, dietary requirements, emergency contacts — and organises it in one place.",
      },
      {
        step: 2,
        title: "Group Planning",
        agentRole: "Planning Agent",
        description: "Groups participants based on mobility, needs, and compatibility, and flags participants who require extra support or one-to-one volunteer attention.",
      },
      {
        step: 3,
        title: "Transport Coordination",
        agentRole: "Logistics Agent",
        description: "Plans accessible transport routes, schedules pickups, assigns vehicles based on mobility needs, and optimises the route to minimise travel time.",
      },
      {
        step: 4,
        title: "Family Communication",
        agentRole: "Communication Agent",
        description: "Keeps families informed with scheduled updates — departure times, arrival confirmations, and real-time alerts if anything changes on the day.",
      },
      {
        step: 5,
        title: "On-Trip Monitoring",
        agentRole: "Monitoring Agent",
        description: "Provides coordinators with a live dashboard, handles incident reporting, and generates a post-trip summary for funders and charity leadership.",
      },
    ],
    searchQuery: "volunteer coordination event logistics non-profit communication",
  },
  {
    slug: "hospital-night-watch",
    title: "Doctor Night Watch Scheduling",
    industry: "Healthcare",
    icon: "🏥",
    color: "red",
    headline: "Building fair, compliant night watch schedules without the weekly coordination nightmare",
    pain: "Scheduling night watches is a puzzle that HR and department heads spend hours on every month. It must respect labor laws, doctor specialisations, fairness between colleagues, approved holidays, and last-minute sick leave — any mistake creates legal risk or an uncovered shift.",
    stages: [
      {
        step: 1,
        title: "Availability Collection",
        agentRole: "Data Collection Agent",
        description: "Automatically collects availability, approved leave, and constraints from all doctors via a simple form — no chasing spreadsheets by email.",
      },
      {
        step: 2,
        title: "Schedule Generation",
        agentRole: "Planning Agent",
        description: "Generates a compliant schedule respecting labor law rest periods, specialisation requirements, maximum shifts per doctor, and fairness across the team.",
      },
      {
        step: 3,
        title: "Conflict Resolution",
        agentRole: "Analysis Agent",
        description: "Detects scheduling conflicts automatically and proposes swap options between eligible doctors, flagging only unresolvable issues for human decision.",
      },
      {
        step: 4,
        title: "Doctor Notifications",
        agentRole: "Communication Agent",
        description: "Sends each doctor their confirmed schedule, handles swap requests between colleagues, and updates the master schedule when changes are approved.",
      },
      {
        step: 5,
        title: "Last-Minute Cover",
        agentRole: "Monitoring Agent",
        description: "When a doctor calls in sick, the agent identifies available replacements, contacts them in priority order, and updates the schedule without coordinator involvement.",
      },
    ],
    searchQuery: "scheduling workforce management healthcare automation",
  },
]

export function getSolution(slug: string): Solution | undefined {
  return solutions.find((s) => s.slug === slug)
}

export const colorMap: Record<string, { bg: string; text: string; border: string; badge: string; badgeText: string; step: string; stepText: string }> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    badge: "bg-blue-100",
    badgeText: "text-blue-700",
    step: "bg-blue-600",
    stepText: "text-white",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    badge: "bg-purple-100",
    badgeText: "text-purple-700",
    step: "bg-purple-600",
    stepText: "text-white",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    badge: "bg-amber-100",
    badgeText: "text-amber-700",
    step: "bg-amber-500",
    stepText: "text-white",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    badge: "bg-green-100",
    badgeText: "text-green-700",
    step: "bg-green-600",
    stepText: "text-white",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    badge: "bg-red-100",
    badgeText: "text-red-700",
    step: "bg-red-600",
    stepText: "text-white",
  },
}
