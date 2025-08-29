<?php
require_once __DIR__ . '/Db.php';

class JobRepository {
    public static function create(array $data): array {
        $pdo = Db::conn();
        $sql = "INSERT INTO video_jobs (job_id, user_id, type, params, status, progress, total_duration_seconds, created_at, updated_at)
                VALUES (:job_id, :user_id, :type, :params, 'queued', 0, :total, NOW(), NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':job_id' => $data['job_id'],
            ':user_id' => $data['user_id'],
            ':type' => $data['type'],
            ':params' => json_encode($data['params'] ?? []),
            ':total' => $data['total_duration_seconds'] ?? null,
        ]);
        return self::getByJobId($data['job_id']);
    }

    public static function getByJobId(string $jobId): ?array {
        $pdo = Db::conn();
        $stmt = $pdo->prepare('SELECT * FROM video_jobs WHERE job_id = :job_id LIMIT 1');
        $stmt->execute([':job_id' => $jobId]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function claimQueuedJob(): ?array {
        $pdo = Db::conn();
        // fetch oldest queued
        $job = $pdo->query("SELECT * FROM video_jobs WHERE status='queued' ORDER BY created_at ASC LIMIT 1")->fetch();
        if (!$job) return null;
        // try to atomically update to processing
        $stmt = $pdo->prepare("UPDATE video_jobs SET status='processing', started_at=NOW(), updated_at=NOW() WHERE id=:id AND status='queued'");
        $stmt->execute([':id' => $job['id']]);
        if ($stmt->rowCount() === 0) return null; // someone else took it
        return self::getByJobId($job['job_id']);
    }

    public static function updateProgress(string $jobId, int $progress, ?string $error = null) {
        $pdo = Db::conn();
        $stmt = $pdo->prepare('UPDATE video_jobs SET progress=:p, error=:e, updated_at=NOW() WHERE job_id=:job');
        $stmt->execute([':p' => max(0, min(100, $progress)), ':e' => $error, ':job' => $jobId]);
    }

    public static function markCompleted(string $jobId, string $videoPath, string $previewPath) {
        $pdo = Db::conn();
        $stmt = $pdo->prepare("UPDATE video_jobs SET status='completed', progress=100, video_path=:v, preview_path=:p, completed_at=NOW(), updated_at=NOW() WHERE job_id=:job");
        $stmt->execute([':v' => $videoPath, ':p' => $previewPath, ':job' => $jobId]);
    }

    public static function markFailed(string $jobId, string $error) {
        $pdo = Db::conn();
        $stmt = $pdo->prepare("UPDATE video_jobs SET status='failed', error=:e, updated_at=NOW() WHERE job_id=:job");
        $stmt->execute([':e' => $error, ':job' => $jobId]);
    }

    public static function listByUser(string $userId, int $limit = 20, int $offset = 0): array {
        $pdo = Db::conn();
        $stmt = $pdo->prepare('SELECT * FROM video_jobs WHERE user_id=:u ORDER BY created_at DESC LIMIT :lim OFFSET :off');
        $stmt->bindValue(':u', $userId);
        $stmt->bindValue(':lim', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':off', $offset, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public static function retry(string $jobId): bool {
        $pdo = Db::conn();
        $stmt = $pdo->prepare("UPDATE video_jobs SET status='queued', progress=0, error=NULL, video_path=NULL, preview_path=NULL, started_at=NULL, completed_at=NULL, updated_at=NOW() WHERE job_id=:job");
        $stmt->execute([':job' => $jobId]);
        return $stmt->rowCount() > 0;
    }
}

?>

