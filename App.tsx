import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { LoadingIndicator } from './components/LoadingIndicator';
import { VideoPlayer } from './components/VideoPlayer';
import { SupportButton } from './components/SupportButton';
import { generateVideo } from './services/geminiService';
import { backendAvailable, createVideoJob, sseProgress, getJobStatus, listVideoHistory } from './services/backendService';
import { GenerationStatus } from './types';
import { WelcomeSplash } from './components/WelcomeSplash';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);
  const [jobProgress, setJobProgress] = useState<number>(0);
  const [stopStream, setStopStream] = useState<(() => void) | null>(null);

  type JobTracker = { id: string; status: string; progress: number; video_url?: string | null; created_at?: string; prompt?: string };
  const [activeJobs, setActiveJobs] = useState<JobTracker[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const pushLog = (m: string) => {
    const line = `${new Date().toLocaleTimeString()} ${m}`;
    // also emit to console for F12 visibility
    try { console.log('[APP]', line); } catch {}
    setLogs((prev) => [...prev.slice(-199), line]);
  };
  const [completedVideos, setCompletedVideos] = useState<{ id: string; url: string }[]>([]);

  const handleGenerate = useCallback(async (videoPrompt: string, imageBase64: string | null, aspectRatio: '16:9' | '9:16') => {
    // Check if API key is available
    const apiKey = localStorage.getItem('GEMINI_API_KEY') || (window as any).GEMINI_API_KEY;
    if (!apiKey) {
      setError('API key not found. Please set your Gemini API key in the header.');
      setStatus(GenerationStatus.ERROR);
      return;
    }
    
    setStatus(GenerationStatus.GENERATING);
    setError(null);
    setVideoUrl(null);
    setJobId(null);
    setJobStatus(null);
    setJobProgress(0);

    try {
      if (backendAvailable && imageBase64) {
        // Use backend slideshow video pipeline
        const dataUrl = `data:image/png;base64,${imageBase64}`;
        pushLog('[create] creating job...');
        const resp = await createVideoJob('guest', [dataUrl], 3, 30, aspectRatio);
        if (!resp.success || !resp.job) throw new Error(resp.error || 'Failed to create job');
        const jobId = resp.job.id;
        pushLog(`[create] job id=${jobId}`);
        setJobId(jobId);
        setJobStatus(resp.job.status || 'queued');
        setJobProgress(resp.job.progress || 0);
        setActiveJobs((prev) => [{ id: jobId, status: resp.job.status || 'queued', progress: resp.job.progress || 0, created_at: resp.job.created_at, prompt: videoPrompt }, ...prev]);
        // Listen progress via SSE and update UI
        let finalizingChecked = false;
        const stop = sseProgress(jobId, (data: any) => {
          const s = data?.status;
          const p = typeof data?.progress === 'number' ? data.progress : 0;
          pushLog(`[sse] ${jobId} status=${s} progress=${p}`);
          if (s) setJobStatus(s);
          setJobProgress(p);
          setActiveJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: s || j.status, progress: p } : j)));
          if (s === 'completed') {
            if (data?.video_url) setVideoUrl(data.video_url);
            if (data?.video_url) {
              setCompletedVideos((prev) => [{ id: jobId, url: data.video_url as string }, ...prev.filter(v => v.id !== jobId)]);
              pushLog(`[done] ${jobId} video ready`);
            }
            setActiveJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'completed', progress: 100, video_url: data?.video_url || j.video_url } : j)));
            setStatus(GenerationStatus.SUCCESS);
            stop();
            setStopStream(null);
          } else if ((s === 'finalizing' || s === 'finalise' || s === 'finalized') && p >= 100 && !finalizingChecked) {
            // Fallback: some backends report 'finalizing' at 100% without a terminal event
            finalizingChecked = true;
            (async () => {
              try {
                const st = await getJobStatus(jobId);
                const done = st?.status === 'completed' || st?.status === 'done' || st?.status === 'finished';
                if (done) {
                  if (st?.video_url) setVideoUrl(st.video_url);
                  if (st?.video_url) {
                    setCompletedVideos((prev) => [{ id: jobId, url: st.video_url as string }, ...prev.filter(v => v.id !== jobId)]);
                    pushLog(`[done] ${jobId} video ready (polled)`);
                  }
                  setActiveJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'completed', progress: 100, video_url: st?.video_url || j.video_url } : j)));
                  setStatus(GenerationStatus.SUCCESS);
                  stop();
                  setStopStream(null);
                } else {
                  finalizingChecked = false; // keep listening
                }
              } catch {
                finalizingChecked = false;
              }
            })();
          } else if (s === 'failed') {
            setError(data?.error || 'Job failed');
            setActiveJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'failed' } : j)));
            setStatus(GenerationStatus.ERROR);
            stop();
            setStopStream(null);
          }
        });
        setStopStream(() => stop);
      } else {
        // Fallback to Gemini video API
        pushLog('[direct] generating via Gemini video API');
        const url = await generateVideo(videoPrompt, imageBase64, aspectRatio);
        setVideoUrl(url);
        setCompletedVideos((prev) => [{ id: `direct-${Date.now()}`, url }, ...prev]);
        pushLog('[done] direct generated video ready');
        setStatus(GenerationStatus.SUCCESS);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Video generation failed: ${errorMessage}`);
      pushLog(`[error] ${errorMessage}`);
      setStatus(GenerationStatus.ERROR);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStatus(GenerationStatus.IDLE);
    setVideoUrl(null);
    setError(null);
    setJobId(null);
    setJobStatus(null);
    setJobProgress(0);
    if (stopStream) { try { stopStream(); } catch {} finally { setStopStream(null); } }
  }, []);

  const JobStatusPanel = () => {
    if (!backendAvailable || !jobId || !jobStatus) return null;
    const label = jobStatus === 'queued' ? 'Dalam Antrian' : jobStatus === 'processing' ? 'Memproses' : jobStatus;
    const pct = Math.max(0, Math.min(100, jobProgress || 0));
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-300">ID Job: <span className="text-gray-100 font-mono">{jobId}</span></div>
          <div className="text-sm">
            <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-200 border border-gray-600">{label}</span>
          </div>
        </div>
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Progres</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
        </div>
        {(jobStatus === 'queued' || jobStatus === 'processing') && (
          <div className="mt-3 text-xs text-gray-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span>Perkiraan waktu: 2–5 menit</span>
          </div>
        )}
      </div>
    );
  };

  const CompletedVideosPanel = () => {
    if (completedVideos.length === 0) return null;
    return (
      <div className="mt-6 rounded-lg border border-gray-700 bg-gray-800/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-200">Recent Videos</h3>
          <span className="text-sm text-gray-400">{completedVideos.length} items</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {completedVideos.map((v) => (
            <div key={v.id} className="border border-gray-700 rounded p-2 bg-black">
              <video src={v.url} controls className="w-full h-36 object-contain bg-black" />
              <div className="mt-1 text-xs text-gray-400 flex items-center justify-between">
                <span className="font-mono truncate">{v.id}</span>
                <a href={v.url} download className="text-indigo-400 hover:text-indigo-300">Download</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const MultiJobsPanel = () => {
    if (!backendAvailable || activeJobs.length === 0) return null;
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-200">Active/Recent Jobs</h3>
          <span className="text-sm text-gray-400">{activeJobs.length} items</span>
        </div>
        <div className="space-y-3">
          {activeJobs.map((j) => {
            const pct = Math.max(0, Math.min(100, j.progress || 0));
            const label = j.status === 'queued' ? 'Dalam Antrian' : j.status === 'processing' ? 'Memproses' : j.status;
            const totalSeg = 2;
            const currentSeg = j.status === 'completed' ? totalSeg : (pct >= 70 ? 2 : 1);
            return (
              <div key={j.id} className="border border-gray-700 rounded p-3 bg-gray-900/40">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-300">ID: <span className="font-mono text-gray-100">{j.id}</span></div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-200 border border-gray-600">{label}</div>
                    <div className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-200 border border-gray-700">Segmen {currentSeg}/{totalSeg}</div>
                  </div>
                </div>
                <details className="mb-2">
                  <summary className="cursor-pointer text-sm text-gray-300">Prompt segmen (lihat)</summary>
                  <div className="mt-2 text-sm text-gray-200 whitespace-pre-wrap">
                    {j.prompt || '—'}
                    <div className="mt-2 text-gray-300">— Segment {currentSeg}: {currentSeg === 1 ? 'Generating frames & motion' : (j.status === 'finalizing' || j.status === 'processing') ? 'Finalizing & optimizing' : j.status}</div>
                  </div>
                </details>
                {(j.status === 'queued' || j.status === 'processing' || j.status === 'finalizing') && (
                  <div className="mb-2 px-3 py-2 rounded bg-yellow-900/50 text-yellow-200 text-sm">Menghasilkan segmen… ⏳</div>
                )}
                <div className="flex items-center gap-2">
                  <div className="flex-1 w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-12 text-right text-xs text-gray-300">{pct}%</div>
                </div>
              </div>
            );
          })}
        </div>
        {logs.length > 0 && (
          <details className="mt-3 text-xs text-gray-400">
            <summary className="cursor-pointer text-gray-300">Developer Logs</summary>
            <div className="mt-2 max-h-40 overflow-auto font-mono whitespace-pre-wrap">
              {logs.slice(-200).map((l, i) => (<div key={i}>{l}</div>))}
            </div>
          </details>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (status) {
      case GenerationStatus.GENERATING:
        return backendAvailable ? null : <LoadingIndicator />;
      case GenerationStatus.SUCCESS:
        return videoUrl ? <VideoPlayer videoUrl={videoUrl} onReset={handleReset} /> : null;
      case GenerationStatus.ERROR:
        return (
          <div className="text-center p-8 bg-red-900/20 rounded-lg border border-red-500">
            <h3 className="text-xl font-bold text-red-400 mb-2">Generation Failed</h3>
            <p className="text-red-300">{error}</p>
            <button
              onClick={handleReset}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        );
      case GenerationStatus.IDLE:
      default:
        return <WelcomeSplash />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Header />

        <main className="mt-6">
          <div className="rounded-xl bg-gray-800/40 border border-[#2a2f3a] p-5">
            <PromptForm onSubmit={handleGenerate} isLoading={status === GenerationStatus.GENERATING} />
          </div>

          <div className="mt-6">
            {renderContent()}
            <MultiJobsPanel />
            <CompletedVideosPanel />
          </div>
        </main>
      </div>

      <SupportButton />
    </div>
  );
};

export default App;
