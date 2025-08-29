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
$jobId = $input['id'] ?? null;
if (!$jobId) Util::json(['error' => 'Missing id'], 400);

$ok = JobRepository::retry($jobId);
Util::json(['success' => $ok]);

?>

