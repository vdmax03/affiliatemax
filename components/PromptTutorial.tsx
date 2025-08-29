import React, { useState } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export const PromptTutorial: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const prompts = [
    {
      category: "Penggantian Latar Belakang",
      examples: [
        "Ganti latar belakang cakrawala kota dengan kota metropolitan cyberpunk yang diterangi neon di malam hari",
        "Ubah pemandangan pantai di siang hari menjadi lanskap musim dingin bersalju dengan pohon pinus",
        "Ganti latar belakang taman menjadi hutan mistis dengan cahaya yang melayang"
      ]
    },
    {
      category: "Penyesuaian Pencahayaan dan Suasana",
      examples: [
        "Jadikan pemandangan lebih cerah dengan sinar matahari keemasan yang hangat dan bayangan lembut",
        "Ciptakan suasana murung dan hujan dengan jalanan basah yang memantulkan cahaya",
        "Tambahkan cahaya lilin lembut ke ruangan dan tekankan bayangan untuk nuansa malam yang nyaman"
      ]
    },
    {
      category: "Penggantian atau Transformasi Objek",
      examples: [
        "Ganti cangkir kopi dengan bola kristal yang bersinar",
        "Ubah mobil menjadi kendaraan melayang futuristik dengan aksen neon",
        "Ganti kursi kayu tua menjadi singgasana metalik modern"
      ]
    },
    {
      category: "Penataan Ulang Karakter",
      examples: [
        "Ubah orang tersebut menjadi prajurit cyberpunk dengan zirah neon dan tato yang bersinar",
        "Buat potretnya terlihat seperti lukisan cat minyak klasik bergaya Baroque",
        "Ubah karakter menjadi penyihir bergaya anime yang memegang tongkat sihir",
        "Ganti outfit pria yang di foto pertama dengan outfit yang dipakai wanita di foto ke dua beserta topi dan wig nya"
      ]
    },
    {
      category: "Transformasi Gaya Artistik",
      examples: [
        "Ubah lanskap menjadi lukisan cat air dengan nada pastel",
        "Buat pemandangan jalanan terlihat seperti lukisan Van Gogh dengan sapuan kuas yang berputar-putar",
        "Terapkan gaya melamun surealis dengan fokus lembut dan objek yang melayang"
      ]
    },
    {
      category: "Perubahan Cuaca dan Lingkungan",
      examples: [
        "Ganti langit yang cerah menjadi matahari terbenam yang dramatis dengan awan oranye dan ungu",
        "Buat salju turun dengan lembut di jalanan kota dengan kepingan salju yang berjatuhan",
        "Ubah taman yang cerah menjadi adegan pagi berkabut dengan kabut rendah"
      ]
    },
    {
      category: "Manipulasi Adegan Tingkat Lanjut",
      examples: [
        "Tambahkan hologram futuristik yang melayang di atas jalan dan pantulan neon di trotoar yang basah",
        "Ganti semua orang di latar belakang dengan robot sambil mempertahankan karakter utama tetap manusia",
        "Ubah ruangan santai menjadi interior cyberpunk yang mewah dengan lampu neon"
      ]
    },
    {
      category: "Prompt Berulang untuk Penyempurnaan",
      examples: [
        "Prompt pertama: 'Jadikan jalanan terlihat hujan'",
        "Prompt kedua: 'Tambahkan pantulan tanda neon di trotoar yang basah dan tetesan air hujan yang halus'",
        "Prompt pertama: 'Ubah karakter menjadi seorang prajurit'",
        "Prompt kedua: 'Tambahkan zirah yang bersinar, pose dramatis, dan medan perang fantasi di latar belakang'"
      ]
    }
  ];

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 space-y-4 shadow-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left text-lg font-semibold text-gray-200 hover:text-white transition-colors"
      >
        <span>Memulai dengan Prompt Dasar</span>
        <SparklesIcon className={`w-5 h-5 text-indigo-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="space-y-4 text-gray-300 text-sm">
          <p>Nano Banana memungkinkan Anda membuat pengeditan yang sangat spesifik dengan mendeskripsikan secara tepat apa yang Anda inginkan. Berikut adalah lusinan contoh prompt praktis untuk menginspirasi transformasi gambar Anda sendiri.</p>
          
          {prompts.map((section, index) => (
            <div key={index} className="space-y-2">
              <h4 className="font-semibold text-indigo-400">{section.category}</h4>
              <ul className="list-disc list-inside space-y-1">
                {section.examples.map((example, exIndex) => (
                  <li key={exIndex}>{example}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};