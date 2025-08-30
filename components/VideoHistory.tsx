import React, { useEffect, useState } from 'react';
import { listVideoHistory, backendAvailable } from '../services/backendService';

export const VideoHistory: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHist = async () => {
    if (!backendAvailable) return;
    setLoading(true);
    try {
      const res = await listVideoHistory('guest', 12);
      if (res?.success && res.items) setItems(res.items);
    } catch (e) { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchHist(); }, []);

  if (!backendAvailable) return null;

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-200">Video History</h3>
        <button onClick={fetchHist} className="px-3 py-1 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600" disabled={loading}>{loading ? 'Refreshing...' : 'Refresh'}</button>
      </div>
      {items.length === 0 ? (
        <div className="text-gray-400 text-sm">No video history yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {items.map((it) => (
            <a key={it.job_id} href={it.video_path ? it.video_path : '#'} target="_blank" rel="noopener noreferrer" className="block group border border-gray-700 rounded overflow-hidden">
              {it.preview_path ? (
                <img src={it.preview_path} className="w-full h-24 object-cover group-hover:opacity-90" />
              ) : (
                <div className="w-full h-24 bg-gray-700"></div>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

