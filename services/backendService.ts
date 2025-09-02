export type CreateJobResponse = { success: boolean; job?: { id: string; status: string; progress: number; created_at: string } ; error?: string };

const backendBase = (import.meta as any).env?.VITE_BACKEND_BASE || '';

const baseUrl = backendBase.replace(/\/$/, '');

// Simple console logger (visible in F12). Can be disabled by setting localStorage.API_DEBUG = '0'.
const apiShouldLog = () => {
  try { return (localStorage.getItem('API_DEBUG') ?? '1') !== '0'; } catch { return true; }
};
const log = (...args: any[]) => { if (apiShouldLog()) { try { console.log('[API]', ...args); } catch {} } };

export const backendAvailable = !!baseUrl;

const arToResolution = (ar: '16:9'|'9:16'|'1:1') => {
  switch (ar) {
    case '16:9': return '1920x1080';
    case '9:16': return '1080x1920';
    case '1:1': return '1024x1024';
  }
};

export async function createVideoJob(userId: string, imagesDataUrls: string[], durationPerImage = 3, fps = 30, aspect: '16:9'|'9:16'|'1:1'='9:16'): Promise<CreateJobResponse> {
  const body = {
    user_id: userId,
    type: 'image_to_video',
    images: imagesDataUrls,
    duration_per_image: durationPerImage,
    fps,
    resolution: arToResolution(aspect)
  };
  const url = `${baseUrl}/api/create_job.php`;
  log('createVideoJob →', url, { userId, images: imagesDataUrls.length, durationPerImage, fps, aspect });
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const json = await r.json().catch(() => ({}));
  log('createVideoJob ←', r.status, json);
  return json;
}

export async function getJobStatus(jobId: string) {
  const url = `${baseUrl}/api/job_status.php?id=${encodeURIComponent(jobId)}`;
  log('getJobStatus →', jobId);
  const r = await fetch(url);
  const json = await r.json().catch(() => ({}));
  log('getJobStatus ←', jobId, r.status, json);
  return json;
}

export function sseProgress(jobId: string, onMessage: (data: any) => void) {
  const url = `${baseUrl}/api/progress_sse.php?id=${encodeURIComponent(jobId)}`;
  log('sseProgress ▶ open', jobId, url);
  const es = new EventSource(url);
  es.onopen = () => log('sseProgress ◀ open', jobId);
  es.onerror = (e: any) => log('sseProgress ⚠ error', jobId, e);
  es.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      log('sseProgress ◀ message', jobId, data);
      onMessage(data);
    } catch (e) { log('sseProgress ⚠ parse', jobId, ev.data); }
  };
  return () => { try { es.close(); log('sseProgress ⏹ close', jobId); } catch {} };
}

export async function listVideoHistory(userId: string, limit = 20) {
  const url = `${baseUrl}/api/list_history.php?user_id=${encodeURIComponent(userId)}&limit=${limit}`;
  log('listVideoHistory →', { userId, limit });
  const r = await fetch(url);
  const json = await r.json().catch(() => ({}));
  log('listVideoHistory ←', r.status, Array.isArray(json?.items) ? `items=${json.items.length}` : json);
  return json;
}

export async function listImageHistory(userId: string, limit = 20) {
  const url = `${baseUrl}/api/list_image_history.php?user_id=${encodeURIComponent(userId)}&limit=${limit}`;
  log('listImageHistory →', { userId, limit });
  const r = await fetch(url);
  const json = await r.json().catch(() => ({}));
  log('listImageHistory ←', r.status, Array.isArray(json?.items) ? `items=${json.items.length}` : json);
  return json;
}

export async function getFuelStatus(userId: string) {
  const url = `${baseUrl}/api/fuel_status.php?user_id=${encodeURIComponent(userId)}`;
  log('getFuelStatus →', userId);
  const r = await fetch(url);
  const json = await r.json().catch(() => ({}));
  log('getFuelStatus ←', r.status, json);
  return json;
}

// Simple backend connectivity check. Tries ping endpoint if present,
// otherwise falls back to a lightweight history request.
export async function pingBackend(): Promise<{ ok: boolean; details?: any }> {
  if (!backendAvailable) return { ok: false };
  try {
    // Prefer the health endpoint
    const pingUrl = `${baseUrl}/api/health.php`;
    try {
      const pr = await fetch(pingUrl, { method: 'GET' });
      if (pr.ok) return { ok: true, details: await pr.text().catch(()=>undefined) };
    } catch {}

    // Fallback: a small history request should validate DB + API wiring
    const hr = await fetch(`${baseUrl}/api/list_history.php?user_id=guest&limit=1`);
    if (!hr.ok) return { ok: false };
    const json = await hr.json().catch(() => ({}));
    return { ok: true, details: json };
  } catch {
    return { ok: false };
  }
}
