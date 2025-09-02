<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Db.php';
require_once __DIR__ . '/../lib/Util.php';

Util::cors();

// Simple protection: require ?t= token if MIGRATE_TOKEN is set
if (MIGRATE_TOKEN !== '') {
    $t = isset($_GET['t']) ? (string)$_GET['t'] : '';
    if (!hash_equals(MIGRATE_TOKEN, $t)) {
        Util::json(['ok' => false, 'error' => 'forbidden'], 403);
    }
}

try {
    $pdo = Db::conn();
    $driver = DB_DRIVER;
    $applied = [];

    if ($driver === 'pgsql') {
        // Create table if missing
        $pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS video_jobs (
  id BIGSERIAL PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL UNIQUE,
  user_id VARCHAR(191) NOT NULL,
  type VARCHAR(32) NOT NULL,
  params JSONB NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'queued',
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
SQL);
        $applied[] = 'create_table_if_not_exists_video_jobs';

        // Ensure columns exist (idempotent)
        $cols = [
          "status VARCHAR(16) NOT NULL DEFAULT 'queued'",
          "progress SMALLINT NOT NULL DEFAULT 0",
          "total_duration_seconds NUMERIC(10,2)",
          "video_path TEXT",
          "preview_path TEXT",
          "error TEXT",
          "created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
          "updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()",
          "started_at TIMESTAMPTZ",
          "completed_at TIMESTAMPTZ"
        ];
        foreach ($cols as $def) {
            // extract column name
            $parts = preg_split('/\s+/', $def);
            $col = $parts[0];
            $pdo->exec("ALTER TABLE video_jobs ADD COLUMN IF NOT EXISTS $def");
            $applied[] = "alter_add_if_not_exists_$col";
        }
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_video_jobs_user_created ON video_jobs (user_id, created_at DESC)");
        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_video_jobs_status ON video_jobs (status)");
        $applied[] = 'ensure_indexes';
    } else {
        // MySQL compatible
        $pdo->exec(<<<SQL
CREATE TABLE IF NOT EXISTS video_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL UNIQUE,
  user_id VARCHAR(191) NOT NULL,
  type VARCHAR(32) NOT NULL,
  params JSON NULL,
  status ENUM('queued','processing','completed','failed','canceled') NOT NULL DEFAULT 'queued',
  progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
  total_duration_seconds DECIMAL(10,2) NULL,
  video_path VARCHAR(512) NULL,
  preview_path VARCHAR(512) NULL,
  error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_status (status)
);
SQL);
        $applied[] = 'create_table_if_not_exists_video_jobs_mysql';
    }

    Util::json(['ok' => true, 'driver' => $driver, 'applied' => $applied]);
} catch (Throwable $e) {
    Util::json(['ok' => false, 'error' => $e->getMessage()], 500);
}

// no closing tag

