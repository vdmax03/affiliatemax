<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Db.php';
require_once __DIR__ . '/../lib/Util.php';

Util::cors();

$userId = isset($_GET['user_id']) ? (string)$_GET['user_id'] : 'guest';

try {
    $pdo = Db::conn();
    $stmt = $pdo->prepare('SELECT fuel_active, fuel_expired, fuel_active_premium, updated_at FROM fuel_status WHERE user_id=:u');
    $stmt->execute([':u' => $userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        $row = [
            'fuel_active' => 0,
            'fuel_expired' => 0,
            'fuel_active_premium' => 0,
            'updated_at' => null,
        ];
    }
    Util::json(['success' => true, 'user_id' => $userId, 'fuel' => $row]);
} catch (Throwable $e) {
    Util::json(['success' => false, 'error' => $e->getMessage()], 500);
}

?>

