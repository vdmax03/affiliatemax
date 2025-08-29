-- MySQL schema for video job backend

CREATE TABLE IF NOT EXISTS video_jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL UNIQUE,
  user_id VARCHAR(191) NOT NULL,
  type VARCHAR(32) NOT NULL, -- e.g., image_to_video
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

