import React, { useState } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { StopIcon } from './icons/StopIcon';

interface VideoPlayerProps {
  videoUrl: string;
  onReset: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download video');
    }
  };

  const handleVideoError = () => {
    setError('Failed to load video. Please try again.');
  };

  return (
    <div className="text-center space-y-4">
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4 backdrop-blur-sm shadow-lg">
        <h2 className="text-xl font-bold text-gray-100 mb-3">Video Generated Successfully</h2>
        
        {error ? (
          <div className="text-red-400 bg-red-900/20 p-4 rounded-lg border border-red-500 shadow-md"> {/* Added shadow-md */}
            <p>{error}</p>
            <button
              onClick={onReset}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative max-w-md mx-auto">
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg shadow-lg"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={handleVideoError}
                poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239CA3AF' font-family='Arial' font-size='16'%3ELoading Video...%3C/text%3E%3C/svg%3E"
              />
              {isPlaying && (
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  Playing
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow"
              >
                <DownloadIcon className="w-5 h-5" />
                Download Video
              </button>
              
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-100 hover:bg-gray-600 font-semibold rounded-lg transition-colors shadow"
              >
                <StopIcon className="w-5 h-5" />
                Generate New Video
              </button>
            </div>
            
            <div className="text-sm text-gray-300 space-y-2">
              <p>ðŸ’¡ <strong>Tips:</strong></p>
              <ul className="text-left max-w-md mx-auto space-y-1">
                <li>â€¢ Video sudah dioptimasi untuk social media</li>
                <li>â€¢ Gunakan tombol download untuk menyimpan</li>
                <li>â€¢ Coba generate ulang dengan prompt berbeda</li>
                <li>â€¢ Share hasil ke tim untuk feedback</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
