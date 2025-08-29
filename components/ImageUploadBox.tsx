import React from 'react';
import { UploadIcon } from '../src/icons_fixed';

interface ImageUploadBoxProps {
  label: string;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  disabled: boolean;
  currentImagePreview: string | null;
  maxSizeMB?: number;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  label,
  onFileChange,
  fileInputRef,
  disabled,
  currentImagePreview,
  maxSizeMB = 5,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      <div
        className={`relative w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors p-2
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-700 border-gray-600' : 'bg-gray-700/50 border-gray-600 hover:border-indigo-500'}
        `}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={onFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={disabled}
        />
        {currentImagePreview ? (
          <img src={currentImagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
        ) : (
          <div className="text-center text-gray-400">
            <UploadIcon className="w-8 h-8 mx-auto mb-1 text-indigo-400" />
            <p className="text-sm text-gray-300">Click to upload image</p>
            <p className="text-xs text-gray-400">(Max {maxSizeMB}MB)</p>
          </div>
        )}
        {currentImagePreview && (
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onFileChange({ target: { files: [] } } as React.ChangeEvent<HTMLInputElement>); }}
                className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-gray-300 hover:text-white transition-colors"
                aria-label="Clear image"
            >
                ×
            </button>
        )}
      </div>
    </div>
  );
};

