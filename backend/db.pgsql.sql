-- PostgreSQL (Neon) schema for video job backend

CREATE TABLE IF NOT EXISTS video_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL UNIQUE,
  user_id VARCHAR(191) NOT NULL,
  type VARCHAR(32) NOT NULL,
  params JSONB NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'queued', -- queued|processing|completed|failed|canceled
  progress SMALLINT NOT NULL DEFAULT 0,
  total_duration_seconds NUMERIC(10,2),
  video_path TEXT,
  preview_path TEXT,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_video_jobs_user_created ON video_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON video_jobs (status);

