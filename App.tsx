
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptForm } from './components/PromptForm';
import { LoadingIndicator } from './components/LoadingIndicator';
import { VideoPlayer } from './components/VideoPlayer';
import { LoginForm } from './components/LoginForm';
import { SupportButton } from './components/SupportButton';
import { generateVideo } from './services/geminiService';
import { checkAuthStatus, authenticateUser, logout, checkRateLimit, recordLoginAttempt, getRemainingAttempts } from './services/authService';
import { GenerationStatus } from './types';
import { WelcomeSplash } from './components/WelcomeSplash';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
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
      const url = await generateVideo(videoPrompt, imageBase64, aspectRatio);
      setVideoUrl(url);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Video generation failed: ${errorMessage}`);
      setStatus(GenerationStatus.ERROR);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = checkAuthStatus();
      setIsAuthenticated(isAuth);
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = useCallback(async (password: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    
    // Check rate limit
    if (!checkRateLimit()) {
      const remainingAttempts = getRemainingAttempts();
      setLoginError(`Terlalu banyak percobaan login. Coba lagi dalam 15 menit.`);
      setIsLoggingIn(false);
      return;
    }
    
    // Simulate delay for security
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const result = authenticateUser(password);
    recordLoginAttempt(result.success);
    
    if (result.success) {
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      const remainingAttempts = getRemainingAttempts();
      setLoginError(`${result.message} Sisa percobaan: ${remainingAttempts}`);
    }
    
    setIsLoggingIn(false);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setIsAuthenticated(false);
    setStatus(GenerationStatus.IDLE);
    setVideoUrl(null);
    setError(null);
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

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <LoginForm 
        onLogin={handleLogin} 
        isLoading={isLoggingIn}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Header onLogout={handleLogout} />
        
        <main className="mt-8">
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl p-6 backdrop-blur-sm">
            <PromptForm onSubmit={handleGenerate} isLoading={status === GenerationStatus.GENERATING} />
          </div>
          
          <div className="mt-8">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Support Button - hanya tampil jika sudah login */}
      <SupportButton />
    </div>
  );
};

export default App;
