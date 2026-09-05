import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, AlertCircle, CheckCircle2, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';
import { WebcamModal } from './WebcamModal';

interface PhotoUploaderProps {
  sourceImage: string | null;
  onImageSelected: (imageDataUrl: string) => void;
  onProceedToTheme: () => void;
  faceValidation: {
    isValid: boolean;
    faceCount: number;
    message: string;
    isChecking: boolean;
  };
  onResetPhoto: () => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  sourceImage,
  onImageSelected,
  onProceedToTheme,
  faceValidation,
  onResetPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일(JPG, PNG 등)만 등록할 수 있습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onImageSelected(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1810] tracking-tight mb-2">
          사진을 찍어주세요
        </h2>
        <p className="text-[#4A2C2A]/70 text-base sm:text-lg font-medium">
          카메라로 직접 촬영하거나 가지고 계신 사진을 불러와주세요.
        </p>
      </div>

      {!sourceImage ? (
        /* Image Selection Options */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full bg-white border-4 rounded-2xl p-6 sm:p-10 flex flex-col items-center shadow-xl transition-all ${
            isDragging ? 'border-[#800020] bg-[#F5F2ED]' : 'border-[#4A2C2A]'
          }`}
        >
          {/* Two Big Buttons */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Button 1: Camera Shoot */}
            <button
              onClick={() => setIsWebcamOpen(true)}
              className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#800020] text-white border-4 border-[#D4AF37] shadow-xl hover:bg-[#990026] hover:scale-[1.02] active:scale-95 transition-all group cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <span className="text-2xl font-black tracking-tight mb-1">
                📷 사진 촬영
              </span>
              <span className="text-xs text-white/80 font-medium">
                지금 바로 카메라로 찍기
              </span>
            </button>

            {/* Button 2: File Browse */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#4A2C2A] text-white border-4 border-[#D4AF37] shadow-xl hover:bg-[#38201E] hover:scale-[1.02] active:scale-95 transition-all group cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <span className="text-2xl font-black tracking-tight mb-1">
                🖼 사진 불러오기
              </span>
              <span className="text-xs text-white/80 font-medium">
                스마트폰 / PC 사진첩에서 선택
              </span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-[#4A2C2A]/70 text-center font-medium">
            💡 정면을 바라보고 이목구비가 잘 나온 독사진일수록 더욱 멋진 추억 사진이 완성됩니다.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      ) : (
        /* Image Preview & Face Validation Card */
        <div className="w-full bg-white rounded-2xl border-4 border-[#4A2C2A] p-6 sm:p-8 shadow-xl flex flex-col items-center">
          {/* Photo Frame */}
          <div className="relative w-64 sm:w-72 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border-4 border-[#D4AF37] bg-black mb-6">
            <img
              src={sourceImage}
              alt="등록된 사진"
              className="w-full h-full object-cover"
            />

            {/* Checking overlay */}
            {faceValidation.isChecking && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center">
                <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-3" />
                <p className="text-sm font-bold">얼굴을 확인하고 있습니다…</p>
              </div>
            )}
          </div>

          {/* Validation Feedback Messages */}
          <div className="w-full mb-6 max-w-lg">
            {faceValidation.isChecking ? (
              <div className="p-4 rounded-xl bg-[#F5F2ED] border-2 border-[#4A2C2A]/20 flex items-center justify-center gap-2 text-[#4A2C2A] font-bold text-sm">
                <Loader2 className="w-4 h-4 text-[#800020] animate-spin" />
                <span>선명한 얼굴 확인 중입니다…</span>
              </div>
            ) : !faceValidation.isValid ? (
              <div className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-800 flex items-start gap-3 shadow-sm">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-base mb-1">{faceValidation.message}</p>
                  <p className="text-xs text-red-600">
                    한 분의 얼굴이 또렷하게 나오는 사진으로 다시 촬영해주세요.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 flex items-center gap-3 shadow-sm">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-base">얼굴이 선명하게 확인되었습니다!</p>
                  <p className="text-xs text-emerald-700">이제 원하는 레트로 테마를 선택해보세요.</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-lg flex flex-col sm:flex-row gap-3">
            <button
              onClick={onResetPhoto}
              className="flex-1 py-3.5 px-5 rounded-xl border-2 border-[#4A2C2A] bg-white text-[#4A2C2A] font-bold text-base hover:bg-[#F5F2ED] flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              사진 다시 찍기
            </button>

            <button
              onClick={onProceedToTheme}
              disabled={faceValidation.isChecking || !faceValidation.isValid}
              className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-all ${
                faceValidation.isValid && !faceValidation.isChecking
                  ? 'bg-[#800020] text-white border-2 border-[#D4AF37] hover:bg-[#990026] hover:scale-[1.02] cursor-pointer'
                  : 'bg-gray-300 text-gray-500 border border-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <span>테마 선택하러 가기</span>
              <ArrowRight className="w-5 h-5 text-[#D4AF37]" />
            </button>
          </div>
        </div>
      )}

      {/* Webcam Modal */}
      <WebcamModal
        isOpen={isWebcamOpen}
        onClose={() => setIsWebcamOpen(false)}
        onCapture={(img) => {
          onImageSelected(img);
        }}
      />
    </div>
  );
};
