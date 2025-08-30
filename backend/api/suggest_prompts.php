<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../lib/Util.php';
require_once __DIR__ . '/../lib/Suggestions.php';

Util::cors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Util::json(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$images = $input['images'] ?? [];

$apiKey = null;
if (isset($input['api_key']) && is_string($input['api_key']) && $input['api_key'] !== '') {
    $apiKey = $input['api_key'];
} elseif (!empty($_GET['api_key'])) {
    $apiKey = (string)$_GET['api_key'];
} elseif (!empty($_SERVER['HTTP_X_API_KEY'])) {
    $apiKey = (string)$_SERVER['HTTP_X_API_KEY'];
} else {
    $apiKey = getenv('GEMINI_API_KEY');
}
if (!$apiKey) {
    Util::json(['error' => 'Server misconfigured: GEMINI_API_KEY missing'], 500);
}

$apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=' . rawurlencode($apiKey);

// Add instruction including curated prompts as context
$curated = curated_prompt_list();
$contextText = "Daftar ide contoh (gunakan sebagai referensi, boleh diadaptasi):\n- " . implode("\n- ", $curated);

$parts = [[ 'text' =>
    "Berdasarkan gambar-gambar yang diunggah, hasilkan 5 saran prompt yang relevan, kreatif, dan spesifik.\n" .
    "Gunakan daftar contoh sebagai inspirasi, lalu sesuaikan dengan isi gambar (subjek, suasana, gaya).\n" .
    "Jawab hanya JSON array string tanpa teks lain." ]];

$parts[] = [ 'text' => $contextText ];

if (is_array($images)) {
    foreach ($images as $img) {
        if (is_array($img) && isset($img['mimeType'], $img['data'])) {
            $parts[] = ['inlineData' => [ 'mimeType' => (string)$img['mimeType'], 'data' => (string)$img['data'] ]];
        } elseif (is_string($img) && str_starts_with($img, 'data:')) {
            if (preg_match('/^data:([^;]+);base64,(.*)$/', $img, $m)) {
                $parts[] = ['inlineData' => [ 'mimeType' => $m[1], 'data' => $m[2] ]];
            }
        }
    }
}

$payload = [
    'contents' => [ [ 'role' => 'user', 'parts' => $parts ] ],
    'generationConfig' => [
        'responseMimeType' => 'application/json',
        'responseSchema' => [ 'type' => 'ARRAY', 'items' => [ 'type' => 'STRING' ] ],
    ],
];

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [ 'Content-Type: application/json' ],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_TIMEOUT => 45,
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

$text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
$suggestions = [];
if ($text !== '') {
    $parsed = json_decode($text, true);
    if (is_array($parsed)) $suggestions = $parsed;
}

if (empty($suggestions)) {
    // Fallback: return top 5 curated prompts if LLM did not return
    $suggestions = array_slice($curated, 0, 5);
}

Util::json(['success' => true, 'suggestions' => $suggestions]);

?>
