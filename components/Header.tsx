import React, { useState, useEffect } from 'react';
import { CrownIcon } from './icons/CrownIcon';
import { GeminiIcon } from './icons/GeminiIcon';
import { FilmIcon } from './icons/FilmIcon';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const [showApiKeyManager, setShowApiKeyManager] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('GEMINI_API_KEY');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
      setIsSaved(true);
      (window as any).GEMINI_API_KEY = apiKey.trim();
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
    (window as any).GEMINI_API_KEY = '';
  };

  const isApiKeyValid = apiKey.trim().length > 0;

  return (
    <header className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FilmIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-2xl font-bold text-gray-100">Veo 2 Generator</h1>
          <div className="flex items-center gap-1">
            <GeminiIcon className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-400">Powered by Gemini</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isApiKeyValid ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm text-gray-400">
              {isApiKeyValid ? 'API Key Ready' : 'API Key Required'}
            </span>
          </div>

          <button
            onClick={() => setShowApiKeyManager(!showApiKeyManager)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
          >
            {showApiKeyManager ? 'Hide' : 'Manage API Key'}
          </button>

          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
            <CrownIcon className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white">PRO</span>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              🚪 Logout
            </button>
          )}
        </div>
      </div>

      {showApiKeyManager && (
        <div className="mt-6 p-4 bg-gray-700/50 border border-gray-600 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-200">API Key Management</h3>
            <button
              onClick={() => setShowApiKeyManager(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key..."
                  className="w-full p-3 pr-20 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-100"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-gray-300"
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {isSaved ? (
                  <>
                    <span className="text-green-300">✓</span>
                    Saved!
                  </>
                ) : (
                  <>
                    💾
                    Save to Local Storage
                  </>
                )}
              </button>

              <button
                onClick={handleClearApiKey}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                🗑️ Clear
              </button>

              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                🔑 Get API Key
              </a>
            </div>

            <div className="text-sm text-gray-400 space-y-2">
              <p><strong>Note:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>API key disimpan secara lokal di browser Anda</li>
                <li>Key tidak dikirim ke server kami</li>
                <li>Dapatkan API key gratis di Google AI Studio</li>
                <li>Key diperlukan untuk generate video dan gambar</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};