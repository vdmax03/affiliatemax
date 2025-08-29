<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Veo 2 Video Generator

Aplikasi AI-powered video generator yang menggunakan Google Gemini dan Veo 2.0 untuk membuat video iklan produk secara otomatis.

## 🚀 Fitur Utama

- **AI Video Generation** - Generate video dari gambar produk menggunakan Veo 2.0
- **Smart Prompt Generation** - AI otomatis membuat prompt video yang optimal
- **Ad Script Generation** - Generate script iklan yang engaging
- **Image Variations** - Buat variasi gambar produk dengan berbagai style
- **Logo & Avatar Generation** - Generate logo dan avatar untuk brand
- **Audio Voiceover** - Convert script menjadi audio dengan Gemini TTS atau ElevenLabs TTS (kualitas lebih baik)
- **Multiple Aspect Ratios** - Support 16:9 dan 9:16
- **Asset Management** - Gallery untuk mengelola semua asset
- **🔑 API Key Manager** - Kelola API key langsung di UI dengan localStorage

## 🛠️ Setup & Instalasi

### Prerequisites
- Node.js 18+ 
- Gemini API Key dari [Google AI Studio](https://makersuite.google.com/app/apikey)
- ElevenLabs API Key (optional) dari [ElevenLabs](https://elevenlabs.io/) untuk TTS kualitas premium

### Langkah Instalasi

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd veo-2-video-generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup environment variables (Optional):**
   Buat file `.env.local` di root project:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```
   
   **Note:** Sekarang Anda juga bisa set API key langsung di UI menggunakan fitur "Manage API Key" di header.

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Build untuk production:**
   ```bash
   npm run build
   ```

## 📋 Cara Penggunaan

### 🔑 Setup API Key
1. **Via UI (Recommended):**
   - Klik tombol "Manage API Key" di header
   - Masukkan API key Anda
   - Klik "Save to Local Storage"
   - Status akan berubah menjadi "API Key Ready"

2. **Via Environment File:**
   - Edit file `.env.local`
   - Tambahkan API key Anda

### 🎬 Generate Video
1. **Upload Gambar Produk** - Upload foto produk yang ingin dibuat videonya
2. **Generate Prompt** - AI akan otomatis membuat 3 variasi prompt video (lebih cepat sekarang!)
3. **Customize Script** - Edit script iklan sesuai kebutuhan
4. **Generate Assets** - Buat logo, avatar, dan variasi gambar
5. **Generate Audio** - Convert script menjadi voiceover dengan pilihan:
   - **Gemini TTS** - Default, cepat dan gratis
   - **ElevenLabs TTS** - Kualitas lebih baik, pilih voice yang diinginkan
6. **Generate Video** - Pilih aspect ratio dan generate video final

## ⚡ Optimasi Performa

### Generate Prompt yang Lebih Cepat
- **Parallel Processing** - Prompt dan script di-generate bersamaan
- **Fallback System** - Jika AI gagal, akan menggunakan prompt default
- **Better Loading States** - Indikator loading yang lebih informatif
- **Error Handling** - Pesan error yang lebih jelas

### Tips untuk Performa Optimal
- Gunakan gambar dengan resolusi optimal (1080p max)
- Pastikan koneksi internet stabil
- Tutup tab browser lain untuk menghemat memory
- API key yang valid dan memiliki quota cukup

## 🔮 Saran Fitur untuk Pengembangan

### Fitur Prioritas Tinggi:
1. **Video Templates** - Template video siap pakai untuk berbagai industri
2. **Batch Processing** - Generate multiple video sekaligus
3. **Video Editing** - Basic editing tools (trim, crop, add text)
4. **Export Options** - Export ke berbagai format dan resolusi
5. **Project Management** - Save dan load project

### Fitur Menengah:
6. **Collaboration** - Share project dengan tim
7. **Analytics** - Track performance video yang dihasilkan
8. **Custom Branding** - Upload custom logo dan font
9. **Voice Selection** - Pilih berbagai voice untuk TTS
10. **Background Music** - Library musik background

### Fitur Lanjutan:
11. **AI Video Enhancement** - Improve kualitas video dengan AI
12. **Social Media Integration** - Direct upload ke platform sosial media
13. **A/B Testing** - Test berbagai versi video
14. **API Integration** - REST API untuk integrasi dengan sistem lain
15. **White Label** - Custom branding untuk reseller

## 🐛 Troubleshooting

### Error "API Key not found"
- **Via UI:** Klik "Manage API Key" di header dan masukkan key
- **Via File:** Pastikan file `.env.local` sudah dibuat dengan format yang benar
- Restart development server setelah menambah environment variable

### Error "Video generation failed"
- Cek koneksi internet
- Pastikan API key valid dan memiliki quota
- Coba dengan gambar yang lebih sederhana

### Generate Prompt Lambat
- Pastikan API key valid
- Cek koneksi internet
- Jika gagal, aplikasi akan menggunakan prompt default

### Performance Issues
- Gunakan gambar dengan resolusi optimal (1080p max)
- Tutup tab browser lain untuk menghemat memory
- Pastikan browser terbaru

## 📄 License

MIT License - lihat file LICENSE untuk detail

## 🤝 Contributing

Kontribusi sangat diterima! Silakan buat pull request atau report issues.

---

**Note:** Aplikasi ini menggunakan Google Gemini API yang memerlukan API key dan mungkin ada biaya penggunaan.
