
import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { SoundWaveIcon } from './icons/SoundWaveIcon';
import { ExternalLinkIcon } from './icons/ExternalLinkIcon';
import {
  generateAdNarrative,
  generateImageVariations,
  generateAvatar,
  generateLogo,
  generateVisualPrompt,
  generateCombinedImage,
  generateAudioFromText,
} from '../services/geminiService';
import {
  generateAudioWithElevenLabs,
  getAvailableVoices,
  getVoiceName,
} from '../services/elevenlabsService';

interface PromptFormProps {
  // FIX: Removed apiKey from onSubmit signature as it's handled by the service.
  onSubmit: (prompt: string, imageBase64: string | null, aspectRatio: '16:9' | '9:16') => void;
  isLoading: boolean;
}

type Asset = {
    id: string;
    type: 'original' | 'variation' | 'avatar' | 'logo';
    preview: string;
    base64: string;
    label: string;
};

export const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
  // REMOVED: All state and logic for managing the API key has been removed from the component.
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoPromptVariations, setVideoPromptVariations] = useState<string[]>([]);
  const [audioScript, setAudioScript] = useState('');
  const [logoName, setLogoName] = useState('');
  
  const [imageAssets, setImageAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [variationAspectRatio, setVariationAspectRatio] = useState<'16:9' | '9:16'>('9:16');

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('JBFqnCBsd6RMkjVDRZzb'); // Default Indonesian Female
  const [useElevenLabs, setUseElevenLabs] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState({
      prompts: false,
      variations: false,
      avatar: false,
      logo: false,
      combination: false,
      audio: false,
  });
  const [error, setError] = useState<string | null>(null);

  // REMOVED: useEffect for loading API key from localStorage is no longer needed.

  const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64String = dataUrl.split(',')[1];
        const newAsset: Asset = { id: `original-${Date.now()}`, type: 'original', preview: dataUrl, base64: base64String, label: 'ORIGINAL' };
        
        setImageAssets([newAsset]);
        setSelectedAssetId(newAsset.id);
        setVideoPrompt('');
        setVideoPromptVariations([]);
        setAudioScript('');
        setAudioUrl(null);
        
        setIsGenerating(prev => ({ ...prev, prompts: true }));
        setError(null);
        // FIX: Removed apiKey from service calls.
        Promise.all([
            generateVisualPrompt(base64String),
            generateAdNarrative(base64String)
        ]).then(([visuals, narrative]) => {
            setVideoPromptVariations(visuals);
            setVideoPrompt(visuals[0] || '');
            setAudioScript(narrative);
        }).catch(err => setError(`Could not generate prompts: ${err.message}`))
        .finally(() => setIsGenerating(prev => ({ ...prev, prompts: false })));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerateVariations = async () => {
    const originalImage = imageAssets.find(a => a.type === 'original');
    if (!originalImage) {
        setError("An uploaded image is required to generate variations.");
        return;
    }
    setIsGenerating(prev => ({ ...prev, variations: true }));
    setError(null);
    try {
        // FIX: Removed apiKey from service call.
        const results = await generateImageVariations(originalImage.base64, variationAspectRatio);
        const newAssets: Asset[] = results.map((r, i) => ({
            id: `variation-${Date.now()}-${i}`,
            type: 'variation',
            preview: r.dataUrl,
            base64: r.base64,
            label: r.style,
        }));
        setImageAssets(prev => [...prev.filter(a => a.type !== 'variation'), ...newAssets]);
    } catch (err) {
        setError(`Image variation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsGenerating(prev => ({ ...prev, variations: false }));
    }
  };
  
  const handleGenerateCombined = async () => {
    const originalImage = imageAssets.find(a => a.type === 'original');
    const logoImage = imageAssets.find(a => a.type === 'logo');
    const avatarImage = imageAssets.find(a => a.type === 'avatar');

    if (!originalImage || !logoImage || !avatarImage) {
        setError("Original image, logo, and avatar are required to create a combined scene.");
        return;
    }
    setIsGenerating(prev => ({ ...prev, combination: true }));
    setError(null);
    try {
        // FIX: Removed apiKey from service call.
        const result = await generateCombinedImage(originalImage.base64, logoImage.base64, avatarImage.base64, variationAspectRatio);
        const newAsset: Asset = {
            id: `combined-${Date.now()}`,
            type: 'variation',
            preview: result.dataUrl,
            base64: result.base64,
            label: 'Combined Scene',
        };
        setImageAssets(prev => [...prev, newAsset]);
    } catch (err) {
        setError(`Combination failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsGenerating(prev => ({ ...prev, combination: false }));
    }
  };

  const handleGenerateAvatar = async () => {
    const originalImage = imageAssets.find(a => a.type === 'original');
    if (!originalImage) {
      setError("An uploaded image is required to generate an avatar.");
      return;
    }
    setIsGenerating(prev => ({ ...prev, avatar: true }));
    setError(null);
    try {
      // FIX: Removed apiKey from service call.
      const result = await generateAvatar(originalImage.base64);
      const newAsset: Asset = { id: `avatar-${Date.now()}`, type: 'avatar', preview: result.dataUrl, base64: result.base64, label: 'AVATAR' };
      setImageAssets(prev => [...prev.filter(a => a.type !== 'avatar'), newAsset]);
    } catch (err) {
      setError(`Avatar generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(prev => ({ ...prev, avatar: false }));
    }
  };
  
  const handleGenerateLogo = async () => {
    if (!logoName.trim()) {
      setError("A brand name is required to generate a logo.");
      return;
    }
    setIsGenerating(prev => ({ ...prev, logo: true }));
    setError(null);
    try {
      // FIX: Removed apiKey from service call.
      const result = await generateLogo(logoName);
      const newAsset: Asset = { id: `logo-${Date.now()}`, type: 'logo', preview: result.dataUrl, base64: result.base64, label: 'LOGO' };
      setImageAssets(prev => [...prev.filter(a => a.type !== 'logo'), newAsset]);
    } catch (err) {
      setError(`Logo generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(prev => ({ ...prev, logo: false }));
    }
  };

  const handleGenerateAudio = async () => {
    const startTime = Date.now();
    console.log('🎤 [PromptForm] Starting audio generation...');
    console.log('🔧 [PromptForm] Using ElevenLabs:', useElevenLabs);
    console.log('📝 [PromptForm] Script length:', audioScript.length, 'characters');
    
    if (!audioScript.trim()) {
      setError("Audio script is required to generate audio.");
      return;
    }
    
    setIsGenerating(prev => ({ ...prev, audio: true }));
    setError(null);
    setAudioUrl(null);
    
    try {
      let result;
      
      if (useElevenLabs) {
        console.log('🎭 [PromptForm] Using ElevenLabs TTS with voice:', selectedVoice);
        // Use ElevenLabs TTS
        result = await generateAudioWithElevenLabs(audioScript, selectedVoice);
        const url = `data:${result.mimeType};base64,${result.base64Audio}`;
        setAudioUrl(url);
        console.log('✅ [PromptForm] ElevenLabs audio generated successfully');
      } else {
        console.log('🎭 [PromptForm] Using Gemini TTS');
        // Use Gemini TTS (fallback)
        const { base64Audio, mimeType } = await generateAudioFromText(audioScript);
        const url = `data:${mimeType};base64,${base64Audio}`;
        setAudioUrl(url);
        console.log('✅ [PromptForm] Gemini audio generated successfully');
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      console.log('🎉 [PromptForm] Audio generation completed in', totalTime, 'ms');
      
    } catch (err) {
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      console.error('❌ [PromptForm] Audio generation failed after', totalTime, 'ms:', err);
      setError(`Audio generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(prev => ({ ...prev, audio: false }));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (videoPrompt.trim() && !isLoading) {
      const selectedAsset = imageAssets.find(a => a.id === selectedAssetId);
      // FIX: Removed apiKey from onSubmit call.
      onSubmit(videoPrompt, selectedAsset?.base64 || null, aspectRatio);
    }
  };
  
  const allLoading = isLoading || Object.values(isGenerating).some(Boolean);
  const hasLogo = imageAssets.some(a => a.type === 'logo');
  const hasAvatar = imageAssets.some(a => a.type === 'avatar');
  const promptLabels = ["One-take", "Story Showcase", "Catalog Loop"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* REMOVED: API Key input field and related UI have been removed to improve security. */}
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300">
                Video Prompt
                </label>
                {isGenerating.prompts && (
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-indigo-400">Generating...</span>
                  </div>
                )}
            </div>
            <textarea
              id="video-prompt"
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
              placeholder="Upload an image to automatically generate a video prompt..."
              className="w-full h-28 p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
              disabled={allLoading}
            />
            {videoPromptVariations.length > 0 && (
                <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-400">AI Prompt Suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                        {videoPromptVariations.map((prompt, index) => (
                            <button
                                type="button"
                                key={index}
                                onClick={() => setVideoPrompt(prompt)}
                                disabled={allLoading}
                                className={`px-3 py-1 text-xs rounded-full transition-colors disabled:opacity-50 ${videoPrompt === prompt ? 'bg-indigo-600 text-white' : 'bg-gray-600/70 hover:bg-gray-600'}`}
                            >
                                {promptLabels[index] || `Suggestion ${index + 1}`}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        <div>
            <div className="flex items-center gap-2 mb-2">
                <label htmlFor="audio-script" className="block text-sm font-medium text-gray-300">
                Audio Script
                </label>
                 {isGenerating.prompts && (
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-indigo-400">Generating...</span>
                  </div>
                )}
            </div>
            <textarea
              id="audio-script"
              value={audioScript}
              onChange={(e) => setAudioScript(e.target.value)}
              placeholder="...and a promotional script."
              className="w-full h-28 p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500"
              disabled={allLoading}
            />
        </div>
      </div>
      
       {/* Audio Generation Options */}
       <div className="space-y-4">
         <div className="flex items-center gap-4">
           <label className="flex items-center gap-2 text-sm text-gray-300">
             <input
               type="checkbox"
               checked={useElevenLabs}
               onChange={(e) => setUseElevenLabs(e.target.checked)}
               className="rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
             />
             Use ElevenLabs TTS (Better Quality)
           </label>
         </div>

         {useElevenLabs && (
           <div className="grid md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-300 mb-2">
                 Voice Selection
               </label>
               <select
                 value={selectedVoice}
                 onChange={(e) => setSelectedVoice(e.target.value)}
                 className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-100"
               >
                 {Object.entries(getAvailableVoices()).map(([name, id]) => (
                   <option key={id} value={id}>
                     {name}
                   </option>
                 ))}
               </select>
             </div>
             <div className="flex items-end">
               <button type="button" onClick={handleGenerateAudio} disabled={allLoading || !audioScript} className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors">
                 {isGenerating.audio ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SoundWaveIcon className="w-5 h-5" />}
                 {isGenerating.audio ? 'Generating Voiceover...' : 'Generate Audio'}
               </button>
             </div>
           </div>
         )}

         {!useElevenLabs && (
           <div className="space-y-3">
             <button type="button" onClick={handleGenerateAudio} disabled={allLoading || !audioScript} className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg disabled:opacity-50 transition-colors">
               {isGenerating.audio ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SoundWaveIcon className="w-5 h-5" />}
               {isGenerating.audio ? 'Generating Voiceover...' : 'Generate Audio (Gemini TTS)'}
             </button>
           </div>
         )}

         {audioUrl && (
           <div className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
               <audio controls src={audioUrl} className="w-full"></audio>
               <a href={audioUrl} download="generated-voiceover.mp3" className="flex-shrink-0 p-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white" aria-label="Download Audio">
                   <DownloadIcon className="w-5 h-5"/>
               </a>
           </div>
         )}
       </div>

      <div>
        <input type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="hidden" ref={fileInputRef} disabled={allLoading} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={allLoading} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50">
          <UploadIcon className="w-5 h-5" />
          {imageAssets.length > 0 ? 'Change Base Image' : 'Upload Product Image'}
        </button>
      </div>

       {imageAssets.length > 0 && (
            <div className="p-4 bg-gray-700/30 rounded-lg space-y-4 border border-gray-600">
                <h3 className="font-semibold text-gray-200">Asset Gallery</h3>
                <p className="text-sm text-gray-400">Select an asset to use for video generation.</p>
                <div className="overflow-y-auto pr-2">
                    <div className="flex flex-wrap gap-3">
                        {imageAssets.map((asset) => (
                            <div key={asset.id} onClick={() => setSelectedAssetId(asset.id)} className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 ${selectedAssetId === asset.id ? 'border-indigo-500' : 'border-transparent'} w-24 h-24 flex-shrink-0`}>
                                 <img src={asset.preview} alt={asset.label} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                 <div className="absolute inset-0 bg-black/60 flex items-end justify-center p-1">
                                    <span className="text-xs font-bold text-white text-center leading-tight">{asset.label}</span>
                                 </div>
                                 <a href={asset.preview} download={`${asset.type}-${asset.label}.jpg`} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Download image" onClick={e=>e.stopPropagation()}>
                                    <DownloadIcon className="w-4 h-4"/>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="pt-3 mt-3 border-t border-gray-600/50 text-center">
                     <a href="https://aifaceswap.io/" target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center gap-1">
                        Experiment with FaceSwap <ExternalLinkIcon className="w-4 h-4" />
                     </a>
                </div>
            </div>
       )}

      {imageAssets.some(a => a.type === 'original') && (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-700/30 rounded-lg space-y-4 border border-gray-600">
                <h3 className="font-semibold text-gray-200">Generate Ad Variations</h3>
                <div className="space-y-2">
                    <label className="text-sm text-gray-400 block">Resolution</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setVariationAspectRatio('16:9')} disabled={allLoading} className={`py-2 px-4 text-sm rounded-lg transition-colors ${variationAspectRatio === '16:9' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>16:9</button>
                        <button type="button" onClick={() => setVariationAspectRatio('9:16')} disabled={allLoading} className={`py-2 px-4 text-sm rounded-lg transition-colors ${variationAspectRatio === '9:16' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>9:16</button>
                    </div>
                </div>
                <button type="button" onClick={handleGenerateVariations} disabled={allLoading} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 w-full justify-center">
                    {isGenerating.variations ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                    {isGenerating.variations ? 'Generating...' : 'Generate Variations'}
                </button>
                {hasLogo && hasAvatar && (
                    <div className="pt-4 mt-4 border-t border-gray-600/50">
                        <button type="button" onClick={handleGenerateCombined} disabled={allLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg disabled:opacity-50">
                            {isGenerating.combination ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                            {isGenerating.combination ? 'Combining...' : 'Combine with Logo & Avatar'}
                        </button>
                    </div>
                )}
            </div>
            <div className="p-4 bg-gray-700/30 rounded-lg space-y-4 border border-gray-600">
                <h3 className="font-semibold text-gray-200">Creative Tools</h3>
                 <div className="flex flex-wrap items-center gap-2">
                    <input type="text" value={logoName} onChange={(e) => setLogoName(e.target.value)} placeholder="Your Brand Name" className="flex-grow p-2 text-sm bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500" disabled={allLoading}/>
                    <button type="button" onClick={handleGenerateLogo} disabled={allLoading || !logoName} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg disabled:opacity-50 text-sm">
                        {isGenerating.logo ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-4 h-4" />}
                        {isGenerating.logo ? '...' : 'Generate Logo'}
                    </button>
                 </div>
                                     <button type="button" onClick={handleGenerateAvatar} disabled={allLoading} className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg disabled:opacity-50">
                    {isGenerating.avatar ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                    {isGenerating.avatar ? 'Generating...' : 'Generate Avatar'}
                 </button>
            </div>
        </div>
      )}

    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Final Video Resolution</label>
        <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setAspectRatio('16:9')} disabled={allLoading} className={`py-2 px-4 rounded-lg transition-colors ${aspectRatio === '16:9' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>16:9 Landscape</button>
            <button type="button" onClick={() => setAspectRatio('9:16')} disabled={allLoading} className={`py-2 px-4 rounded-lg transition-colors ${aspectRatio === '9:16' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>9:16 Portrait</button>
        </div>
    </div>
    
      {error && <div className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <button type="submit" disabled={allLoading || !videoPrompt || !selectedAssetId} className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
            {isLoading ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Generating...</>) : (<><SparklesIcon className="w-6 h-6" />Generate Video</>)}
        </button>
        <div className="flex-shrink-0 flex items-center gap-2">
            <a href="https://labs.google/fx/tools/flow" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-gray-300" title="Open in Flow">
                <ExternalLinkIcon className="w-5 h-5" />
            </a>
             <a 
                href={`https://gemini.google.com/?prompt=${encodeURIComponent(videoPrompt)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-gray-300 ${!videoPrompt ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Open prompt in Gemini"
                onClick={(e) => !videoPrompt && e.preventDefault()}
             >
                <ExternalLinkIcon className="w-5 h-5" />
            </a>
        </div>
      </div>

    </form>
  );
};
