import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadIcon, SparklesIcon, DownloadIcon, SoundWaveIcon, ExternalLinkIcon } from '../src/icons_fixed';
import { ImageUploadBox } from './ImageUploadBox';
import { PromptTutorial } from './PromptTutorial';
import { VideoHistory } from './VideoHistory';
import {
  generateAdNarrative,
  generateImageVariations,
  generateAvatar,
  generateLogo,
  generateVisualPrompt,
  generateSceneComposition,
  generateShopTheLookFlatLay,
  generateAudioFromText,
  generateImageFromText,
  generateImageToImage,
  generateClothingTransfer,
} from '../services/geminiService';
import {
  generateAudioWithElevenLabs,
  getAvailableVoices,
} from '../services/elevenlabsService';

interface PromptFormProps {
  onSubmit: (prompt: string, imageBase64: string | null, videoOutputAspectRatio: '16:9' | '9:16') => void;
  isLoading: boolean;
}

type Asset = {
    id: string;
    type: 'original' | 'variation' | 'avatar' | 'logo' | 'secondary_original' | 'combined_shop_the_look' | 'text_to_image' | 'image_to_image';
    preview: string;
    base64: string;
    label: string;
    role?: 'master' | 'secondary';
};

export const PromptForm: React.FC<PromptFormProps> = ({ onSubmit, isLoading }) => {
  const [generationMode, setGenerationMode] = useState<'textToImage' | 'imageToImage'>('textToImage');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoPromptVariations, setVideoPromptVariations] = useState<string[]>([]);
  const [audioScript, setAudioScript] = useState('');
  const [logoName, setLogoName] = useState('');
  const [textImagePrompt, setTextImagePrompt] = useState('');
  const [imageToImagePrompt, setImageToImagePrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  const [masterImageAssets, setMasterImageAssets] = useState<Asset[]>([]);
  const [secondaryImageAssets, setSecondaryImageAssets] = useState<Asset[]>([]);
  const [selectedMasterAssetId, setSelectedMasterAssetId] = useState<string | null>(null);
  const [selectedSecondaryAssetId, setSelectedSecondaryAssetId] = useState<string | null>(null);
  
  const [videoOutputAspectRatio, setVideoOutputAspectRatio] = useState<'16:9' | '9:16'>('9:16');
  const [imageOutputAspectRatio, setImageOutputAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('9:16');

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('JBFqnCBsd6RMkjVDRZzb');
  const [useElevenLabs, setUseElevenLabs] = useState(false);
  
  const masterFileInputRef = useRef<HTMLInputElement>(null);
  const secondaryFileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState({
      prompts: false,
      variations: false,
      avatar: false,
      logo: false,
      sceneComposition: false,
      shopTheLook: false,
      audio: false,
      textToImage: false,
      imageToImage: false,
  });
  const [error, setError] = useState<string | null>(null);

  const handleMasterImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64String = dataUrl.split(',')[1];
        const newAsset: Asset = { id: `master-original-${Date.now()}`, type: 'original', preview: dataUrl, base64: base64String, label: 'MASTER ORIGINAL', role: 'master' };
        
        setMasterImageAssets([newAsset]);
        setSelectedMasterAssetId(newAsset.id);
        setVideoPrompt('');
        setVideoPromptVariations([]);
        setAudioScript('');
        setAudioUrl(null);
        setError(null);
        // Auto fetch prompt suggestions from backend (tailored by image)
        fetchPromptSuggestions(base64String).catch(()=>{});
        // No automatic prompt/script generation here, user will click "Generate Prompts & Script"
      };
      reader.readAsDataURL(file);
    } else {
        setMasterImageAssets([]);
        setSelectedMasterAssetId(null);
        setVideoPrompt('');
        setVideoPromptVariations([]);
        setAudioScript('');
        setAudioUrl(null);
        setSuggestions([]);
    }
  }, []);

  const handleSecondaryImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64String = dataUrl.split(',')[1];
        const newAsset: Asset = { id: `secondary-original-${Date.now()}`, type: 'secondary_original', preview: dataUrl, base64: base64String, label: 'SECONDARY ORIGINAL', role: 'secondary' };
        
        setSecondaryImageAssets([newAsset]);
        setSelectedSecondaryAssetId(newAsset.id);
      };
      reader.readAsDataURL(file);
    } else {
        setSecondaryImageAssets([]);
        setSelectedSecondaryAssetId(null);
    }
  }, []);

  // Helpers
  const getBackendBase = () => {
    // Only use explicit env-configured backend; do not auto-fallback
    const envBase = (import.meta as any).env?.VITE_BACKEND_BASE || '';
    return envBase ? envBase.replace(/\/$/, '') : '';
  };

  const getApiKey = (): string => {
    const ls = localStorage.getItem('GEMINI_API_KEY');
    if (ls) return ls;
    const win = (window as any).GEMINI_API_KEY;
    return win || '';
  };

  const fetchPromptSuggestions = async (base64: string) => {
    setSuggestionsLoading(true);
    setSuggestions([]);
    try {
      const base = getBackendBase();
      if (!base) {
        // Backend not configured; skip suggestions silently
        return;
      }
      const resp = await fetch(`${base}/api/suggest_prompts.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: [{ mimeType: 'image/png', data: base64 }], api_key: getApiKey() })
      });
      const json = await resp.json();
      if (!resp.ok || !json.success) throw new Error(json.error || 'Failed to fetch');
      setSuggestions(Array.isArray(json.suggestions) ? json.suggestions : []);
    } catch (e) {
      console.warn('Suggestion fetch failed', e);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleGeneratePromptsAndScript = useCallback(async () => {
    const originalImage = masterImageAssets.find(a => a.type === 'original' && a.role === 'master');
    if (!originalImage) {
        setError("An uploaded master image is required to generate prompts and script.");
        return;
    }
    setIsGenerating(prev => ({ ...prev, prompts: true }));
    setError(null);
    try {
        const [visuals, narrative] = await Promise.all([
            generateVisualPrompt(originalImage.base64),
            generateAdNarrative(originalImage.base64)
        ]);
        setVideoPromptVariations(visuals);
        setVideoPrompt(visuals[0] || '');
        setAudioScript(narrative);
    } catch (err) {
        setError(`Could not generate prompts: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsGenerating(prev => ({ ...prev, prompts: false }));
    }
  }, [masterImageAssets, setVideoPromptVariations, setVideoPrompt, setAudioScript, setIsGenerating, setError]);


  const handleGenerateVariations = useCallback(async () => {
    const latestI2I = [...masterImageAssets].reverse().find(a => a.type === 'image_to_image' && a.role === 'master');
    const originalImage = masterImageAssets.find(a => a.type === 'original' && a.role === 'master');
    const source = latestI2I || originalImage;
    if (!source) {
        setError("An uploaded master image is required to generate variations.");
        return;
    }
    setIsGenerating(prev => ({ ...prev, variations: true }));
    setError(null);
    try {
        const results = await generateImageVariations(source.base64, imageOutputAspectRatio);
        const newAssets: Asset[] = results.map((r, i) => ({
            id: `variation-${Date.now()}-${i}`,
            type: 'variation',
            preview: r.dataUrl,
            base64: r.base64,
            label: r.style,
            role: 'master',
        }));
        setMasterImageAssets(prev => [...prev.filter(a => a.type !== 'variation'), ...newAssets]);
    } catch (err) {
        setError(`Image variation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsGenerating(prev => ({ ...prev, variations: false }));
    }
  }, [masterImageAssets, imageOutputAspectRatio, setMasterImageAssets, setIsGenerating, setError]);
  
  const handleGenerateSceneComposition = useCallback(async () => {
    const originalImage = masterImageAssets.find(a => a.type === 'original' && a.role === 'master');
    const logoImage = masterImageAssets.find(a => a.type === 'logo' && a.role === 'master');
    const avatarImage = masterImageAssets.find(a => a.type === 'avatar' && a.role === 'master');

    if (!originalImage || !logoImage || !avatarImage) {
        setError("Original master image, logo, and avatar are required to create a combined scene.");
        return;
    }
    setIsGenerating(prev => ({ ...prev, sceneComposition: true }));
    setError(null);
    try {
        const result = await generateSceneComposition(originalImage.base64, logoImage.base64, avatarImage.base64, imageOutputAspectRatio);
        const newAsset: Asset = {
            id: `scene-composition-${Date.now()}`,
            type: 'variation',
            preview: result.dataUrl,
            base64: result.base64,
            label: 'Combined Scene',
            role: 'master',
        };
        setMasterImageAssets(prev => [...prev, newAsset]);
    } catch (err) {
        setError(`Scene composition failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsGenerating(prev => ({ ...prev, sceneComposition: false }));
    }
  }, [masterImageAssets, imageOutputAspectRatio, setMasterImageAssets, setIsGenerating, setError]);

  const handleGenerateShopTheLook = useCallback(async () => {
    const masterOriginal = masterImageAssets.find(a => a.type === 'original' && a.role === 'master');
    const secondaryOriginal = secondaryImageAssets.find(a => a.type === 'secondary_original' && a.role === 'secondary');

    if (!masterOriginal || !secondaryOriginal) {
        setError("Both master and secondary product images are required to create a 'Shop-the-Look' flat lay.");
        return;
    }
    setIsGenerating(prev => ({ ...prev, shopTheLook: true }));
    setError(null);
    try {
        const result = await generateShopTheLookFlatLay(masterOriginal.base64, secondaryOriginal.base64, imageOutputAspectRatio);
        const newAsset: Asset = {
            id: `shop-the-look-${Date.now()}`,
            type: 'combined_shop_the_look',
            preview: result.dataUrl,
            base64: result.base64,
            label: 'Shop-the-Look',
            role: 'master',
        };
        setMasterImageAssets(prev => [...prev, newAsset]);
    } catch (err) {
        setError(`Shop-the-Look Flat Lay generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsGenerating(prev => ({ ...prev, shopTheLook: false }));
    }
  }, [masterImageAssets, secondaryImageAssets, imageOutputAspectRatio, setMasterImageAssets, setIsGenerating, setError]);

  const handleGenerateAvatar = useCallback(async () => {
    const originalImage = masterImageAssets.find(a => a.type === 'original' && a.role === 'master');
    if (!originalImage) {
      setError("An uploaded master image is required to generate an avatar.");
      return;
    }
    setIsGenerating(prev => ({ ...prev, avatar: true }));
    setError(null);
    try {
      const result = await generateAvatar(originalImage.base64);
      const newAsset: Asset = { id: `avatar-${Date.now()}`, type: 'avatar', preview: result.dataUrl, base64: result.base64, label: 'AVATAR', role: 'master' };
      setMasterImageAssets(prev => [...prev.filter(a => a.type !== 'avatar'), newAsset]);
    } catch (err) {
      setError(`Avatar generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(prev => ({ ...prev, avatar: false }));
    }
  }, [masterImageAssets, setMasterImageAssets, setIsGenerating, setError]);
  
  const handleGenerateLogo = useCallback(async () => {
    if (!logoName.trim()) {
      setError("A brand name is required to generate a logo.");
      return;
    }
    setIsGenerating(prev => ({ ...prev, logo: true }));
    setError(null);
    try {
      const result = await generateLogo(logoName);
      const newAsset: Asset = { id: `logo-${Date.now()}`, type: 'logo', preview: result.dataUrl, base64: result.base64, label: 'LOGO', role: 'master' };
      setMasterImageAssets(prev => [...prev.filter(a => a.type !== 'logo'), newAsset]);
    } catch (err) {
      setError(`Logo generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(prev => ({ ...prev, logo: false }));
    }
  }, [logoName, setMasterImageAssets, setIsGenerating, setError]);

  const handleGenerateAudio = useCallback(async () => {
    if (!audioScript.trim()) {
      setError("Audio script cannot be empty.");
      return;
    }
    setIsGenerating(prev => ({ ...prev, audio: true }));
    setError(null);
    setAudioUrl(null);

    try {
      let audioResult;
      if (useElevenLabs) {
        audioResult = await generateAudioWithElevenLabs(audioScript, selectedVoice);
      } else {
        audioResult = await generateAudioFromText(audioScript);
      }
      const url = URL.createObjectURL(new Blob([Uint8Array.from(atob(audioResult.base64Audio), c => c.charCodeAt(0))], { type: audioResult.mimeType }));
      setAudioUrl(url);
    } catch (err) {
      setError(`Audio generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(prev => ({ ...prev, audio: false }));
    }
  }, [audioScript, useElevenLabs, selectedVoice, setAudioUrl, setIsGenerating, setError]);

  const handleGenerateImageFromText = useCallback(async () => {
    if (!textImagePrompt.trim()) {
      setError("Text prompt cannot be empty.");
      return;
    }
    setIsGenerating(prev => ({ ...prev, textToImage: true }));
    setError(null);
    try {
        const result = await generateImageFromText(textImagePrompt, imageOutputAspectRatio);
        const newAsset: Asset = {
            id: `text-to-image-${Date.now()}`,
            type: 'text_to_image',
            preview: result.dataUrl,
            base64: result.base64,
            label: 'Text-to-Image',
            role: 'master',
        };
        setMasterImageAssets(prev => [...prev, newAsset]);
        setSelectedMasterAssetId(newAsset.id);
    } catch (err) {
        setError(`Text-to-Image generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsGenerating(prev => ({ ...prev, textToImage: false }));
    }
  }, [textImagePrompt, imageOutputAspectRatio, setMasterImageAssets, setSelectedMasterAssetId, setIsGenerating, setError]);

  const handleGenerateImageToImage = useCallback(async () => {
    const masterOriginal = masterImageAssets.find(a => a.type === 'original' && a.role === 'master');
    const secondaryOriginal = secondaryImageAssets.find(a => a.type === 'secondary_original' && a.role === 'secondary');
    if (!masterOriginal) {
        setError("An uploaded master image is required for Image to Image generation.");
        return;
    }
    if (!imageToImagePrompt.trim()) {
        setError("A text prompt is required for Image to Image generation.");
        return;
    }
    // Ensure API key is set in UI
    try {
      const key = localStorage.getItem('GEMINI_API_KEY') || (window as any).GEMINI_API_KEY || '';
      if (!key) {
        setError('Please set your Gemini API key from the header before generating.');
        return;
      }
    } catch {}
    setIsGenerating(prev => ({ ...prev, imageToImage: true }));
    setError(null);
    try {
        const result = secondaryOriginal
          ? await generateClothingTransfer(masterOriginal.base64, secondaryOriginal.base64, imageToImagePrompt, imageOutputAspectRatio)
          : await generateImageToImage(masterOriginal.base64, imageToImagePrompt, imageOutputAspectRatio);
        const newAsset: Asset = {
            id: `image-to-image-${Date.now()}`,
            type: 'image_to_image',
            preview: result.dataUrl,
            base64: result.base64,
            label: secondaryOriginal ? 'Clothing Transfer' : 'Image-to-Image',
            role: 'master',
        };
        setMasterImageAssets(prev => [...prev, newAsset]);
        setSelectedMasterAssetId(newAsset.id);
    } catch (err) {
        setError(`Image to Image generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
        setIsGenerating(prev => ({ ...prev, imageToImage: false }));
    }
  }, [masterImageAssets, imageToImagePrompt, imageOutputAspectRatio, setMasterImageAssets, setSelectedMasterAssetId, setIsGenerating, setError]);


  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    // Always prioritize video generation when the user clicks Generate Video.
    const selectedAsset = masterImageAssets.find(a => a.id === selectedMasterAssetId) || masterImageAssets.find(a => a.type === 'original' && a.role === 'master');
    // Derive video aspect ratio from Output Resolution selection.
    const ar: '16:9' | '9:16' = imageOutputAspectRatio === '9:16' ? '9:16' : '16:9';
    onSubmit(videoPrompt || '', selectedAsset?.base64 || null, ar);
  }, [videoPrompt, masterImageAssets, selectedMasterAssetId, onSubmit, imageOutputAspectRatio]);
  
  const allLoading = isLoading || Object.values(isGenerating).some(Boolean);
  const hasLogo = masterImageAssets.some(a => a.type === 'logo');
  const hasAvatar = masterImageAssets.some(a => a.type === 'avatar');
  const hasMasterOriginal = masterImageAssets.some(a => a.type === 'original' && a.role === 'master');
  const hasSecondaryOriginal = secondaryImageAssets.some(a => a.type === 'secondary_original' && a.role === 'secondary');
  const promptLabels = ["One-take", "Story Showcase", "Catalog Loop"];

  const selectedMasterAsset = masterImageAssets.find(a => a.id === selectedMasterAssetId);
  const masterImagePreview = masterImageAssets.find(a => a.type === 'original' && a.role === 'master')?.preview || null;
  const secondaryImagePreview = secondaryImageAssets.find(a => a.type === 'secondary_original' && a.role === 'secondary')?.preview || null;

  const allAssets = [...masterImageAssets, ...secondaryImageAssets];
  const otherAssets = allAssets.filter(asset => asset.id !== selectedMasterAssetId);


  const handleClearImageToImage = useCallback(() => {
    setImageToImagePrompt('');
    setError(null);
  }, [setImageToImagePrompt, setError]);

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left Column: Inputs and Controls */}
      <div className="lg:col-span-2 space-y-5">
        {/* Workspace Header (no stepper) */}
        <div className="rounded-xl bg-gray-800/40 border border-[#2a2f3a] p-3">
          <div className="text-sm text-gray-300">Creator Workspace · All tools visible</div>
        </div>
        <div className="text-center py-6">
          <h2 className="text-3xl font-extrabold tracking-widest text-gray-100">MODEL VIRTUAL</h2>
          <p className="text-sm text-gray-300 mt-1">Coba produk secara Virtual.</p>
        </div>
        {/* Generation Mode */}
        <div id="mode" className="rounded-xl bg-gray-800/40 border border-[#2a2f3a] p-4">
            <h3 className="text-lg font-semibold text-gray-200 mb-3">Generation Mode</h3>
            <div className="flex gap-2">
                <button 
                    type="button" 
                    onClick={() => setGenerationMode('textToImage')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${generationMode === 'textToImage' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-500 hover:text-white'}`}
                    disabled={allLoading}
                >
                    Text to Image
                </button>
                <button 
                    type="button" 
                    onClick={() => setGenerationMode('imageToImage')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${generationMode === 'imageToImage' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-500 hover:text-white'}`}
                    disabled={allLoading}
                >
                    Image to Image
                </button>
            </div>
        </div>

        {generationMode === 'imageToImage' && (
            <>
                {/* Image to Image Prompt */}
                <div id="i2i" className="rounded-xl bg-gray-800/40 border border-[#2a2f3a] p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-200">Image to Image Prompt</h3>
                    <textarea
                        id="image-to-image-prompt"
                        value={imageToImagePrompt}
                        onChange={(e) => setImageToImagePrompt(e.target.value)}
                        placeholder="Describe changes to the master image..."
                        className="w-full h-24 p-3 bg-gray-700/50 border border-[#333845] rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 text-gray-100"
                        disabled={allLoading || !hasMasterOriginal}
                    />
                    {/* Auto suggestions under I2I prompt */}
                    <div>
                        {suggestionsLoading ? (
                            <div className="text-gray-400 text-sm">Loading suggestions�</div>
                        ) : suggestions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((s, i) => (
                                    <button key={i} type="button" onClick={() => setImageToImagePrompt(s)} className="px-3 py-1 rounded-full text-xs bg-gray-700 hover:bg-gray-600 text-gray-200">{s}</button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-gray-500">Upload a master image to see smart prompt suggestions.</div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={handleGenerateImageToImage} disabled={allLoading || !hasMasterOriginal || !imageToImagePrompt.trim()} className="flex-grow flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 text-sm">
                            {isGenerating.imageToImage ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-4 h-4" />}
                            {isGenerating.imageToImage ? 'Generating...' : 'Generate Image from Master + Prompt'}
                        </button>
                        <button type="button" onClick={handleClearImageToImage} disabled={allLoading || !imageToImagePrompt.trim()} className="flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 text-sm">
                            Clear
                        </button>
                    </div>
                </div>

                {/* Upload Source Images */}
                    <div id="upload-images" className="rounded-xl bg-gray-800/40 border border-[#2a2f3a] p-4 space-y-4"> 
                    <h3 className="text-lg font-semibold text-gray-200">Upload Source Images</h3>
                    <ImageUploadBox label="Upload Produk" onFileChange={handleMasterImageChange} fileInputRef={masterFileInputRef} disabled={allLoading} currentImagePreview={masterImagePreview} />
                    <ImageUploadBox label="Upload Model"
                          onFileChange={handleSecondaryImageChange}
                          fileInputRef={secondaryFileInputRef}
                          disabled={allLoading}
                          currentImagePreview={secondaryImagePreview}
                       />
                    {/* Generate Ad Variations moved here */}
                    <div className="pt-2 space-y-3">
                      <h4 className="font-semibold text-gray-200">Generate Ad Variations</h4>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Resolution</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button type="button" aria-pressed={imageOutputAspectRatio==='1:1'} onClick={() => setImageOutputAspectRatio('1:1')} disabled={allLoading} className={`py-2 px-4 text-sm rounded-lg transition-colors ${imageOutputAspectRatio === '1:1' ? 'bg-purple-600 text-white ring-2 ring-amber-400' : 'bg-gray-700 text-white hover:bg-gray-500 hover:text-white'}`}>1:1</button>
                          <button type="button" aria-pressed={imageOutputAspectRatio==='16:9'} onClick={() => setImageOutputAspectRatio('16:9')} disabled={allLoading} className={`py-2 px-4 text-sm rounded-lg transition-colors ${imageOutputAspectRatio === '16:9' ? 'bg-purple-600 text-white ring-2 ring-amber-400' : 'bg-gray-700 text-white hover:bg-gray-500 hover:text-white'}`}>16:9</button>
                          <button type="button" aria-pressed={imageOutputAspectRatio==='9:16'} onClick={() => setImageOutputAspectRatio('9:16')} disabled={allLoading} className={`py-2 px-4 text-sm rounded-lg transition-colors ${imageOutputAspectRatio === '9:16' ? 'bg-purple-600 text-white ring-2 ring-amber-400' : 'bg-gray-700 text-white hover:bg-gray-500 hover:text-white'}`}>9:16</button>
                        </div>
                      </div>
                      <button type="button" onClick={handleGenerateVariations} disabled={allLoading} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg disabled:opacity-50 w-full justify-center">
                        {isGenerating.variations ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                        {isGenerating.variations ? 'Generating...' : 'Generate Variations'}
                      </button>
                      {masterImageAssets.filter(a => a.type === 'variation' && a.role === 'master').length > 0 && (
                        <div className="pt-2 border-t border-[#333845]/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-200">Variation Results</span>
                            <span className="text-xs text-gray-400">{masterImageAssets.filter(a => a.type==='variation' && a.role==='master').length} items</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-auto pr-1">
                            {masterImageAssets.filter(a => a.type === 'variation' && a.role === 'master').map((v) => (
                              <div key={v.id} className="relative group rounded overflow-hidden border border-[#333845] hover:border-indigo-500 cursor-pointer" onClick={() => setSelectedMasterAssetId(v.id)}>
                                <img src={v.preview} alt={v.label} className="w-full h-20 object-cover" />
                                <a href={v.preview} download={`variation-${v.label}.jpg`} className="absolute top-1 right-1 p-1 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Download image" onClick={(e)=>e.stopPropagation()}>
                                  <DownloadIcon className="w-4 h-4" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                </div>

                {/* Video Prompt & Audio Script */}
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
                        placeholder="Write your video prompt or generate one..."
                        className="w-full h-28 p-3 bg-gray-700/50 border border-[#333845] rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 text-gray-100"
                        required
                        disabled={allLoading}
                        />
                        {videoPromptVariations.length > 0 && (
                            <div className="mt-2 space-y-2">
                                <p className="text-xs text-gray-300">AI Prompt Suggestions:</p>
                                <div className="flex flex-wrap gap-2">
                                    {videoPromptVariations.map((prompt, index) => (
                                        <button
                                            type="button"
                                            key={index}
                                            onClick={() => setVideoPrompt(prompt)}
                                            disabled={allLoading}
                                            className={`px-3 py-1 text-xs rounded-full transition-colors disabled:opacity-50 ${videoPrompt === prompt ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-500 hover:text-white'}`}
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
                        placeholder="Write your audio script or generate one..."
                        className="w-full h-28 p-3 bg-gray-700/50 border border-[#333845] rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 text-gray-100"
                        disabled={allLoading}
                        />
                    </div>
                </div>
                
                {/* Generate Prompts & Script Button */}
                <button 
                    type="button" 
                    onClick={handleGeneratePromptsAndScript} 
                    disabled={allLoading || !hasMasterOriginal}
                    className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isGenerating.prompts ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Generating Prompts & Script...</>) : (<><SparklesIcon className="w-6 h-6" />Generate Prompts & Script</>)}
                </button>

                {/* Audio Generation Options */}
                <div className="rounded-xl bg-gray-800/40 border border-[#2a2f3a] p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-200">Audio Generation</h3>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                            <input
                            type="checkbox"
                            checked={useElevenLabs}
                            onChange={(e) => setUseElevenLabs(e.target.checked)}
                            className="rounded border-[#333845] bg-gray-700 text-indigo-600 focus:ring-indigo-500"
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
                                className="w-full p-3 bg-gray-700/50 border border-[#333845] rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-100"
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
                            <button type="button" onClick={handleGenerateAudio} disabled={allLoading || !audioScript} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white hover:bg-gray-500 hover:text-white rounded-lg disabled:opacity-50 transition-colors">
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

                {/* Generate Ad Variations & Creative Tools */}
                    {hasMasterOriginal && (
                    <div id="tools" className="grid md:grid-cols-1 gap-6">
                        <div className="p-4 bg-gray-700/30 rounded-lg space-y-4 border border-[#333845]">
                            <h3 className="font-semibold text-gray-200">Creative Tools</h3>
                            <div className="flex flex-wrap items-center gap-2">
                                <input type="text" value={logoName} onChange={(e) => setLogoName(e.target.value)} placeholder="Your Brand Name" className="flex-grow p-2 text-sm bg-gray-700/50 border border-[#333845] rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 text-gray-100" disabled={allLoading}/>
                                <button type="button" onClick={handleGenerateLogo} disabled={allLoading || !logoName} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-700 text-white hover:bg-gray-500 hover:text-white rounded-lg disabled:opacity-50 text-sm">
                                    {isGenerating.logo ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-4 h-4" />}
                                    {isGenerating.logo ? '...' : 'Generate Logo'}
                                </button>
                            </div>
                            <button type="button" onClick={handleGenerateAvatar} disabled={allLoading} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white hover:bg-gray-500 hover:text-white rounded-lg disabled:opacity-50">
                                {isGenerating.avatar ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                                {isGenerating.avatar ? 'Generating...' : 'Generate Avatar'}
                            </button>
                            {hasMasterOriginal && hasSecondaryOriginal && (
                                <div className="pt-4 mt-4 border-t border-[#333845]/50">
                                    <button type="button" onClick={handleGenerateShopTheLook} disabled={allLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg disabled:opacity-50">
                                        {isGenerating.shopTheLook ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                                        {isGenerating.shopTheLook ? 'Generating...' : 'Shop-the-Look Flat Lay'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </>
        )}

        {generationMode === 'textToImage' && (
          <>
                {/* Text to Image Prompt */}
                <div className="rounded-xl bg-gray-800/40 border border-[#2a2f3a] p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-200">Text to Image Prompt</h3>
                    <textarea
                        id="text-image-prompt"
                        value={textImagePrompt}
                        onChange={(e) => setTextImagePrompt(e.target.value)}
                        placeholder="Describe the image you want to generate..."
                        className="w-full h-32 p-3 bg-gray-700/50 border border-[#333845] rounded-lg focus:ring-2 focus:ring-indigo-500 placeholder-gray-300 text-gray-100"
                        required
                        disabled={allLoading}
                    />
                </div>
            </>
        )}

        {/* Step Controls (removed to keep all features visible) */}

        {/* Video Aspect Ratio section removed; video now follows Output Resolution */}

        {/* Output Resolution (Images) */}
        <div id="output" className="relative z-10 rounded-xl bg-gray-800/40 border border-[#2a2f3a] p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">Output Resolution</h3>
            <div className="grid grid-cols-3 gap-2">
                <button type="button" aria-pressed={imageOutputAspectRatio==='1:1'} onClick={() => setImageOutputAspectRatio('1:1')} disabled={allLoading} className={`py-2 px-4 rounded-lg text-sm transition-colors ${imageOutputAspectRatio === '1:1' ? 'bg-indigo-600 text-white ring-2 ring-amber-400' : 'bg-gray-700 text-white hover:bg-gray-500 hover:text-white'}`}>1:1 Square</button>
                <button type="button" aria-pressed={imageOutputAspectRatio==='16:9'} onClick={() => setImageOutputAspectRatio('16:9')} disabled={allLoading} className={`py-2 px-4 rounded-lg text-sm transition-colors ${imageOutputAspectRatio === '16:9' ? 'bg-indigo-600 text-white ring-2 ring-amber-400' : 'bg-gray-700 text-white hover:bg-gray-500 hover:text-white'}`}>16:9 Landscape</button>
                <button type="button" aria-pressed={imageOutputAspectRatio==='9:16'} onClick={() => setImageOutputAspectRatio('9:16')} disabled={allLoading} className={`py-2 px-4 rounded-lg text-sm transition-colors ${imageOutputAspectRatio === '9:16' ? 'bg-indigo-600 text-white ring-2 ring-amber-400' : 'bg-gray-700 text-white hover:bg-gray-500 hover:text-white'}`}>9:16 Portrait</button>
            </div>
        </div>
        
        {error && <div className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg">{error}</div>}

        {/* Generate Button */}
        <div id="generate" className="relative z-20 flex flex-col sm:flex-row gap-4 items-center"> 
            <button 
                type="submit" 
                disabled={Object.values(isGenerating).some(Boolean) || !videoPrompt.trim()}
                className="relative z-20 w-full flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
                {Object.values(isGenerating).some(Boolean) ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Working...
                  </>
                ) : isLoading ? (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    Generate Another
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    Generate Video
                  </>
                )}
            </button>
            <div className="flex-shrink-0 flex items-center gap-2">
                <a href="https://labs.google/fx/tools/flow" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-colors" title="Open in Flow">
                    <ExternalLinkIcon className="w-5 h-5" />
                </a>
                <a 
                    href={`https://gemini.google.com/?prompt=${encodeURIComponent(textImagePrompt)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`p-2 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white rounded-lg transition-colors ${
                        (generationMode === 'imageToVideo' && !videoPrompt) || 
                        (generationMode === 'textToImage' && !textImagePrompt) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Open prompt in Gemini"
                    onClick={(e) => ((generationMode === 'imageToVideo' && !videoPrompt) || 
                                    (generationMode === 'textToImage' && !textImagePrompt)) && e.preventDefault()}
                >
                    <ExternalLinkIcon className="w-5 h-5" />
                </a>
            </div>
        </div>
      </div>

      {/* Right Column: Generated Images & Recent Generations */}
      <div className="lg:col-span-1 space-y-5">
        {/* Generated Images (Selected Asset) */}
        <div className="rounded-xl bg-gray-800/40 border border-[#2a2f3a] p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">Generated Images</h3>
            <div className="w-full h-32 md:h-40 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {selectedMasterAsset ? (
                    <img src={selectedMasterAsset.preview} alt={selectedMasterAsset.label} className="w-full h-full object-contain" />
                ) : (
                    <div className="text-center text-gray-300">
                        <SparklesIcon className="w-12 h-12 mx-auto mb-2 text-indigo-400" />
                        <p>No images generated yet</p>
                        <p className="text-sm">Select an asset from below or generate new ones.</p>
                    </div>
                )}
            </div>
            {selectedMasterAsset && (
                <div className="text-center text-gray-300 text-sm">
                    <p className="font-semibold text-gray-200">{selectedMasterAsset.label}</p>
                    <a href={selectedMasterAsset.preview} download={`${selectedMasterAsset.type}-${selectedMasterAsset.label}.jpg`} className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 mt-1">
                        <DownloadIcon className="w-4 h-4" /> Download
                    </a>
                </div>
            )}
        </div>

        {/* Recent Generations (Asset Gallery) */}
        {(masterImageAssets.length > 0 || secondaryImageAssets.length > 0) && (
            <div className="rounded-xl bg-gray-800/40 border border-[#2a2f3a] p-4 space-y-4">
                <h3 className="text-lg font-semibold text-gray-200">Recent Generations</h3>
                <div className="max-h-96 overflow-y-auto pr-2">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {otherAssets.length === 0 && !selectedMasterAsset ? (
                            <div className="text-center text-gray-300 py-8">
                                <SparklesIcon className="w-10 h-10 mx-auto mb-2 text-indigo-400" />
                                <p>No generation history yet</p>
                                <p className="text-sm">Start creating to see your history here</p>
                            </div>
                        ) : (
                            otherAssets.map((asset) => (
                                <div key={asset.id} onClick={() => setSelectedMasterAssetId(asset.id)} className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 ${selectedMasterAssetId === asset.id ? 'border-indigo-500' : 'border-transparent'} w-24 h-24 flex-shrink-0`}>
                                    <img src={asset.preview} alt={asset.label} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/60 flex items-end justify-center p-1">
                                        <span className="text-xs font-bold text-white text-center leading-tight">{asset.label}</span>
                                    </div>
                                    <a href={asset.preview} download={`${asset.type}-${asset.label}.jpg`} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Download image" onClick={e=>e.stopPropagation()}>
                                        <DownloadIcon className="w-4 h-4"/>
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Backend Video History */}
        <VideoHistory />

        {/* Prompt Tutorial */}
        <PromptTutorial />
      </div>
    </form>
  );
};



