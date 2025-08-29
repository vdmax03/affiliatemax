import React, { useState, useEffect } from 'react';
import { SparklesIcon } from '../src/icons_fixed';

export const LoadingIndicator: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { name: 'Analyzing Image', description: 'AI sedang menganalisis gambar produk...' },
    { name: 'Generating Prompt', description: 'Membuat prompt video yang optimal...' },
    { name: 'Creating Video', description: 'Veo 2.0 sedang menghasilkan video...' },
    { name: 'Finalizing', description: 'Menyelesaikan dan mengoptimasi video...' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 2000);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(stepInterval);
          return steps.length - 1;
        }
        return prev + 1;
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  const tips = [
    'Gunakan gambar produk yang jelas dan berkualitas tinggi',
    'Prompt yang detail akan menghasilkan video yang lebih baik',
    'Proses ini memakan waktu 2–5 menit tergantung kompleksitas',
    'Video akan dioptimasi untuk platform sosial media'
  ];

  return (
    <div className="text-center space-y-8 p-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm max-w-2xl mx-auto shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-6">
          <SparklesIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-gray-100">Generating Your Video</h2>
          <SparklesIcon className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-300 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="mb-6">
          <div className="text-lg font-semibold text-indigo-400 mb-2">
            {steps[currentStep]?.name}
          </div>
          <div className="text-gray-300">
            {steps[currentStep]?.description}
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-700 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600 shadow-md">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Tips for Better Results</h3>
          <div className="space-y-2 text-sm text-gray-300">
            {tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-indigo-400">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estimated Time */}
        <div className="mt-6 text-sm text-gray-300">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Estimated time: 2-5 minutes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

