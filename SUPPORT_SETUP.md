# 🎁 Support Button Setup Guide

## 📋 Overview
Fitur support button memungkinkan pengguna untuk memberikan donasi melalui berbagai metode pembayaran seperti Saweria, QRIS, dan transfer bank.

## 🚀 Cara Setup

### 1. Konfigurasi Support Options

Edit file `config/supportConfig.ts` dan sesuaikan dengan informasi Anda:

```typescript
export const supportOptions: SupportOption[] = [
  {
    name: 'Saweria',
    description: 'Support via Saweria',
    icon: '💝',
    url: 'https://saweria.co/YOUR_USERNAME', // Ganti dengan username Saweria Anda
    color: 'bg-orange-500 hover:bg-orange-600'
  },
  {
    name: 'QRIS',
    description: 'Scan QRIS untuk donasi',
    icon: '📱',
    qrCode: '/qris-qr-code.png', // Ganti dengan path QR code QRIS Anda
    color: 'bg-green-500 hover:bg-green-600'
  },
  {
    name: 'Bank Transfer',
    description: 'Transfer bank langsung',
    icon: '🏦',
    details: {
      bank: 'BCA', // Ganti dengan bank Anda
      account: '1234567890', // Ganti dengan nomor rekening Anda
      name: 'Your Name' // Ganti dengan nama Anda
    },
    color: 'bg-blue-500 hover:bg-blue-600'
  }
];
```

### 2. Menambahkan QR Code QRIS

1. **Buat QR Code QRIS** menggunakan aplikasi bank atau e-wallet Anda
2. **Simpan file QR code** di folder `public/` dengan nama `qris-qr-code.png`
3. **Update path** di `supportConfig.ts` jika menggunakan nama file yang berbeda

### 3. Konfigurasi Tambahan

```typescript
export const supportConfig = {
  showSupportButton: true, // Set false untuk menyembunyikan tombol
  buttonPosition: 'bottom-right', // Posisi tombol
  modalTitle: 'Support Developer', // Judul modal
  thankYouMessage: 'Terima kasih atas support Anda! 🙏',
  descriptionMessage: 'Support ini akan membantu pengembangan aplikasi'
};
```

## 🎨 Fitur yang Tersedia

### ✅ Saweria
- Link langsung ke halaman Saweria
- Tombol "Buka Saweria" yang menarik
- Warna orange yang sesuai dengan brand Saweria

### ✅ QRIS
- Tampilan QR code yang responsif
- Fallback jika QR code tidak tersedia
- Ukuran yang optimal untuk scanning

### ✅ Bank Transfer
- Informasi rekening yang lengkap
- Tombol "Salin Nomor Rekening"
- Format yang mudah dibaca

### ✅ E-Wallet Support
- DANA, OVO, GoPay
- Informasi nomor yang mudah disalin
- Warna yang sesuai dengan brand masing-masing

## 🔧 Customization

### Mengubah Posisi Tombol
```typescript
buttonPosition: 'bottom-right' // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
```

### Menambah Metode Pembayaran Baru
```typescript
{
  name: 'Metode Baru',
  description: 'Deskripsi metode',
  icon: '🎯',
  url: 'https://link-pembayaran.com',
  color: 'bg-red-500 hover:bg-red-600'
}
```

### Menyembunyikan Tombol Support
```typescript
showSupportButton: false
```

## 📱 Responsive Design

- ✅ Mobile-friendly
- ✅ Tablet-friendly
- ✅ Desktop-friendly
- ✅ Modal yang scrollable untuk konten panjang

## 🎯 User Experience

### Fitur yang User-Friendly:
- **One-click copy** untuk nomor rekening
- **Modal yang mudah ditutup** dengan tombol X atau klik di luar
- **Loading state** yang smooth
- **Error handling** untuk QR code yang tidak tersedia
- **Responsive design** untuk semua ukuran layar

### Animasi dan Transisi:
- **Hover effects** pada tombol
- **Scale animation** saat hover
- **Smooth transitions** untuk modal
- **Gradient background** yang menarik

## 🔒 Security

- ✅ Tidak ada data sensitif yang disimpan di client
- ✅ Link eksternal menggunakan `target="_blank"` dan `rel="noopener noreferrer"`
- ✅ Clipboard API hanya untuk nomor rekening

## 📝 Tips

1. **QR Code Quality**: Pastikan QR code memiliki resolusi yang baik (minimal 256x256px)
2. **Testing**: Test semua link dan nomor rekening sebelum deploy
3. **Backup**: Simpan backup QR code di tempat yang aman
4. **Monitoring**: Pantau donasi yang masuk secara berkala

## 🐛 Troubleshooting

### QR Code Tidak Muncul
- Pastikan file QR code ada di folder `public/`
- Cek path file di `supportConfig.ts`
- Pastikan format file adalah PNG/JPG

### Tombol Support Tidak Muncul
- Cek `showSupportButton: true` di config
- Pastikan user sudah login (tombol hanya muncul setelah login)
- Refresh browser dan cek console untuk error

### Link Saweria Tidak Bekerja
- Pastikan URL Saweria benar dan aktif
- Test link di browser terpisah
- Cek apakah ada typo di username

## 📞 Support

Jika ada masalah dengan setup support button, silakan:
1. Cek console browser untuk error
2. Pastikan semua konfigurasi sudah benar
3. Test di browser yang berbeda
4. Restart development server jika perlu
