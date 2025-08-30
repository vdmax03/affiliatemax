export type CreateJobResponse = { success: boolean; job?: { id: string; status: string; progress: number; created_at: string } ; error?: string };

const backendBase = (import.meta as any).env?.VITE_BACKEND_BASE || '';

const baseUrl = backendBase.replace(/\/$/, '');

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
  const r = await fetch(`${baseUrl}/api/create_job.php`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  });
  return r.json();
}

export async function getJobStatus(jobId: string) {
  const r = await fetch(`${baseUrl}/api/job_status.php?id=${encodeURIComponent(jobId)}`);
  return r.json();
}

export function sseProgress(jobId: string, onMessage: (data: any) => void) {
  const es = new EventSource(`${baseUrl}/api/progress_sse.php?id=${encodeURIComponent(jobId)}`);
  es.onmessage = (ev) => {
    try { onMessage(JSON.parse(ev.data)); } catch {}
  };
  return () => es.close();
}

export async function listVideoHistory(userId: string, limit = 20) {
  const r = await fetch(`${baseUrl}/api/list_history.php?user_id=${encodeURIComponent(userId)}&limit=${limit}`);
  return r.json();
}

export async function listImageHistory(userId: string, limit = 20) {
  const r = await fetch(`${baseUrl}/api/list_image_history.php?user_id=${encodeURIComponent(userId)}&limit=${limit}`);
  return r.json();
}

export async function getFuelStatus(userId: string) {
  const r = await fetch(`${baseUrl}/api/fuel_status.php?user_id=${encodeURIComponent(userId)}`);
  return r.json();
}

