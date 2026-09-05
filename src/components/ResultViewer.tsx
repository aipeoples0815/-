import React, { useState } from 'react';
import { Download, RefreshCw, UserPlus, CheckCircle2, AlertCircle, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { RetroTheme, TargetAgeGroup } from '../types';
import { getAgeGroupTitle } from '../constants/themes';

interface ResultViewerProps {
  sourceImage: string | null;
  finalPrintImage: string | null;
  theme: RetroTheme | undefined;
  gender: string | null;
  targetAgeGroup?: TargetAgeGroup;
  onRegenerate: () => void;
  onSavePhoto: () => Promise<void>;
  onNextCustomer: () => void;
  isSaving: boolean;
  saveStatus: {
    saved: boolean;
    driveSaved?: boolean;
    message: string;
    filename?: string;
  } | null;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({
  sourceImage,
  finalPrintImage,
  theme,
  gender,
  targetAgeGroup = '20s',
  onRegenerate,
  onSavePhoto,
  onNextCustomer,
  isSaving,
  saveStatus,
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Trigger manual browser download directly
  const handleDirectDownload = () => {
    if (!finalPrintImage) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const filename = saveStatus?.filename || `반여시장_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.jpg`;

    const a = document.createElement('a');
    a.href = finalPrintImage;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Title */}
      <div className="text-center mb-6">
        <span className="inline-block px-3.5 py-1 rounded-full bg-[#800020] text-white text-xs sm:text-sm font-bold mb-2 tracking-wide border border-[#D4AF37]">
          STEP 5 · 추억 사진 완성
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-[#800020] tracking-tight mb-1 font-serif-display">
          짠! 추억 속의 나를 만나보세요.
        </h2>
        <p className="text-base sm:text-lg text-[#4A2C2A] font-medium opacity-85">
          {theme?.title} · {getAgeGroupTitle(targetAgeGroup)} ({gender === 'male' ? '남자 스타일' : '여자 스타일'})
        </p>
      </div>

      {/* Main 5:7 Print Frame Container */}
      <div className="relative w-full max-w-md sm:max-w-lg mb-6 flex flex-col items-center">
        {/* Photo Card with classic paper elevation & studio frame */}
        <div className="w-full aspect-[5/7] bg-white rounded-2xl p-2 sm:p-3 shadow-2xl border-4 border-[#4A2C2A] relative overflow-hidden group">
          {finalPrintImage ? (
            <img
              src={showOriginal && sourceImage ? sourceImage : finalPrintImage}
              alt="추억의 사진"
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F5F2ED]">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
            </div>
          )}

          {/* Original Toggle Watermark */}
          {showOriginal && (
            <div className="absolute top-6 left-6 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wider backdrop-blur-xs border border-white/20">
              📷 촬영 원본 사진
            </div>
          )}

          {/* Toggle View Original Button */}
          {sourceImage && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="absolute bottom-4 right-4 bg-[#4A2C2A]/90 hover:bg-[#2C1810] text-white px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#D4AF37] flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            >
              {showOriginal ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>완성본 보기</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>원본과 비교</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* 5:7 Print Specification Notice */}
        <div className="mt-2 text-xs text-[#4A2C2A]/70 font-medium text-center flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>표준 5:7 고화질 인화 규격 (1500 × 2100 px)으로 완성되었습니다.</span>
        </div>
      </div>

      {/* Save Status Banner */}
      {saveStatus && (
        <div
          className={`w-full max-w-lg mb-6 p-4 rounded-2xl flex items-start gap-3 shadow-md border-2 ${
            saveStatus.saved
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          {saveStatus.saved ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="font-bold text-base">{saveStatus.message}</p>
            {saveStatus.filename && (
              <p className="text-xs text-emerald-700 mt-0.5">
                파일명: <strong>{saveStatus.filename}</strong> (반여시장_레트로사진관_2026 폴더)
              </p>
            )}
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleDirectDownload}
                className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                📥 지금 다시 내려받기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3 Main Action Buttons */}
      <div className="w-full max-w-lg flex flex-col gap-3 mb-6">
        {/* Primary 1: Save Photo */}
        <button
          onClick={onSavePhoto}
          disabled={isSaving}
          className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-[#800020] text-white border-4 border-[#D4AF37] font-black text-xl sm:text-2xl hover:bg-[#990026] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
              <span>사진관 앨범에 저장 중…</span>
            </>
          ) : (
            <>
              <Download className="w-6 h-6 text-[#D4AF37]" />
              <span>💾 사진 저장하기 (JPEG 다운로드)</span>
            </>
          )}
        </button>

        {/* Secondary: Regenerate & Next Customer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onRegenerate}
            disabled={isSaving}
            className="py-3.5 px-4 rounded-xl border-2 border-[#4A2C2A] bg-white text-[#4A2C2A] font-bold text-base hover:bg-[#F5F2ED] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-5 h-5 text-[#800020]" />
            <span>🔄 다시 만들기</span>
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="py-3.5 px-4 rounded-xl bg-[#4A2C2A] text-white border-2 border-[#D4AF37] font-bold text-base hover:bg-[#38201E] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <UserPlus className="w-5 h-5 text-[#D4AF37]" />
            <span>👤 다음 손님 촬영하기</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Next Customer */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-[#F5F2ED] rounded-3xl max-w-md w-full p-6 sm:p-8 border-4 border-[#4A2C2A] shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-[#800020]/20 border-2 border-[#800020] flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-[#800020]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#2C1810] mb-2 font-serif-display">
              다음 손님을 맞이할까요?
            </h3>
            <p className="text-sm sm:text-base text-[#4A2C2A] mb-6">
              "현재 사진을 닫고 다음 손님을 촬영할까요?"
              <br />
              <span className="text-xs text-[#4A2C2A]/70 mt-1 inline-block">
                (개인정보 보호를 위해 현재 손님의 사진과 설정은 즉시 초기화됩니다)
              </span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3.5 px-4 rounded-xl border-2 border-[#4A2C2A]/30 bg-white text-[#4A2C2A] font-bold text-base hover:bg-white cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  onNextCustomer();
                }}
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#800020] text-white border-2 border-[#D4AF37] font-bold text-base hover:bg-[#990026] shadow-md cursor-pointer"
              >
                네, 다음 손님
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
