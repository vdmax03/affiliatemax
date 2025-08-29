import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { FilmIcon } from './icons/FilmIcon';
import { GeminiIcon } from './icons/GeminiIcon';

export const WelcomeSplash: React.FC = () => {
  return (
    <div className="text-center p-8">
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm max-w-4xl mx-auto shadow-2xl"> {/* Added shadow-2xl */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <FilmIcon className="w-12 h-12 text-indigo-400" />
          <h2 className="text-3xl font-bold text-gray-100">Welcome to Veo 2 Generator</h2>
          <SparklesIcon className="w-12 h-12 text-purple-400" />
        </div>
        
        <p className="text-lg text-gray-300 mb-8">
          Create stunning AI-powered videos from your product images using Google's latest Veo 2.0 technology.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 shadow-md"> {/* Added shadow-md */}
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📸</span>
            </div>
            <h3 className="font-semibold text-gray-200 mb-2">Upload Image</h3>
            <p className="text-sm text-gray-300">Upload your product photo to get started</p>
          </div>
          
          <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 shadow-md"> {/* Added shadow-md */}
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-200 mb-2">AI Generation</h3>
            <p className="text-sm text-gray-300">AI creates prompts and generates video</p>
          </div>
          
          <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600 shadow-md"> {/* Added shadow-md */}
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🎬</span>
            </div>
            <h3 className="font-semibold text-gray-200 mb-2">Download Video</h3>
            <p className="text-sm text-gray-300">Get your professional video ready for social media</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg p-6 border border-indigo-500/30 shadow-md"> {/* Added shadow-md */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <GeminiIcon className="w-6 h-6 text-green-400" />
            <span className="text-sm font-semibold text-gray-300">Powered by Google Gemini & Veo 2.0</span>
          </div>
          <p className="text-sm text-gray-300">
            State-of-the-art AI technology for creating high-quality, engaging product videos
          </p>
        </div>

        <div className="mt-8 text-sm text-gray-300">
          <p className="mb-2"><strong>Getting Started:</strong></p>
          <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
            <li>Set your Gemini API key in the header above</li>
            <li>Upload a product image below</li>
            <li>Customize the generated prompts</li>
            <li>Generate your video!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};