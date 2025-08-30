<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Db.php';
require_once __DIR__ . '/../lib/Util.php';

Util::cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Util::json(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$userId = trim((string)($input['user_id'] ?? 'guest'));
$active = max(0, (int)($input['fuel_active'] ?? 0));
$expired = max(0, (int)($input['fuel_expired'] ?? 0));
$premium = max(0, (int)($input['fuel_active_premium'] ?? 0));

try {
    $pdo = Db::conn();
    $pdo->prepare('INSERT INTO fuel_status (user_id, fuel_active, fuel_expired, fuel_active_premium) VALUES (:u,:a,:e,:p)
                   ON CONFLICT (user_id) DO UPDATE SET fuel_active=EXCLUDED.fuel_active, fuel_expired=EXCLUDED.fuel_expired, fuel_active_premium=EXCLUDED.fuel_active_premium, updated_at=NOW()')
        ->execute([':u'=>$userId, ':a'=>$active, ':e'=>$expired, ':p'=>$premium]);
    Util::json(['success' => true]);
} catch (Throwable $e) {
    Util::json(['success' => false, 'error' => $e->getMessage()], 500);
}

?>

