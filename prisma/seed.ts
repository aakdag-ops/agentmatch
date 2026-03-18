import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Seed category taxonomy (Appendix A)
  const categories = [
    { name: "Customer Support & Helpdesk", slug: "customer-support", icon: "💬" },
    { name: "Sales Outreach & Lead Generation", slug: "sales-outreach", icon: "📈" },
    { name: "Data Extraction & ETL", slug: "data-extraction", icon: "🔄" },
    { name: "Finance, Invoicing & Accounting", slug: "finance-invoicing", icon: "💰" },
    { name: "Scheduling & Calendar Management", slug: "scheduling", icon: "📅" },
    { name: "Marketing Content & Copywriting", slug: "marketing-content", icon: "✍️" },
    { name: "Coding & Developer Assistance", slug: "coding-dev", icon: "💻" },
    { name: "HR & Recruiting", slug: "hr-recruiting", icon: "👥" },
    { name: "Research & Web Summarisation", slug: "research-summarisation", icon: "🔍" },
    { name: "General Productivity & Task Management", slug: "general-productivity", icon: "⚡" },
    { name: "E-commerce Operations", slug: "ecommerce", icon: "🛍️" },
    { name: "Legal Document Processing", slug: "legal-documents", icon: "⚖️" },
    { name: "Healthcare & Clinical Workflows", slug: "healthcare", icon: "🏥" },
    { name: "Real Estate & Property Management", slug: "real-estate", icon: "🏠" },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  console.log(`✅ Seeded ${categories.length} categories`)

  // Create a default admin user (change password immediately in production)
  const { hash } = await import("bcryptjs")
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@agentmatch.io"
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD ?? "change-me-immediately"

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      hashedPassword: await hash(adminPassword, 12),
      name: "Admin",
      role: "admin",
      emailVerified: true,
    },
  })

  console.log(`✅ Admin user created: ${adminEmail}`)
  console.log("⚠️  Change the admin password immediately in production!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
