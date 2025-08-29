Backend: PHP + MySQL + FFmpeg (Minimal Video Generator)

Endpoints
- POST `api/create_job.php`: create image_to_video job
- GET `api/job_status.php?id=JOB_ID`: get status/progress/urls
- GET `api/list_history.php?user_id=USER`: list user history
- POST `api/retry_job.php` body: `{ "id": "JOB_ID" }`
- GET `api/progress_sse.php?id=JOB_ID`: SSE progress stream

Quick Start
1) Requirements
   - PHP 8.0+ with PDO MySQL
   - MySQL/MariaDB
   - FFmpeg installed (`ffmpeg` in PATH)
2) Database
   - MySQL: import `db.sql`
   - Postgres/Neon: import `db.pgsql.sql` (via Neon SQL Editor or psql)
3) Config
   - Edit `config.php`:
     - Set `DB_DRIVER` to `pgsql` for Neon
     - Set `DB_HOST`, `DB_PORT` (5432), `DB_NAME`, `DB_USER`, `DB_PASS`
     - Ensure `DB_SSLMODE=require` (default for pgsql)
     - Set `FFMPEG_BIN` if needed
4) Dev server (optional)
   - `php -S 127.0.0.1:8080 -t backend`
   - API will be under `http://127.0.0.1:8080/api/`
5) Start worker
   - `php backend/worker.php`
6) Test
   - Create job:
     `curl -X POST http://127.0.0.1:8080/api/create_job.php -H "Content-Type: application/json" -d "{\"user_id\":\"demo\",\"type\":\"image_to_video\",\"images\":[\"https://picsum.photos/seed/a/800/1200\",\"https://picsum.photos/seed/b/800/1200\"],\"duration_per_image\":3,\"fps\":30,\"resolution\":\"1080x1920\"}"`
   - Poll status:
     `curl "http://127.0.0.1:8080/api/job_status.php?id=JOB_ID"`
   - Or stream SSE in browser:
     `new EventSource('/api/progress_sse.php?id=JOB_ID')`

Notes
- Outputs saved to `backend/storage/jobs/JOB_ID/` (video `output.mp4`, thumbnail `preview.jpg`).
- Map `backend/storage` to be publicly readable to serve `PUBLIC_BASE_URL`.
- Progress is derived from ffmpeg stderr time vs total duration.
