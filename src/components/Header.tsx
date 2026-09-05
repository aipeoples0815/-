import React from 'react';
import { Camera, Sparkles, SlidersHorizontal } from 'lucide-react';
import { Step } from '../types';

interface HeaderProps {
  currentStep: Step;
  todayCount: number;
  onOpenOperatorModal?: () => void;
  onResetToStart?: () => void;
}

const STEPS: { key: Step; label: string; number: number }[] = [
  { key: 'upload', label: '사진 등록', number: 1 },
  { key: 'theme', label: '테마 선택', number: 2 },
  { key: 'gender', label: '스타일', number: 3 },
  { key: 'age', label: '연령대 선택', number: 4 },
  { key: 'result', label: '추억 사진', number: 5 },
];

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  todayCount,
  onOpenOperatorModal,
  onResetToStart,
}) => {
  const getStepIndex = (step: Step) => {
    if (step === 'generating') return 3.5;
    const found = STEPS.findIndex((s) => s.key === step);
    return found !== -1 ? found : 0;
  };

  const currentStepIdx = getStepIndex(currentStep);

  return (
    <header className="w-full bg-[#F5F2ED] border-b border-[#4A2C2A]/15 relative select-none">
      {/* Top Bar with Brand & Operator Counter */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-5 pb-3 flex items-start justify-between relative">
        {/* Left Logo */}
        <div 
          onClick={onResetToStart}
          className="cursor-pointer flex items-center gap-2 group text-[#4A2C2A] hover:opacity-80 transition-opacity"
          title="처음으로 돌아가기"
        >
          <div className="w-10 h-10 rounded-xl bg-[#800020] border-2 border-[#D4AF37] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform text-[#D4AF37]">
            <Camera className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#4A2C2A] hidden sm:inline">
            2026 FESTA
          </span>
        </div>

        {/* Center Grand Immersive Signboard Title */}
        <div className="text-center flex-1 px-2">
          <h1 className="text-3xl sm:text-5xl font-black text-[#800020] mb-1 tracking-tight font-serif-display">
            2026 반여시장 레트로 AI 사진관
          </h1>
          <p className="text-sm sm:text-lg font-medium text-[#4A2C2A] opacity-85">
            “그 시절의 나를 다시 만나다”
          </p>
        </div>

        {/* Right Operator Counter */}
        <div className="flex items-center">
          <button
            onClick={onOpenOperatorModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#4A2C2A]/20 hover:bg-white text-xs font-bold text-[#4A2C2A] transition-all shadow-xs group cursor-pointer"
            title="운영 현황 및 설정"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="opacity-70">오늘 촬영</span>
            <strong className="text-[#800020] font-black text-sm">{todayCount}</strong>
            <span className="opacity-70">명</span>
            <SlidersHorizontal className="w-3 h-3 ml-0.5 opacity-40 group-hover:opacity-100" />
          </button>
        </div>
      </div>

      {/* Step Indicator Progress Bar */}
      <div className="bg-[#4A2C2A] text-white py-2 px-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {STEPS.map((s, idx) => {
            const isActive = idx === Math.floor(currentStepIdx);
            const isCompleted = idx < currentStepIdx;

            return (
              <div
                key={s.key}
                className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'text-[#D4AF37] scale-105'
                    : isCompleted
                    ? 'text-white/90'
                    : 'text-white/40'
                }`}
              >
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-black border ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#2C1810] border-[#D4AF37] shadow-sm'
                      : isCompleted
                      ? 'bg-[#800020] text-white border-[#D4AF37]/50'
                      : 'bg-[#3A2220] text-white/40 border-white/20'
                  }`}
                >
                  {isCompleted ? '✓' : s.number}
                </div>
                <span className="hidden xs:inline sm:inline">{s.label}</span>
                {idx < STEPS.length - 1 && (
                  <span className="text-white/20 text-xs ml-1 sm:ml-2">›</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
};
