<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Db.php';
require_once __DIR__ . '/../lib/Util.php';
require_once __DIR__ . '/../lib/JobRepository.php';

Util::cors();

$userId = $_GET['user_id'] ?? null;
if (!$userId) Util::json(['error' => 'Missing user_id'], 400);

$limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 20;
$offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

$rows = JobRepository::listByUser($userId, $limit, $offset);

$items = array_map(function($job) {
    return [
        'id' => $job['job_id'],
        'status' => $job['status'],
        'progress' => (int)$job['progress'],
        'video_url' => $job['video_path'] ? (PUBLIC_BASE_URL . '/' . basename(dirname($job['video_path'])) . '/' . basename($job['video_path'])) : null,
        'preview_url' => $job['preview_path'] ? (PUBLIC_BASE_URL . '/' . basename(dirname($job['preview_path'])) . '/' . basename($job['preview_path'])) : null,
        'created_at' => $job['created_at'],
        'completed_at' => $job['completed_at'],
    ];
}, $rows);

Util::json(['success' => true, 'items' => $items]);

?>

