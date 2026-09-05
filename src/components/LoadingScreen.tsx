import React, { useState, useEffect } from 'react';
import { Sparkles, Film, Clock } from 'lucide-react';
import { LOADING_MESSAGES, getAgeGroupTitle } from '../constants/themes';
import { TargetAgeGroup } from '../types';

interface LoadingScreenProps {
  themeTitle?: string;
  gender?: string;
  targetAgeGroup?: TargetAgeGroup;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  themeTitle,
  gender,
  targetAgeGroup,
}) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Cycle messages every 3.2 seconds
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3200);

    // Progress simulation
    const progInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + Math.floor(Math.random() * 8) + 4;
      });
    }, 1000);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto py-8 flex flex-col items-center justify-center text-center">
      {/* Darkroom Immersive Card */}
      <div className="w-full bg-[#4A2C2A] rounded-2xl border-4 border-[#D4AF37] p-8 sm:p-12 shadow-2xl text-white flex flex-col items-center relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#800020]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Vintage Film Reel Animation */}
        <div className="relative mb-8">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#2C1810] border-4 border-[#D4AF37] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] animate-spin [animation-duration:8s]">
            <Film className="w-14 h-14 sm:w-18 sm:h-18 text-[#D4AF37]" />
          </div>
          <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-[#800020] border-2 border-[#D4AF37] flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>
        </div>

        {/* Studio Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#800020] text-white border border-[#D4AF37] text-xs sm:text-sm font-bold mb-4 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>반여시장 암실에서 정성껏 현상 중</span>
        </div>

        {/* Current Loading Message */}
        <div className="min-h-[70px] flex items-center justify-center mb-6">
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight transition-all duration-300">
            "{LOADING_MESSAGES[messageIndex]}"
          </p>
        </div>

        {/* Selected Config Pill */}
        {(themeTitle || targetAgeGroup) && (
          <div className="bg-[#2C1810]/90 border border-[#D4AF37]/30 rounded-xl px-4 py-2 mb-6 text-xs sm:text-sm text-white/80">
            <span className="text-[#D4AF37] font-bold">{themeTitle}</span> ·{' '}
            <span>{gender === 'male' ? '남자 스타일' : '여자 스타일'}</span> ·{' '}
            <span className="text-white font-bold">
              {targetAgeGroup ? getAgeGroupTitle(targetAgeGroup) : '20대 시절'}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="w-full max-w-xs bg-[#2C1810] h-3.5 rounded-full overflow-hidden border border-[#D4AF37]/50 p-0.5 mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#800020] via-[#D4AF37] to-[#FFF0B3] rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-white/60">
          고화질 5:7 필름 인화용 사진으로 정밀 제작되고 있습니다…
        </p>
      </div>
    </div>
  );
};
