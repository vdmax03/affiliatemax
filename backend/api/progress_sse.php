<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Db.php';
require_once __DIR__ . '/../lib/Util.php';
require_once __DIR__ . '/../lib/JobRepository.php';

// Simple Server-Sent Events endpoint for progress updates

$jobId = $_GET['id'] ?? null;
if (!$jobId) {
    http_response_code(400);
    echo 'Missing id';
    exit;
}

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGINS);
@ini_set('output_buffering', 'off');
@ini_set('zlib.output_compression', '0');
while (ob_get_level() > 0) { @ob_end_flush(); }

// Send ping every 20s to keep alive
$lastEventId = 0;

while (true) {
    $job = JobRepository::getByJobId($jobId);
    if (!$job) break;

    $payload = [
        'id' => $job['job_id'],
        'status' => $job['status'],
        'progress' => (int)$job['progress'],
    ];
    if ($job['video_path']) $payload['video_url'] = PUBLIC_BASE_URL . '/' . basename(dirname($job['video_path'])) . '/' . basename($job['video_path']);
    if ($job['preview_path']) $payload['preview_url'] = PUBLIC_BASE_URL . '/' . basename(dirname($job['preview_path'])) . '/' . basename($job['preview_path']);

    echo 'event: progress' . "\n";
    echo 'data: ' . json_encode($payload) . "\n\n";
    @ob_flush();
    @flush();

    if ($job['status'] === 'completed' || $job['status'] === 'failed' || $job['status'] === 'canceled') {
        break;
    }

    sleep(1);
}

?>
