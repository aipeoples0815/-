import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { RETRO_THEMES } from '../constants/themes';
import { ThemeId } from '../types';

interface ThemeSelectorProps {
  selectedTheme: ThemeId | null;
  onSelectTheme: (themeId: ThemeId) => void;
  onBack: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  selectedTheme,
  onSelectTheme,
  onBack,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-[#4A2C2A] bg-white border-2 border-[#4A2C2A]/20 hover:border-[#4A2C2A] hover:bg-white shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>사진 다시 찍기</span>
        </button>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mb-2 tracking-tight">
          어떤 추억 속으로 떠나볼까요?
        </h2>
        <p className="text-[#4A2C2A]/70 text-base sm:text-lg font-medium">
          원하시는 테마를 하나 선택해 주세요.
        </p>
      </div>

      {/* 5 Theme Grid matching Immersive UI Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full max-w-6xl">
        {RETRO_THEMES.map((theme) => {
          const isSelected = selectedTheme === theme.id;

          return (
            <div
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 group select-none ${
                isSelected
                  ? 'bg-[#800020] border-4 border-[#D4AF37] text-white ring-6 ring-[#800020]/20 shadow-2xl relative scale-[1.02]'
                  : 'bg-white border-4 border-[#4A2C2A] text-[#2C1810] hover:bg-[#800020] hover:text-white shadow-xl hover:scale-[1.01]'
              }`}
            >
              {/* Selected Gold Ribbon */}
              {isSelected && (
                <div className="absolute -top-3 -right-3 bg-[#D4AF37] text-[#2C1810] px-3.5 py-0.5 font-black text-xs rotate-12 shadow-md rounded-xs">
                  선택됨
                </div>
              )}

              {/* Icon Bubble */}
              <div
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center mb-3.5 transition-colors ${
                  isSelected
                    ? 'bg-white/20'
                    : 'bg-[#F5F2ED] group-hover:bg-white/20'
                }`}
              >
                <span className="text-3xl sm:text-4xl">{theme.icon}</span>
              </div>

              {/* Text Info */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <h3 className="text-xl sm:text-2xl font-bold mb-1 tracking-tight">
                  {theme.title}
                </h3>
                <p
                  className={`text-xs sm:text-sm mb-3 font-medium ${
                    isSelected ? 'opacity-90' : 'opacity-75 group-hover:opacity-90'
                  }`}
                >
                  {theme.subtitle}
                </p>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full shadow-xs transition-colors ${
                    isSelected
                      ? 'bg-white text-[#800020]'
                      : 'bg-[#D4AF37] text-white group-hover:bg-white group-hover:text-[#800020]'
                  }`}
                >
                  {theme.recommendation}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
