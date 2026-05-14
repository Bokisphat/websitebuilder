-- Run once in Vercel Postgres / Neon: Dashboard → SQL editor, or `psql`.
-- Fusion member id matches /users/subscriber/show/{id} (store as text for flexibility).

CREATE TABLE IF NOT EXISTS member_site_quotas (
  subscriber_id VARCHAR(32) PRIMARY KEY,
  max_sites INT NOT NULL CHECK (max_sites >= 1 AND max_sites <= 500),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS member_saved_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id VARCHAR(32) NOT NULL,
  name TEXT NOT NULL,
  config JSONB NOT NULL,
  publish_status VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK (publish_status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_saved_sites_subscriber ON member_saved_sites (subscriber_id);
