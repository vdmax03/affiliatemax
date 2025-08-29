<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Db.php';
require_once __DIR__ . '/../lib/Util.php';

Util::cors();

try {
    $pdo = Db::conn();
    $driver = DB_DRIVER;
    if ($driver === 'pgsql') {
        $row = $pdo->query("SELECT NOW() as now")->fetch();
    } else {
        $row = $pdo->query("SELECT NOW() as now")->fetch();
    }
    Util::json([
        'ok' => true,
        'driver' => $driver,
        'db' => DB_NAME,
        'host' => DB_HOST,
        'port' => DB_PORT,
        'time' => $row['now'] ?? null,
    ]);
} catch (Throwable $e) {
    Util::json([
        'ok' => false,
        'error' => $e->getMessage(),
    ], 500);
}

?>

