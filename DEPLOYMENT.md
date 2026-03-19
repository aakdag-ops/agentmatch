# AgentMatch — Deployment & Launch Checklist

## Stack
| Layer | Service |
|---|---|
| App | Next.js 14 App Router (Vercel recommended) |
| Database | Supabase PostgreSQL + pgvector |
| Auth | NextAuth.js v4 (JWT, Google OAuth) |
| Search | OpenAI embeddings + pgvector ANN |
| Analytics | PostHog |
| Monitoring | Sentry (optional) |

---

## 1. Environment Variables

Copy `.env.example` → `.env.local` (local) or set as Vercel environment variables.

**Required for production:**
```
DATABASE_URL            Supabase connection string (pooled, with ?pgbouncer=true)
DIRECT_URL              Supabase direct connection (for migrations)
NEXTAUTH_SECRET         openssl rand -base64 32
NEXTAUTH_URL            https://agentmatch.io
GOOGLE_CLIENT_ID        Google OAuth app client ID
GOOGLE_CLIENT_SECRET    Google OAuth app client secret
OPENAI_API_KEY          OpenAI API key (for embeddings + intent extraction)
NEXT_PUBLIC_BASE_URL    https://agentmatch.io
```

**Optional but recommended:**
```
NEXT_PUBLIC_POSTHOG_KEY     PostHog project API key
NEXT_PUBLIC_POSTHOG_HOST    https://app.posthog.com (or self-hosted)
GOOGLE_SITE_VERIFICATION    Google Search Console meta tag value
```

---

## 2. Database Setup

```bash
# Run migrations
npm run db:migrate:deploy

# Apply custom SQL constraints (weaknesses NOT NULL + JSON check)
psql $DATABASE_URL -f prisma/constraints.sql

# Seed categories + admin user
npm run db:seed

# Seed 50 agents (run after categories are seeded)
npm run db:seed:agents
```

**Verify pgvector is enabled on Supabase:**
```sql
CREATE EXTENSION IF NOT EXISTS vector;
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## 3. Admin User

The seed creates `admin@agentmatch.io` with password `change-me-immediately`.

**Change it immediately:**
1. Log in at `/login`
2. (password reset flow — or update directly via Supabase dashboard)

To promote any user to admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## 4. Embedding Pipeline

Agent search uses vector embeddings. After seeding agents, generate embeddings:

```bash
# One-off: embed all existing agents
curl -X POST https://agentmatch.io/api/agents/embed-all \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

Or run the embeddings for a single agent after creating it in the admin UI.

---

## 5. Google OAuth Setup

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorised redirect URI: `https://agentmatch.io/api/auth/callback/google`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to env vars

---

## 6. SEO Checklist

- [ ] `NEXT_PUBLIC_BASE_URL` set to production URL (no trailing slash)
- [ ] `/sitemap.xml` returns all active agents
- [ ] `/robots.txt` disallows admin/api/dashboard
- [ ] `GOOGLE_SITE_VERIFICATION` set → verify in Google Search Console
- [ ] Submit sitemap in Google Search Console: `https://agentmatch.io/sitemap.xml`
- [ ] OG image at `/public/og-default.png` (1200×630px)
- [ ] Agent profiles have JSON-LD structured data (automatic)

---

## 7. PostHog Analytics Setup

1. Create project at [posthog.com](https://app.posthog.com)
2. Copy the project API key
3. Set `NEXT_PUBLIC_POSTHOG_KEY` env var
4. Analytics will activate automatically — no code changes needed

**Key events tracked automatically:**
- `$pageview` — every route change
- `search_submitted` — query + result count
- `agent_viewed` — from search result cards
- `watchlist_added/removed` — watchlist changes
- `submission_completed` — agent nomination form

---

## 8. Performance

- Agent profile pages: cached 60s at CDN (`s-maxage=60, stale-while-revalidate=300`)
- Static assets: immutable 1-year cache
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Image format: AVIF → WebP → fallback

---

## 9. Editorial Invariants (NEVER remove)

These are structural product requirements, not implementation preferences:

1. **`weaknesses` is mandatory** — DB-level NOT NULL + CHECK constraint in `constraints.sql` + Zod validation in all write paths + UI enforcement in admin form
2. **Rankings are never influenced by commercial relationships** — `lib/search/ranking.ts` is the ONLY place ranking logic lives; `lib/search/featured.ts` is the ONLY place commercial placement lives (currently always returns `[]`)
3. **Agent profile pages must be SSR** — `app/agents/[id]/page.tsx` is a Server Component; do NOT add `"use client"` to it

---

## 10. CI/CD

GitHub Actions (`.github/workflows/ci.yml`) runs on every push:
1. `npm run lint`
2. `npm run type-check`
3. `npm run build`

Vercel auto-deploys `main` branch on push.
