<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Db.php';
require_once __DIR__ . '/../lib/Util.php';

Util::cors();

$userId = isset($_GET['user_id']) ? (string)$_GET['user_id'] : 'guest';
$limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 20;
$offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

try {
    $pdo = Db::conn();
    $stmt = $pdo->prepare('SELECT id, user_id, mode, prompt, mime_type, image_url, created_at FROM image_generations WHERE user_id=:u ORDER BY created_at DESC LIMIT :lim OFFSET :off');
    $stmt->bindValue(':u', $userId, PDO::PARAM_STR);
    $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    Util::json(['success' => true, 'items' => $rows]);
} catch (Throwable $e) {
    Util::json(['success' => false, 'error' => $e->getMessage()], 500);
}

?>

