<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Db.php';
require_once __DIR__ . '/../lib/Util.php';
require_once __DIR__ . '/../lib/JobRepository.php';

Util::cors();

$jobId = $_GET['id'] ?? null;
if (!$jobId) Util::json(['error' => 'Missing id'], 400);

$job = JobRepository::getByJobId($jobId);
if (!$job) Util::json(['error' => 'Not found'], 404);

$resp = [
    'id' => $job['job_id'],
    'status' => $job['status'],
    'progress' => (int)$job['progress'],
    'error' => $job['error'],
    'video_url' => $job['video_path'] ? (PUBLIC_BASE_URL . '/' . basename(dirname($job['video_path'])) . '/' . basename($job['video_path'])) : null,
    'preview_url' => $job['preview_path'] ? (PUBLIC_BASE_URL . '/' . basename(dirname($job['preview_path'])) . '/' . basename($job['preview_path'])) : null,
    'created_at' => $job['created_at'],
];

Util::json(['success' => true, 'job' => $resp]);

?>

