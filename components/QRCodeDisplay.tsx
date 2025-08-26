import React from 'react';

interface QRCodeDisplayProps {
  qrCodePath: string;
  altText?: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qrCodePath, 
  altText = "QR Code", 
  size = 128 
}) => {
  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div 
        className="bg-white p-4 rounded-lg inline-block"
        style={{ width: size, height: size }}
      >
        <div 
          className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center"
          style={{ minWidth: size, minHeight: size }}
        >
          <div className="text-center">
            <div className="text-gray-500 text-4xl mb-2">📱</div>
            <span className="text-gray-500 text-xs">QR Code</span>
            <p className="text-gray-400 text-xs mt-1">Tidak tersedia</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white p-4 rounded-lg inline-block"
      style={{ width: size, height: size }}
    >
      <img
        src={qrCodePath}
        alt={altText}
        className="w-full h-full object-contain rounded-lg"
        onError={handleImageError}
        style={{ minWidth: size, minHeight: size }}
      />
    </div>
  );
};
