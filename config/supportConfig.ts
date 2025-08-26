export interface SupportOption {
  name: string;
  description: string;
  icon: string;
  url?: string;
  qrCode?: string;
  details?: {
    bank: string;
    account: string;
    name: string;
  };
  color: string;
}

export const supportOptions: SupportOption[] = [
  {
    name: 'Saweria',
    description: 'Support via Saweria',
    icon: '💝',
    url: 'https://saweria.co/yourusername', // Ganti dengan username Saweria Anda
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
  },
  {
    name: 'DANA',
    description: 'Transfer via DANA',
    icon: '💙',
    details: {
      bank: 'DANA',
      account: '081234567890', // Ganti dengan nomor DANA Anda
      name: 'Your Name'
    },
    color: 'bg-blue-400 hover:bg-blue-500'
  },
  {
    name: 'OVO',
    description: 'Transfer via OVO',
    icon: '💜',
    details: {
      bank: 'OVO',
      account: '081234567890', // Ganti dengan nomor OVO Anda
      name: 'Your Name'
    },
    color: 'bg-purple-500 hover:bg-purple-600'
  },
  {
    name: 'GoPay',
    description: 'Transfer via GoPay',
    icon: '💚',
    details: {
      bank: 'GoPay',
      account: '081234567890', // Ganti dengan nomor GoPay Anda
      name: 'Your Name'
    },
    color: 'bg-green-400 hover:bg-green-500'
  }
];

// Konfigurasi tambahan
export const supportConfig = {
  showSupportButton: true, // Set false untuk menyembunyikan tombol support
  buttonPosition: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
  modalTitle: 'Support Developer',
  thankYouMessage: 'Terima kasih atas support Anda! 🙏',
  descriptionMessage: 'Support ini akan membantu pengembangan aplikasi'
};
