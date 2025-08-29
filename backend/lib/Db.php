<?php
require_once __DIR__ . '/../config.php';

class Db {
    private static ?PDO $pdo = null;

    public static function conn(): PDO {
        if (self::$pdo === null) {
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            if (DB_DRIVER === 'pgsql') {
                // Neon requires sslmode=require
                $dsn = 'pgsql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';sslmode=' . (DB_SSLMODE ?: 'require');
                self::$pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            } else {
                $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
                self::$pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            }
        }
        return self::$pdo;
    }
}

?>
