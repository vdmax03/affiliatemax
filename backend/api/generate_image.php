<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Util.php';
require_once __DIR__ . '/../lib/Db.php';

Util::cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Util::json(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$prompt = trim((string)($input['prompt'] ?? ''));
$mode = (string)($input['mode'] ?? 'text_to_image'); // 'text_to_image' | 'image_to_image'
$images = $input['images'] ?? [];

if ($prompt === '') {
    Util::json(['error' => 'prompt is required'], 400);
}

if (!in_array($mode, ['text_to_image', 'image_to_image'], true)) {
    Util::json(['error' => 'invalid mode'], 400);
}

if ($mode === 'image_to_image') {
    if (!is_array($images) || count($images) === 0) {
        Util::json(['error' => 'images is required for image_to_image'], 400);
    }
    if (count($images) > 5) {
        Util::json(['error' => 'Too many images (max 5)'], 400);
    }
}

$apiKey = null;
// Allow API key to be provided by client (UI) or fallback to env
if (isset($input['api_key']) && is_string($input['api_key']) && $input['api_key'] !== '') {
    $apiKey = $input['api_key'];
} elseif (!empty($_GET['api_key'])) {
    $apiKey = (string)$_GET['api_key'];
} elseif (!empty($_SERVER['HTTP_X_API_KEY'])) { // optional header
    $apiKey = (string)$_SERVER['HTTP_X_API_KEY'];
} else {
    $apiKey = getenv('GEMINI_API_KEY');
}
if (!$apiKey) {
    Util::json(['error' => 'Server misconfigured: GEMINI_API_KEY missing'], 500);
}

$apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=' . rawurlencode($apiKey);

// Build parts: prompt text + optional inline images
$parts = [['text' => $prompt]];

if ($mode === 'image_to_image') {
    foreach ($images as $img) {
        // Accept either {mimeType, data} or data URL string
        if (is_array($img) && isset($img['mimeType'], $img['data'])) {
            $mime = (string)$img['mimeType'];
            $data = (string)$img['data'];
        } elseif (is_string($img) && str_starts_with($img, 'data:')) {
            if (preg_match('/^data:([^;]+);base64,(.*)$/', $img, $m)) {
                $mime = $m[1];
                $data = $m[2];
            } else {
                continue; // skip invalid data URL
            }
        } else {
            // If it's a URL, try to fetch and base64 it (best-effort)
            $mime = 'image/jpeg';
            $data = '';
            if (is_string($img) && preg_match('/^https?:\/\//i', $img)) {
                $bin = @file_get_contents($img);
                if ($bin !== false) {
                    $data = base64_encode($bin);
                    // crude mime sniff
                    $finfo = new finfo(FILEINFO_MIME_TYPE);
                    $det = $finfo->buffer($bin) ?: '';
                    if ($det) $mime = $det;
                }
            }
            if ($data === '') continue;
        }

        $parts[] = [
            'inlineData' => [
                'mimeType' => $mime,
                'data' => $data,
            ]
        ];
    }
}

$payload = [
    'contents' => [ [ 'parts' => $parts ] ],
    'generationConfig' => [
        'responseModalities' => ['TEXT', 'IMAGE']
    ],
];

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [ 'Content-Type: application/json' ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 60,
]);
$resp = curl_exec($ch);
$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
curl_close($ch);

if ($resp === false) {
    Util::json(['error' => 'Upstream error: ' . $err], 502);
}

$json = json_decode($resp, true);
if (!is_array($json)) {
    Util::json(['error' => 'Upstream returned invalid JSON', 'status' => $http], 502);
}

$partsOut = $json['candidates'][0]['content']['parts'] ?? [];
$inline = null;
foreach ($partsOut as $p) {
    if (isset($p['inlineData']['data'])) {
        $inline = $p['inlineData'];
        break;
    }
}

if (!$inline) {
    Util::json([
        'error' => 'No image returned',
        'upstream_status' => $http,
        'upstream' => $json,
    ], 502);
}

// Persist to file + DB so UI can show history from backend
$mime = $inline['mimeType'] ?? 'image/jpeg';
$ext = str_contains($mime, 'png') ? 'png' : (str_contains($mime, 'webp') ? 'webp' : 'jpg');
$imgId = Util::uuid();
$fileRel = 'images/' . $imgId . '.' . $ext;
$fileAbs = STORAGE_PATH . '/' . $fileRel;
@file_put_contents($fileAbs, base64_decode($inline['data']));

$userId = trim((string)($input['user_id'] ?? 'guest'));
try {
    $pdo = Db::conn();
    $stmt = $pdo->prepare('INSERT INTO image_generations (id, user_id, mode, prompt, mime_type, image_url) VALUES (:id,:u,:m,:p,:mt,:url)');
    $stmt->execute([
        ':id' => $imgId,
        ':u' => $userId,
        ':m' => $mode,
        ':p' => $prompt,
        ':mt' => $mime,
        ':url' => PUBLIC_BASE_URL . '/' . $fileRel,
    ]);
} catch (Throwable $e) {
    // ignore DB persistence errors
}

Util::json([
    'success' => true,
    'image_base64' => $inline['data'],
    'mime_type' => $mime,
    'image_url' => PUBLIC_BASE_URL . '/' . $fileRel,
]);

?>
