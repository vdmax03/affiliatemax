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

    try {
      if (backendAvailable && imageBase64) {
        // Use backend slideshow video pipeline
        const dataUrl = `data:image/png;base64,${imageBase64}`;
        const resp = await createVideoJob('guest', [dataUrl], 3, 30, aspectRatio);
        if (!resp.success || !resp.job) throw new Error(resp.error || 'Failed to create job');
        const jobId = resp.job.id;
        // Listen progress via SSE and fallback poll
        const stop = sseProgress(jobId, async () => {
          const st = await getJobStatus(jobId);
          if (st.success && st.job && st.job.status === 'completed') {
            stop();
            if (st.job.video_url) setVideoUrl(st.job.video_url);
            setStatus(GenerationStatus.SUCCESS);
          } else if (st.success && st.job && st.job.status === 'failed') {
            stop();
            throw new Error(st.job.error || 'Job failed');
          }
        });
      } else {
        // Fallback to Gemini video API
        const url = await generateVideo(videoPrompt, imageBase64, aspectRatio);
        setVideoUrl(url);
        setStatus(GenerationStatus.SUCCESS);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Video generation failed: ${errorMessage}`);
      setStatus(GenerationStatus.ERROR);
    }
  }, []);

  const handleReset = useCallback(() => {
    setStatus(GenerationStatus.IDLE);
    setVideoUrl(null);
    setError(null);
  }, []);

  const renderContent = () => {
    switch (status) {
      case GenerationStatus.GENERATING:
        return <LoadingIndicator />;
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
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Header />
        
        <main className="mt-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
            <PromptForm onSubmit={handleGenerate} isLoading={status === GenerationStatus.GENERATING} />
          </div>
          
          <div className="mt-8">
            {renderContent()}
          </div>
        </main>
      </div>
      
      <SupportButton />
    </div>
  );
};

export default App;
