<?php

class Util {
    public static function cors() {
        header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGINS);
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    public static function json($data, int $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    public static function uuid(): string {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    public static function ensureDir(string $path) {
        if (!is_dir($path)) @mkdir($path, 0775, true);
    }

    public static function secondsFromHms(string $hms): float {
        // hms like 00:01:02.34
        if (!preg_match('/^(\d+):(\d+):(\d+(?:\.\d+)?)$/', $hms, $m)) return 0.0;
        return ((int)$m[1]) * 3600 + ((int)$m[2]) * 60 + (float)$m[3];
    }
}
