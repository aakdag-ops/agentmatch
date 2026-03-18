-- AgentMatch — DB-level integrity constraints
-- Run AFTER `prisma migrate deploy` via `npm run db:setup`
--
-- These constraints cannot be expressed in Prisma schema syntax and are
-- managed separately. They enforce editorial invariants that the codebase
-- depends on.

-- ============================================================
-- INVARIANT: agents.weaknesses must be a non-empty JSON array
-- This is the most critical editorial rule: every agent profile
-- MUST disclose at least one confirmed weakness.
-- ============================================================
ALTER TABLE agents
  DROP CONSTRAINT IF EXISTS weaknesses_not_empty;

ALTER TABLE agents
  ADD CONSTRAINT weaknesses_not_empty
  CHECK (
    weaknesses IS NOT NULL
    AND jsonb_typeof(weaknesses) = 'array'
    AND jsonb_array_length(weaknesses) > 0
  );

-- ============================================================
-- INVARIANT: agents.capabilities must be a non-empty JSON array
-- ============================================================
ALTER TABLE agents
  DROP CONSTRAINT IF EXISTS capabilities_not_empty;

ALTER TABLE agents
  ADD CONSTRAINT capabilities_not_empty
  CHECK (
    capabilities IS NOT NULL
    AND jsonb_typeof(capabilities) = 'array'
    AND jsonb_array_length(capabilities) > 0
  );

-- ============================================================
-- INVARIANT: score values must be in range [0, 10]
-- ============================================================
ALTER TABLE agents
  DROP CONSTRAINT IF EXISTS scores_range_check;

ALTER TABLE agents
  ADD CONSTRAINT scores_range_check
  CHECK (
    (score_accuracy       IS NULL OR (score_accuracy       >= 0 AND score_accuracy       <= 10))
    AND (score_latency    IS NULL OR (score_latency        >= 0 AND score_latency        <= 10))
    AND (score_reliability IS NULL OR (score_reliability   >= 0 AND score_reliability    <= 10))
    AND (score_ease_of_use IS NULL OR (score_ease_of_use   >= 0 AND score_ease_of_use    <= 10))
    AND (score_cost_efficiency IS NULL OR (score_cost_efficiency >= 0 AND score_cost_efficiency <= 10))
  );

-- ============================================================
-- INDEX: pgvector IVFFlat index for cosine similarity search
-- Created after data is seeded (needs rows to build efficiently)
-- Run manually after seeding 150+ agents: npm run db:index
-- ============================================================
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS agent_embeddings_vector_idx
--   ON agent_embeddings
--   USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 100);
-- (Uncomment and run manually after seeding)

-- ============================================================
-- RANKING INTEGRITY NOTE (non-enforceable in SQL, enforced in code)
-- lib/search/ranking.ts contains ONLY organic ranking signals:
--   - semantic similarity score (40%)
--   - category relevance (30%)
--   - recency of last test (20%)
--   - user rating signal (10%)
-- Any "featured" or "sponsored" logic MUST live in a separate
-- lib/search/featured.ts module and MUST NOT modify the ranked
-- results list — it may only inject clearly-labelled entries
-- alongside the organic results.
-- ============================================================
