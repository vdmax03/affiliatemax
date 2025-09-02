<?php
// Basic configuration for the video generation backend

// Database connection
// Supported drivers: 'mysql' or 'pgsql' (Neon = 'pgsql')

// Load .env if present (so you can put DATABASE_URL here)
function _load_env_file($path) {
    if (!file_exists($path)) return;
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (preg_match('/^\s*#/', $line)) continue;
        if (!str_contains($line, '=')) continue;
        [$k, $v] = array_map('trim', explode('=', $line, 2));
        $v = trim($v, "\"' ");
        if ($k && getenv($k) === false) {
            putenv("$k=$v");
            $_ENV[$k] = $v;
            $_SERVER[$k] = $v;
        }
    }
}
_load_env_file(__DIR__ . '/.env');

// Allow a single DATABASE_URL env (recommended for Neon)
// Format (Neon): postgres://USER:PASSWORD@HOST:5432/DB?sslmode=require
$dbFromUrl = null;
$databaseUrl = getenv('DATABASE_URL');
if ($databaseUrl) {
    $p = parse_url($databaseUrl);
    if ($p && isset($p['scheme'], $p['host'], $p['user'], $p['pass'], $p['path'])) {
        $driver = ($p['scheme'] === 'postgres' || $p['scheme'] === 'postgresql') ? 'pgsql' : $p['scheme'];
        $dbFromUrl = [
            'driver' => $driver,
            'host' => $p['host'],
            'port' => isset($p['port']) ? (string)$p['port'] : ($driver === 'pgsql' ? '5432' : '3306'),
            'name' => ltrim($p['path'], '/'),
            'user' => $p['user'],
            'pass' => $p['pass'],
            'sslmode' => 'require',
        ];
        if (isset($p['query'])) {
            parse_str($p['query'], $q);
            if (!empty($q['sslmode'])) $dbFromUrl['sslmode'] = $q['sslmode'];
        }
    }
}

define('DB_DRIVER', $dbFromUrl['driver'] ?? (getenv('APP_DB_DRIVER') ?: 'mysql'));
define('DB_HOST', $dbFromUrl['host'] ?? (getenv('APP_DB_HOST') ?: '127.0.0.1'));
define('DB_NAME', $dbFromUrl['name'] ?? (getenv('APP_DB_NAME') ?: 'affiliatemaxx'));
define('DB_USER', $dbFromUrl['user'] ?? (getenv('APP_DB_USER') ?: 'root'));
define('DB_PASS', $dbFromUrl['pass'] ?? (getenv('APP_DB_PASS') ?: ''));
define('DB_PORT', $dbFromUrl['port'] ?? (getenv('APP_DB_PORT') ?: (DB_DRIVER === 'pgsql' ? '5432' : '3306')));
// For Neon (Postgres), SSL is required
define('DB_SSLMODE', $dbFromUrl['sslmode'] ?? (getenv('APP_DB_SSLMODE') ?: (DB_DRIVER === 'pgsql' ? 'require' : '')));

// Paths
define('STORAGE_PATH', __DIR__ . '/storage'); // folder where videos/thumbs are stored
define('PUBLIC_BASE_URL', getenv('PUBLIC_BASE_URL') ?: '/storage'); // adjust to match your web server mapping

// FFmpeg binary (adjust if needed)
define('FFMPEG_BIN', getenv('FFMPEG_BIN') ?: 'ffmpeg'); // or full path e.g. C:\\ffmpeg\\bin\\ffmpeg.exe

// Security
define('ALLOWED_ORIGINS', getenv('ALLOWED_ORIGINS') ?: '*');

// Misc
define('MAX_IMAGES', 30); // safety cap
define('MIGRATE_TOKEN', getenv('MIGRATE_TOKEN') ?: ''); // optional token to protect /api/migrate.php

// Ensure storage subfolders exist
foreach ([STORAGE_PATH, STORAGE_PATH . '/jobs'] as $dir) {
    if (!is_dir($dir)) @mkdir($dir, 0775, true);
}
// Ensure images folder for T2I/I2I
if (!is_dir(STORAGE_PATH . '/images')) @mkdir(STORAGE_PATH . '/images', 0775, true);

// no closing tag
