import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

// ElevenLabs API Key - disimpan di environment variable
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_4b875ff0898ff68f5483cd0bf1547a339068f4a948c7e9a9';

// Initialize ElevenLabs client
const elevenlabs = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

// Voice IDs untuk berbagai bahasa dan aksen
const VOICE_OPTIONS = {
  'Indonesian Female': 'JBFqnCBsd6RMkjVDRZzb', // Voice yang mendukung Bahasa Indonesia
  'Indonesian Male': 'pNInz6obpgDQGcFmaJgB',   // Voice pria Indonesia
  'English Female': 'EXAVITQu4vr4xnSDxMaL',    // Voice wanita Inggris
  'English Male': 'VR6AewLTigWG4xSOukaG',      // Voice pria Inggris
  'Spanish Female': 'ErXwobaYiN019PkySvjV',    // Voice wanita Spanyol
  'Spanish Male': 'pNInz6obpgDQGcFmaJgB',      // Voice pria Spanyol (menggunakan ID yang berbeda)
};

export interface ElevenLabsAudioResult {
  base64Audio: string;
  mimeType: string;
  duration: number;
}

export const generateAudioWithElevenLabs = async (
  text: string, 
  voiceId: string = VOICE_OPTIONS['Indonesian Female']
): Promise<ElevenLabsAudioResult> => {
  const startTime = Date.now();
  try {
    console.log('🎤 [ElevenLabs] Starting audio generation...');
    console.log('📝 [ElevenLabs] Text length:', text.length, 'characters');
    console.log('🎭 [ElevenLabs] Voice ID:', voiceId);
    console.log('🔑 [ElevenLabs] API Key:', ELEVENLABS_API_KEY ? 'Set' : 'Not set');
    
    const apiCallStart = Date.now();
    console.log('📡 [ElevenLabs] Making API call...');
    
    const audio = await elevenlabs.textToSpeech.convert(
      voiceId,
      {
        text: text,
        modelId: 'eleven_multilingual_v2', // Model yang mendukung multi-bahasa
        outputFormat: 'mp3_44100_128',
        voiceSettings: {
          stability: 0.5,
          similarityBoost: 0.75,
          style: 0.0,
          useSpeakerBoost: true,
        },
      }
    );
    
    const apiCallEnd = Date.now();
    console.log('✅ [ElevenLabs] API call completed in', apiCallEnd - apiCallStart, 'ms');
    console.log('📦 [ElevenLabs] Audio response type:', typeof audio);
    console.log('📦 [ElevenLabs] Audio response:', audio);

        // Convert audio to base64 using different approach
    let base64Audio: string;
    const conversionStart = Date.now();
    console.log('🔄 [ElevenLabs] Starting audio conversion...');
    
    // Try to handle as ReadableStream first
    try {
      console.log('📖 [ElevenLabs] Attempting ReadableStream conversion...');
      const chunks: Uint8Array[] = [];
      const reader = (audio as any).getReader();
      
      let chunkCount = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        chunkCount++;
      }
      
      console.log('📦 [ElevenLabs] Received', chunkCount, 'chunks');
      
      // Combine all chunks
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      console.log('📏 [ElevenLabs] Total audio size:', totalLength, 'bytes');
      
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      
      console.log('🔧 [ElevenLabs] Converting to base64...');
      base64Audio = btoa(String.fromCharCode(...combined));
      console.log('✅ [ElevenLabs] ReadableStream conversion successful');
      
    } catch (error) {
      console.log('❌ [ElevenLabs] ReadableStream conversion failed:', error);
      // Fallback: try to handle as ArrayBuffer or Blob
      try {
        console.log('🔄 [ElevenLabs] Attempting fallback conversion...');
        let arrayBuffer: ArrayBuffer;
        
        if ((audio as any).arrayBuffer) {
          console.log('📦 [ElevenLabs] Handling as Blob...');
          arrayBuffer = await (audio as any).arrayBuffer();
        } else {
          console.log('📦 [ElevenLabs] Handling as ArrayBuffer...');
          arrayBuffer = audio as unknown as ArrayBuffer;
        }
        
        const uint8Array = new Uint8Array(arrayBuffer);
        console.log('📏 [ElevenLabs] Fallback audio size:', uint8Array.length, 'bytes');
        base64Audio = btoa(String.fromCharCode(...uint8Array));
        console.log('✅ [ElevenLabs] Fallback conversion successful');
      } catch (fallbackError) {
        console.error('❌ [ElevenLabs] All conversion methods failed:', fallbackError);
        throw new Error('Failed to convert audio to base64');
      }
    }
    
    const conversionEnd = Date.now();
    console.log('⏱️ [ElevenLabs] Audio conversion completed in', conversionEnd - conversionStart, 'ms');

    const endTime = Date.now();
    const totalTime = endTime - startTime;
    console.log('🎉 [ElevenLabs] Audio generation completed successfully!');
    console.log('⏱️ [ElevenLabs] Total time:', totalTime, 'ms');
    console.log('📊 [ElevenLabs] Base64 length:', base64Audio.length, 'characters');
    
    return {
      base64Audio,
      mimeType: 'audio/mpeg',
      duration: 0, // Duration not available from stream
    };
  } catch (error) {
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    console.error('❌ [ElevenLabs] TTS Error after', totalTime, 'ms:', error);
    console.error('🔍 [ElevenLabs] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    });
    throw new Error(`ElevenLabs TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getAvailableVoices = () => {
  return VOICE_OPTIONS;
};

export const getVoiceName = (voiceId: string): string => {
  for (const [name, id] of Object.entries(VOICE_OPTIONS)) {
    if (id === voiceId) {
      return name;
    }
  }
  return 'Unknown Voice';
};
