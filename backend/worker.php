<?php
// CLI worker: pulls queued jobs from DB, processes with ffmpeg, updates progress

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Db.php';
require_once __DIR__ . '/lib/Util.php';
require_once __DIR__ . '/lib/JobRepository.php';

if (php_sapi_name() !== 'cli') {
    fwrite(STDERR, "Run this script via CLI: php backend/worker.php\n");
    exit(1);
}

date_default_timezone_set('UTC');

function logmsg($msg) {
    fwrite(STDOUT, '[' . date('Y-m-d H:i:s') . "] $msg\n");
}

function run_ffmpeg_command(array $cmd, callable $onProgress = null, float $totalDuration = 0.0): int {
    $descriptorSpec = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w'], // stderr
    ];
    $process = proc_open($cmd, $descriptorSpec, $pipes);
    if (!is_resource($process)) return -1;
    fclose($pipes[0]);
    stream_set_blocking($pipes[1], false);
    stream_set_blocking($pipes[2], false);
    $buffer = '';
    $exitCode = null;
    while (true) {
        $status = proc_get_status($process);
        $out = stream_get_contents($pipes[1]);
        $err = stream_get_contents($pipes[2]);
        if ($onProgress && $err) {
            // Parse time=HH:MM:SS.xx from stderr
            if (preg_match_all('/time=([\d:\.]+)/', $err, $matches)) {
                $last = end($matches[1]);
                $sec = Util::secondsFromHms($last);
                if ($totalDuration > 0) {
                    $pct = (int)max(1, min(99, floor(($sec / $totalDuration) * 100)));
                    $onProgress($pct);
                }
            }
        }
        if (!$status['running']) {
            $exitCode = $status['exitcode'];
            break;
        }
        usleep(200000); // 200ms
    }
    fclose($pipes[1]);
    fclose($pipes[2]);
    proc_close($process);
    return $exitCode ?? 0;
}

function process_job(array $job) {
    $jobId = $job['job_id'];
    $params = json_decode($job['params'] ?: '[]', true) ?: [];
    $images = $params['images'] ?? [];
    $durationPerImage = max(1, (int)($params['duration_per_image'] ?? 3));
    $fps = max(24, min(60, (int)($params['fps'] ?? 30)));
    $resolution = $params['resolution'] ?? '1080x1920';
    [$w, $h] = array_map('intval', explode('x', $resolution));

    $workdir = STORAGE_PATH . '/jobs/' . $jobId;
    Util::ensureDir($workdir);

    $localImages = [];
    foreach ($images as $idx => $src) {
        $ext = pathinfo(parse_url($src, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION) ?: 'jpg';
        $dst = $workdir . '/img_' . str_pad((string)($idx+1), 3, '0', STR_PAD_LEFT) . '.' . $ext;
        try {
            if (preg_match('/^https?:\/\//i', $src)) {
                // remote download
                $data = @file_get_contents($src);
                if ($data === false) throw new Exception('Failed to download ' . $src);
                file_put_contents($dst, $data);
            } elseif (preg_match('/^data:image\//i', $src)) {
                // base64 data URI
                [, $base64] = explode(',', $src, 2);
                file_put_contents($dst, base64_decode($base64));
            } else {
                // local path copy
                if (!@copy($src, $dst)) throw new Exception('Failed to copy ' . $src);
            }
            $localImages[] = $dst;
            JobRepository::updateProgress($jobId, min(10, (int)(($idx+1) / max(1, count($images)) * 10))); // up to 10%
        } catch (Exception $e) {
            JobRepository::markFailed($jobId, $e->getMessage());
            return;
        }
    }

    // Build concat list file
    $listFile = $workdir . '/list.txt';
    $listContent = '';
    foreach ($localImages as $img) {
        $listContent .= "file '" . str_replace("'", "'\\''", $img) . "'\n";
        $listContent .= "duration $durationPerImage\n";
    }
    // Repeat last image to ensure last duration is honored
    if ($localImages) $listContent .= "file '" . str_replace("'", "'\\''", end($localImages)) . "'\n";
    file_put_contents($listFile, $listContent);

    $outputVideo = $workdir . '/output.mp4';
    $preview = $workdir . '/preview.jpg';

    $totalDuration = (float)$job['total_duration_seconds'];

    // ffmpeg command using concat demuxer + scale/pad to requested resolution
    $vf = "scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,format=yuv420p";

    $cmd = [FFMPEG_BIN,
        '-y',
        '-f','concat','-safe','0','-i',$listFile,
        '-r', (string)$fps,
        '-vf', $vf,
        '-pix_fmt','yuv420p',
        $outputVideo
    ];

    logmsg("[{$jobId}] Running ffmpeg to build video...");
    $code = run_ffmpeg_command($cmd, function($pct) use ($jobId) {
        JobRepository::updateProgress($jobId, max(10, min(95, $pct)));
    }, $totalDuration);

    if ($code !== 0 || !file_exists($outputVideo)) {
        JobRepository::markFailed($jobId, 'ffmpeg failed to produce output (code ' . $code . ')');
        return;
    }

    // Generate preview thumbnail at 1s
    $thumbCmd = [FFMPEG_BIN, '-y', '-i', $outputVideo, '-ss', '00:00:01', '-frames:v', '1', '-vf', 'scale=320:-1', $preview];
    run_ffmpeg_command($thumbCmd);

    JobRepository::updateProgress($jobId, 98);

    JobRepository::markCompleted($jobId, $outputVideo, $preview);
    logmsg("[{$jobId}] Completed");
}

// Support single-iteration mode for shared hosting cron jobs
$runOnce = in_array('--once', $argv ?? [], true) || getenv('WORKER_ONCE');

logmsg('Worker started' . ($runOnce ? ' (once)' : ''));

do {
    $job = JobRepository::claimQueuedJob();
    if ($job) {
        logmsg('Picked job ' . $job['job_id']);
        process_job($job);
    } else {
        if ($runOnce) break;
        usleep(500000); // 0.5s idle wait
    }
} while (!$runOnce);

logmsg('Worker exiting');

?>
