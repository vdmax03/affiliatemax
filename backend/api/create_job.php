<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Db.php';
require_once __DIR__ . '/../lib/Util.php';
require_once __DIR__ . '/../lib/JobRepository.php';

Util::cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Util::json(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$userId = trim((string)($input['user_id'] ?? 'guest'));
$type = (string)($input['type'] ?? 'image_to_video');

if ($type !== 'image_to_video') {
    Util::json(['error' => 'Only image_to_video supported in this minimal backend'], 400);
}

$images = $input['images'] ?? [];
if (!is_array($images) || empty($images)) {
    Util::json(['error' => 'images is required (array of URLs or server paths)'], 400);
}

if (count($images) > MAX_IMAGES) {
    Util::json(['error' => 'Too many images'], 400);
}

$durationPerImage = max(1, (int)($input['duration_per_image'] ?? 3));
$fps = max(24, min(60, (int)($input['fps'] ?? 30)));
$resolution = (string)($input['resolution'] ?? '1080x1920'); // WxH
$jobId = Util::uuid();

// Estimate total duration
$totalDuration = $durationPerImage * count($images);

$params = [
    'images' => $images,
    'duration_per_image' => $durationPerImage,
    'fps' => $fps,
    'resolution' => $resolution,
];

$job = JobRepository::create([
    'job_id' => $jobId,
    'user_id' => $userId,
    'type' => $type,
    'params' => $params,
    'total_duration_seconds' => $totalDuration,
]);

Util::json([
    'success' => true,
    'job' => [
        'id' => $job['job_id'],
        'status' => $job['status'],
        'progress' => (int)$job['progress'],
        'created_at' => $job['created_at'],
    ]
]);

?>

