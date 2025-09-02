import { GoogleGenAI, Type } from "@google/genai";

// Lightweight console logger visible di F12
const geminiShouldLog = () => {
  try { return (localStorage.getItem('API_DEBUG') ?? '1') !== '0'; } catch { return true; }
};
const glog = (...args: any[]) => { if (geminiShouldLog()) { try { console.log('[GEMINI]', ...args); } catch {} } };

// FIX: Get API key from localStorage or window object for dynamic API key management
const getApiKey = (): string => {
  // Try localStorage first
  const localApiKey = localStorage.getItem('GEMINI_API_KEY');
  if (localApiKey) {
    return localApiKey;
  }
  
  // Fallback to window object (for session-based changes)
  const windowApiKey = (window as any).GEMINI_API_KEY;
  if (windowApiKey) {
    return windowApiKey;
  }
  
  // Fallback to environment variable
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

// FIX: Initialize the AI client dynamically to support API key changes
const getAiClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API key not found. Please set your Gemini API key in the header.');
  }
  return new GoogleGenAI({ apiKey });
};

const pollOperation = async (operation: any): Promise<any> => {
  let currentOperation = operation;
  while (!currentOperation.done) {
    console.log('Polling for video generation status...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    try {
        const ai = getAiClient();
        currentOperation = await ai.operations.getVideosOperation({ operation: currentOperation });
    } catch (e) {
        console.error("Polling failed:", e);
    }
  }
  return currentOperation;
};

// Helper to describe an image concisely
const describeImageConcise = async (imageBase64: string): Promise<string> => {
    const ai = getAiClient();
    const imagePart = { inlineData: { mimeType: 'image/png', data: imageBase64 } };
    const prompt = "Describe the main product in this image concisely, in Indonesian. For example: 'sepasang sepatu kets putih' or 'sebotol serum perawatan kulit berwarna pink'.";
    glog('describeImageConcise → gemini-2.5-flash');
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Use gemini-2.5-flash for text analysis
        contents: { parts: [imagePart, { text: prompt }] },
    });
    glog('describeImageConcise ← ok');
    return response.text.trim();
};

// Helper: coba beberapa model image jika model utama error (mis. 500)
const IMAGE_MODELS = [
  'gemini-2.5-flash-image-preview',
  // Fallbacks (nama bisa berbeda di region/akun). Coba yang cepat dulu.
  'imagen-3.0-fast-generate-001',
  'imagen-3.0-generate-001',
];

async function generateImageFromParts(parts: any[]): Promise<{ mimeType: string; data: string }> {
  const ai = getAiClient();
  let lastErr: any = null;
  for (const model of IMAGE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        glog('image.gen →', model, 'try', attempt);
        const r = await ai.models.generateContent({ model, contents: [{ role: 'user', parts }] });
        const generatedImagePart = r.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inlineData && p.inlineData.mimeType?.startsWith('image/')
        );
        if (generatedImagePart?.inlineData?.data) {
          glog('image.gen ←', model, 'ok');
          return { mimeType: generatedImagePart.inlineData.mimeType, data: generatedImagePart.inlineData.data };
        }
        // Jika tidak ada image tapi ada teks alasan
        const finish = (r as any)?.candidates?.[0]?.finishReason;
        const text = (r as any)?.text;
        throw new Error(`No image in response. finish=${finish || 'unknown'} text=${text || ''}`);
      } catch (e: any) {
        lastErr = e;
        const msg = e?.message || String(e);
        glog('image.gen ✖', model, 'try', attempt, msg);
        // backoff ringan hanya untuk 5xx
        if ((msg.includes('500') || msg.includes('Internal') || msg.includes('unavailable')) && attempt < 2) {
          await new Promise(res => setTimeout(res, 800 * attempt));
          continue;
        }
        break;
      }
    }
  }
  throw lastErr || new Error('Image generation failed (no model succeeded)');
}

export const generateVisualPrompt = async (imageBase64: string): Promise<string[]> => {
    try {
        const ai = getAiClient();
        const imagePart = { inlineData: { mimeType: 'image/png', data: imageBase64 } };
        const textPart = { text: `Analisis gambar produk ini. Buat 3 prompt video yang sangat kreatif dan detail untuk model AI image-to-video, dalam format JSON. Setiap prompt harus memiliki gaya yang berbeda, berdasarkan contoh-contoh ini:
1.  **One-take elegan (±10 detik, 9:16):** Fokus pada satu gerakan kamera sinematik yang mulus (dolly in, pan, orbit) untuk menyoroti produk dalam suasana high-fashion dan minimalis. Jelaskan pencahayaan, gerakan kain jika ada, dan mood secara detail.
2.  **Story showcase 3 adegan (±20 detik, 9:16):** Rancang sebuah cerita mini dalam tiga adegan pendek. Mulai dengan close-up detail, lanjutkan dengan wide shot yang menunjukkan konteks, dan akhiri dengan medium shot yang menampilkan interaksi atau emosi.
3.  **Loop katalog (5–7 detik, seamless loop):** Buat prompt untuk video loop pendek yang mulus. Fokus pada gerakan subtil (kain berkibar, rotasi produk lambat, pendulum pan kamera) yang dapat diulang tanpa cela, cocok untuk tampilan katalog digital.
Pastikan semua prompt meminta kualitas 4K, photorealistic, dan tidak ada teks di layar. Output harus dalam Bahasa Indonesia.` };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        prompts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: "Satu prompt video yang detail."
                            }
                        }
                    }
                }
            }
        });

        try {
            const jsonResponse = JSON.parse(response.text);
            if (jsonResponse.prompts && Array.isArray(jsonResponse.prompts) && jsonResponse.prompts.length > 0) {
                return jsonResponse.prompts;
            }
        } catch (e) {
            console.error("Failed to parse JSON from visual prompt generation:", response.text);
            // Fallback: return the raw text split by newlines if parsing fails
            return response.text.split('\n').filter(p => p.trim().length > 20);
        }
    } catch (error) {
        console.error("Gemini API Error for visual prompt:", error);
        // Return fallback prompts if API fails
        return [
            "A cinematic, slow-motion shot of the product with elegant lighting and professional photography.",
            "A dynamic, multi-angle view of the product in a lifestyle setting with natural lighting.",
            "A close-up, detailed loop showing the product's texture and quality with subtle camera movement."
        ];
    }
    
    // Return a default array if everything fails
    return ["A cinematic, slow-motion shot of the product with elegant lighting.", "A dynamic, multi-angle view of the product in a lifestyle setting.", "A close-up, detailed loop showing the product's texture."];
}

export const generateAdNarrative = async (imageBase64: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const imagePart = {
            inlineData: {
                mimeType: 'image/png',
                data: imageBase64,
            },
        };
        const textPart = {
            text: `Analisis gambar produk ini. Buat sebuah naskah voiceover iklan yang sangat engaging dan persuasif untuk media sosial (TikTok/Reels) dalam Bahasa Indonesia. Naskah harus terasa alami, modern, dan langsung berbicara kepada audiens.

Gunakan contoh sempurna di bawah ini sebagai panduan utama untuk gaya, nada, dan struktur. Hasil akhir HARUS semirip mungkin dengan contoh ini dalam hal gaya penulisan dan persuasi:

---
**CONTOH SEMPURNA:**
"Buat kamu yang mendambakan tampilan anggun, modern, tapi tetap syar'i dan super nyaman
Ini dia set Gamis Nadira yang akan jadi *must-have item* kamu!
Atasan tunik asimetris yang panjang dan flowy ini 🌸 bukan cuma bikin kamu terlihat anggun dan memukau, tapi juga super nyaman dan menutupi aurat dengan sempurna.
Dipadukan dengan rok plisket premium sepanjang mata kaki 💫 yang super stylish, sedang tren, dan pastinya bebas gerak seharian.
Warnanya dusty pink yang kalem dan mewah, cocok untuk berbagai acara! 👗
'Jangan sampai kehabisan koleksi limited edition ini! ✨ Langsung cek keranjang kuning sekarang dan tampil stunning di setiap kesempatan!'"
---

Tugasmu adalah membuat naskah baru untuk produk di gambar, dengan mengikuti format dan gaya bahasa dari contoh di atas. Pastikan ada hook, penjelasan manfaat dengan emoji, dan call-to-action yang kuat.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API Error for ad narrative:", error);
        // Return fallback script if API fails
        return "Produk berkualitas tinggi yang akan membuat Anda terlihat menakjubkan! Dapatkan sekarang dan rasakan perbedaannya. Jangan sampai kehabisan koleksi limited edition ini! ✨ Langsung cek keranjang kuning sekarang dan tampil stunning di setiap kesempatan!";
    }
};

export const generateAudioFromText = async (text: string): Promise<{ base64Audio: string, mimeType: string }> => {
    const startTime = Date.now();
    try {
        console.log('🎤 [Gemini TTS] Starting audio generation...');
        console.log('📝 [Gemini TTS] Text length:', text.length, 'characters');
        console.log('🔑 [Gemini TTS] API Key available:', !!getApiKey());
        
        const ai = getAiClient();
        const apiCallStart = Date.now();
        console.log('📡 [Gemini TTS] Making API call...');
        
        const stream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{
                role: 'user',
                parts: [{ text }],
            }],
            config: {
                temperature: 1,
                responseModalities: ['audio'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: 'Zephyr',
                        },
                    },
                },
            },
        });
        
        const apiCallEnd = Date.now();
        console.log('✅ [Gemini TTS] API call completed in', apiCallEnd - apiCallStart, 'ms');

        const audioChunks: Uint8Array[] = [];
        let mimeType: string | null = null;
        let chunkCount = 0;

        console.log('📖 [Gemini TTS] Processing stream chunks...');
        const streamStart = Date.now();
        
        for await (const chunk of stream) {
            chunkCount++;
            const audioPart = chunk.candidates?.[0]?.content?.parts?.find(
                (p) => p.inlineData && p.inlineData.mimeType.startsWith('audio/')
            );

            if (audioPart?.inlineData) {
                if (!mimeType) {
                    mimeType = audioPart.inlineData.mimeType;
                    console.log('🎵 [Gemini TTS] Audio MIME type:', mimeType);
                }
                // Decode base64 to binary
                const binaryString = atob(audioPart.inlineData.data);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                audioChunks.push(bytes);
            } else if (chunk.text && chunk.text.trim()) {
                console.error('❌ [Gemini TTS] Stream returned a text error:', chunk.text);
                throw new Error(`Audio generation failed: ${chunk.text}`);
            }
        }
        
        const streamEnd = Date.now();
        console.log('📦 [Gemini TTS] Processed', chunkCount, 'chunks in', streamEnd - streamStart, 'ms');
        console.log('🎵 [Gemini TTS] Collected', audioChunks.length, 'audio chunks');

        if (audioChunks.length === 0 || !mimeType) {
            console.error('❌ [Gemini TTS] No audio data received');
            throw new Error('Audio generation failed: No audio data was received from the API.');
        }

        console.log('🔧 [Gemini TTS] Combining audio chunks...');
        const combineStart = Date.now();
        
        // Concatenate all binary chunks
        const totalLength = audioChunks.reduce((acc, val) => acc + val.length, 0);
        console.log('📏 [Gemini TTS] Total audio size:', totalLength, 'bytes');
        
        const combined = new Uint8Array(totalLength);
        let offset = 0;
        for (const arr of audioChunks) {
            combined.set(arr, offset);
            offset += arr.length;
        }

        // Re-encode the combined binary data to base64
        console.log('🔧 [Gemini TTS] Converting to base64...');
        let binaryStringForBtoa = '';
        // Avoid using String.fromCharCode.apply with large arrays to prevent stack errors
        for (let i = 0; i < combined.byteLength; i++) {
            binaryStringForBtoa += String.fromCharCode(combined[i]);
        }
        const base64Audio = btoa(binaryStringForBtoa);
        
        const combineEnd = Date.now();
        console.log('✅ [Gemini TTS] Audio combination completed in', combineEnd - combineStart, 'ms');
        console.log('📊 [Gemini TTS] Base64 length:', base64Audio.length, 'characters');
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        console.log('🎉 [Gemini TTS] Audio generation completed successfully!');
        console.log('⏱️ [Gemini TTS] Total time:', totalTime, 'ms');
        
        return { base64Audio, mimeType };
    } catch (error) {
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        console.error('❌ [Gemini TTS] TTS Error after', totalTime, 'ms:', error);
        console.error('🔍 [Gemini TTS] Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            type: typeof error
        });
        throw new Error(`Gemini TTS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};


export const generateImageVariations = async (imageBase64: string, aspectRatio: '1:1' | '16:9' | '9:16'): Promise<{ style: string, base64: string, dataUrl: string }[]> => {
    try {
        const ai = getAiClient();
        const description = await describeImageConcise(imageBase64); // Use helper

        const ratioLabel = aspectRatio === '9:16' ? 'vertical 9:16 composition' : aspectRatio === '16:9' ? 'wide 16:9 composition' : 'square 1:1 composition';

        const styles: { name: string, prompt: string }[] = [
            { 
                name: 'Model (Female)', 
                prompt: `Full body shot of a young beautiful Indonesian model wearing a hijab (muslimah style) elegantly using the ${description}. Professional fashion photography, clean background, bright lighting, ${ratioLabel}.` 
            },
            { 
                name: 'Model (Male)', 
                prompt: `Full body shot of a young handsome Indonesian model holding the ${description}. Professional commercial photography, minimalist setting, confident pose, ${ratioLabel}.` 
            },
            {
                name: 'Aesthetic Flat Lay',
                prompt: `Aesthetic flat lay of the ${description} arranged beautifully on a minimalist marble table. Soft, natural lighting and subtle decorative elements related to the product, ${ratioLabel}.`
            },
            {
                name: 'Lifestyle Scene',
                prompt: `Lifestyle product photography. The ${description} is placed on a wooden shelf in a bright, modern, and clean room, creating a realistic and appealing scene, ${ratioLabel}.`
            },
            // New 12 preset looks (keeps all existing features, just more styles)
            { name: 'Studio Pose', prompt: `Clean studio backdrop, full body studio pose showcasing the ${description}. Even softbox lighting, subtle floor shadow, crisp detail, ${ratioLabel}.` },
            { name: 'Runway Walk', prompt: `High-fashion runway scene with catwalk lighting and shallow depth of field. Model walking confidently wearing/holding the ${description}, motion feel, ${ratioLabel}.` },
            { name: 'Modern Look', prompt: `Minimal modern interior with neutral tones. Sophisticated styling that highlights the ${description}. Balanced composition and soft daylight, ${ratioLabel}.` },
            { name: 'Seated Pose', prompt: `Seated pose on a simple bench or cube. Relaxed posture while featuring the ${description}. Soft key light and gentle rim light, ${ratioLabel}.` },
            { name: 'Portrait Shot', prompt: `Tight portrait framing that focuses on face and the ${description}. Beauty lighting, creamy bokeh background, editorial look, ${ratioLabel}.` },
            { name: 'Energetic Pose', prompt: `Dynamic energetic pose with movement, mid-air gesture or step. Emphasize the ${description}. High shutter clarity, bright backdrop, ${ratioLabel}.` },
            { name: 'Streetwear', prompt: `Urban street scene with graffiti wall or city vibe. Casual streetwear styling highlighting the ${description}. Contrast lighting, gritty yet clean, ${ratioLabel}.` },
            { name: 'Chic & Modern', prompt: `Chic contemporary fashion look. Soft luxury lighting, neutral background, polished styling to emphasize the ${description}, ${ratioLabel}.` },
            { name: 'Evening Glam', prompt: `Evening glam atmosphere with warm bokeh lights. Elegant styling that complements the ${description}. Cinematic mood, ${ratioLabel}.` },
            { name: 'Business Casual', prompt: `Bright office or co-working background. Business casual attire, confident expression, the ${description} presented professionally, ${ratioLabel}.` },
            { name: 'Artsy & Edgy', prompt: `Artistic and edgy coffee shop or studio corner, creative angles and textures. The ${description} as a bold focal point, ${ratioLabel}.` },
            { name: 'Cafe Casual', prompt: `Cozy cafe ambience with natural daylight. Casual friendly feel emphasizing the ${description}. Warm tones and shallow depth of field, ${ratioLabel}.` },
        ];
        const imagePromises = styles.map(async (style) => {
            const result = await generateImageFromParts([
              { inlineData: { mimeType: 'image/png', data: imageBase64 } },
              { text: style.prompt }
            ]);
            const base64ImageBytes: string = result.data;
            const imageUrl = `data:${result.mimeType};base64,${base64ImageBytes}`;
            return { style: style.name, base64: base64ImageBytes, dataUrl: imageUrl };
        });

        return Promise.all(imagePromises);
    } catch (error) {
        console.error("Gemini Image Generation Error:", error);
        throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const generateSceneComposition = async (productBase64: string, logoBase64: string, avatarBase64: string, aspectRatio: '1:1' | '16:9' | '9:16'): Promise<{ base64: string, dataUrl: string }> => {
    try {
        const ai = getAiClient();
        const productPart = { inlineData: { mimeType: 'image/png', data: productBase64 } };
        const logoPart = { inlineData: { mimeType: 'image/png', data: logoBase64 } };
        const avatarPart = { inlineData: { mimeType: 'image/png', data: avatarBase64 } };

        const textPart = {
            text: `Analisis tiga gambar ini: Gambar 1 adalah produk utama, Gambar 2 adalah logo merek, dan Gambar 3 adalah avatar merek. Buat satu prompt deskriptif yang sangat detail untuk AI generator gambar. Prompt ini harus mendeskripsikan sebuah adegan iklan yang kohesif. Produk utama harus menjadi fokus. Avatar harus disertakan secara halus di dalam adegan (misalnya, sebagai karakter kecil atau stiker di latar belakang). Logo merek harus ditempatkan dengan bersih di salah satu sudut, seperti kanan atas. Jelaskan seluruh adegan termasuk pencahayaan, latar belakang, dan gaya visual. Output hanya berupa string prompt untuk generator gambar, dalam Bahasa Inggris agar model gambar lebih paham.`
        };

        const promptGenResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [productPart, logoPart, avatarPart, textPart] },
        });
        const combinedPrompt = promptGenResponse.text;
        
        const img = await generateImageFromParts([
          productPart,
          logoPart,
          avatarPart,
          { text: combinedPrompt }
        ]);
        const base64ImageBytes: string = img.data;
        const imageUrl = `data:${img.mimeType};base64,${base64ImageBytes}`;
        return { base64: base64ImageBytes, dataUrl: imageUrl };
    } catch (error) {
        console.error("Gemini Scene Composition Error:", error);
        throw new Error(`Scene composition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const generateAvatar = async (imageBase64: string): Promise<{ base64: string, dataUrl: string }> => {
    try {
        const ai = getAiClient();
        const imagePart = { inlineData: { mimeType: 'image/png', data: imageBase64 } };

        // Step 1: Analyze the image to get a description of the outfit.
        const descriptionPrompt = "Describe the outfit worn by the person in the image in detail, suitable for an image generation prompt. Include clothing items, colors, and styles.";
        const descriptionResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, { text: descriptionPrompt }] },
        });
        const outfitDescription = descriptionResponse.text;

        // Step 2: Use the description to generate the avatar.
        const avatarPrompt = `A cute, full-body, chibi-style cartoon character wearing this outfit: ${outfitDescription}. The background must be a solid, neutral gray color. The character should be smiling and waving.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [{
                role: 'user',
                parts: [
                    imagePart,
                    { text: avatarPrompt }
                ],
            }],
            // imageGenerationConfig removed as it's not a known property for GenerateContentParameters
            // aspectRatio will be handled by the model's default or inferred from prompt/input
        });

        const generatedImagePart = response.candidates?.[0]?.content?.parts?.find(
            (p) => p.inlineData && p.inlineData.mimeType.startsWith('image/')
        );

        if (!generatedImagePart?.inlineData) {
            throw new Error('No image data received from Gemini for avatar.');
        }

        const base64ImageBytes: string = generatedImagePart.inlineData.data;
        const imageUrl = `data:${generatedImagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
        return { base64: base64ImageBytes, dataUrl: imageUrl };
    } catch (error) {
        console.error("Gemini Avatar Error:", error);
        throw new Error(`Avatar generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};


export const generateLogo = async (logoName: string): Promise<{ base64: string, dataUrl: string }> => {
    try {
        const ai = getAiClient();
        const prompt = `Create a modern, minimalist, clean typography-based or monogram logo for a brand named "${logoName}". The logo must be on a solid plain white background. The design should be simple, elegant, and professional. Black and white color scheme.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [{
                role: 'user',
                parts: [{ text: prompt }],
            }],
            // imageGenerationConfig removed as it's not a known property for GenerateContentParameters
            // aspectRatio will be handled by the model's default or inferred from prompt/input
        });

        const generatedImagePart = response.candidates?.[0]?.content?.parts?.find(
            (p) => p.inlineData && p.inlineData.mimeType.startsWith('image/')
        );

        if (!generatedImagePart?.inlineData) {
            throw new Error('No image data received from Gemini for logo.');
        }

        const base64ImageBytes: string = generatedImagePart.inlineData.data;
        const imageUrl = `data:${generatedImagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
        return { base64: base64ImageBytes, dataUrl: imageUrl };
    } catch (error) {
        console.error("Gemini Logo Error:", error);
        throw new Error(`Logo generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

export const generateShopTheLookFlatLay = async (image1Base64: string, image2Base64: string, aspectRatio: '1:1' | '16:9' | '9:16'): Promise<{ base64: string, dataUrl: string }> => {
    try {
        const ai = getAiClient();
        const product1Description = await describeImageConcise(image1Base64);
        const product2Description = await describeImageConcise(image2Base64);

        const imagePart1 = { inlineData: { mimeType: 'image/png', data: image1Base64 } };
        const imagePart2 = { inlineData: { mimeType: 'image/png', data: image2Base64 } };

        const prompt = `Create a new composite product photo by combining the items from the provided images. Take the ${product1Description} from Image 1, and the ${product2Description} from Image 2. Arrange them in a clean flat lay style on a minimalist white surface. Ensure the lighting is soft and even, highlighting both products equally.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [{
                role: 'user',
                parts: [
                    imagePart1,
                    imagePart2,
                    { text: prompt }
                ],
            }],
            // imageGenerationConfig removed as it's not a known property for GenerateContentParameters
            // aspectRatio will be handled by the model's default or inferred from prompt/input
        });

        const generatedImagePart = response.candidates?.[0]?.content?.parts?.find(
            (p) => p.inlineData && p.inlineData.mimeType.startsWith('image/')
        );

        if (!generatedImagePart?.inlineData) {
            throw new Error('No image data received from Gemini for Shop-the-Look Flat Lay.');
        }

        const base64ImageBytes: string = generatedImagePart.inlineData.data;
        const imageUrl = `data:${generatedImagePart.inlineData.mimeType};base64,${base64ImageBytes}`;
        return { base64: base64ImageBytes, dataUrl: imageUrl };
    } catch (error) {
        console.error("Gemini Shop-the-Look Flat Lay Error:", error);
        throw new Error(`Shop-the-Look Flat Lay generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// New function for Text to Image generation
export const generateImageFromText = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16'): Promise<{ base64: string, dataUrl: string }> => {
    try {
        const img = await generateImageFromParts([{ text: prompt }]);
        const base64ImageBytes: string = img.data;
        const imageUrl = `data:${img.mimeType};base64,${base64ImageBytes}`;
        return { base64: base64ImageBytes, dataUrl: imageUrl };
    } catch (error) {
        console.error("Gemini Text-to-Image Generation Error:", error);
        throw new Error(`Text-to-Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

// New function for Image to Image generation
export const generateImageToImage = async (imageBase64: string, prompt: string, aspectRatio: '1:1' | '16:9' | '9:16'): Promise<{ base64: string, dataUrl: string }> => {
    try {
        const fullPrompt = `Based on the provided image, generate a new image with the following modifications: ${prompt}. The output must be only the modified image.`;
        const img = await generateImageFromParts([
          { inlineData: { mimeType: 'image/png', data: imageBase64 } },
          { text: fullPrompt }
        ]);
        const base64ImageBytes: string = img.data;
        const imageUrl = `data:${img.mimeType};base64,${base64ImageBytes}`;
        return { base64: base64ImageBytes, dataUrl: imageUrl };
    } catch (error) {
        console.error("Gemini Image-to-Image Generation Error:", error);
        throw new Error(`Image-to-Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};


export const generateVideo = async (prompt: string, imageBase64: string | null, aspectRatio: '16:9' | '9:16'): Promise<string> => {
  if (!prompt) {
    throw new Error("Prompt is required.");
  }
  
  try {
    const ai = getAiClient();
    const request: any = {
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio: aspectRatio,
      }
    };

    if (imageBase64) {
      request.image = {
        imageBytes: imageBase64,
        mimeType: 'image/png',
      };
    }

    let initialOperation = await ai.models.generateVideos(request);
    const completedOperation = await pollOperation(initialOperation);

    if (completedOperation.error) {
        throw new Error(`Operation failed with code ${completedOperation.error.code}: ${completedOperation.error.message}`);
    }

    const downloadLink = completedOperation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Video URI not found in the response.");
    }
    
    // FIX: Use the API key from localStorage for the fetch call.
    const apiKey = getApiKey();
    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    
    if (!videoResponse.ok) {
        throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
  } catch (error) {
    console.error("Error in generationService:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate video: ${error.message}`);
    }
    throw new Error("An unknown error occurred during video generation.");
  }
};

// New: Clothing transfer using two images (model + product)
export const generateClothingTransfer = async (
  modelBase64: string,
  productBase64: string,
  prompt: string,
  aspectRatio: '1:1' | '16:9' | '9:16'
): Promise<{ base64: string, dataUrl: string }> => {
  try {
    const ai = getAiClient();
    const ratioText = aspectRatio === '9:16' ? 'vertical 9:16 composition' : aspectRatio === '16:9' ? 'wide 16:9 composition' : 'square 1:1 composition';

    const instruction = `You are given two images:
1) MODEL: The person to keep. Preserve identity, face, hair, pose, body proportions, lighting and background.
2) PRODUCT: The garment to transfer. Replace ONLY the visible upper-body clothing in the MODEL with the PRODUCT's garment (color, fabric, logo/print placement) while matching perspective and wrinkles realistically.

Strict requirements:
- Do not change the face, skin tone, hair, hands, or background.
- Do not add extra accessories or texts beyond what exists on the PRODUCT garment.
- Keep sleeves and neckline type consistent with PRODUCT.
- Keep composition ${ratioText}.
- High-resolution, photorealistic fashion photo.

User adjustment: ${prompt || 'use the product design as-is on the model.'}`;

    const img = await generateImageFromParts([
      { inlineData: { mimeType: 'image/png', data: modelBase64 } },
      { inlineData: { mimeType: 'image/png', data: productBase64 } },
      { text: instruction },
    ]);
    const base64ImageBytes: string = img.data;
    const imageUrl = `data:${img.mimeType};base64,${base64ImageBytes}`;
    return { base64: base64ImageBytes, dataUrl: imageUrl };
  } catch (error) {
    console.error('Gemini Clothing Transfer Error:', error);
    throw new Error(`Clothing transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
