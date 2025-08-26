import React, { useState } from 'react';
import { supportOptions, supportConfig } from '../config/supportConfig';
import { QRCodeDisplay } from './QRCodeDisplay';

export const SupportButton: React.FC = () => {
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Jika support button dimatikan, jangan render apa-apa
  if (!supportConfig.showSupportButton) {
    return null;
  }

  return (
    <>
      {/* Support Button */}
      <button
        onClick={() => setShowSupportModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 z-50"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">💝</span>
          <span>Support</span>
        </div>
      </button>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{supportConfig.modalTitle}</h2>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {supportOptions.map((option, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{option.name}</h3>
                      <p className="text-gray-400 text-sm">{option.description}</p>
                    </div>
                  </div>

                  {option.url && (
                    <a
                      href={option.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full text-center py-2 px-4 ${option.color} text-white font-medium rounded-lg transition-colors`}
                    >
                      Buka Saweria
                    </a>
                  )}

                  {option.qrCode && (
                    <div className="text-center">
                      <div className="mb-3">
                        <QRCodeDisplay 
                          qrCodePath={option.qrCode} 
                          altText={`QR Code ${option.name}`}
                          size={128}
                        />
                      </div>
                      <p className="text-gray-400 text-sm">
                        Scan QRIS di atas untuk donasi
                      </p>
                    </div>
                  )}

                  {option.details && (
                    <div className="bg-gray-600 rounded-lg p-3">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Bank:</span>
                          <span className="text-white font-medium">{option.details.bank}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">No. Rekening:</span>
                          <span className="text-white font-medium">{option.details.account}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Atas Nama:</span>
                          <span className="text-white font-medium">{option.details.name}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(option.details.account);
                          alert('Nomor rekening berhasil disalin!');
                        }}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Salin Nomor Rekening
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <div className="text-center pt-4 border-t border-gray-600">
                <p className="text-gray-400 text-sm">
                  {supportConfig.thankYouMessage}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {supportConfig.descriptionMessage}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
