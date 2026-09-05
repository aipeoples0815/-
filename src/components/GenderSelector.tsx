import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Gender } from '../types';

interface GenderSelectorProps {
  selectedGender: Gender | null;
  onSelectGender: (gender: Gender) => void;
  onBack: () => void;
}

export const GenderSelector: React.FC<GenderSelectorProps> = ({
  selectedGender,
  onSelectGender,
  onBack,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-[#4A2C2A] bg-white border-2 border-[#4A2C2A]/20 hover:border-[#4A2C2A] hover:bg-white shadow-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>테마 다시 선택</span>
        </button>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#2C1810] mb-2 tracking-tight">
          어떤 스타일로 만들어 드릴까요?
        </h2>
        <p className="text-[#4A2C2A]/70 text-base sm:text-lg font-medium">
          원하시는 의상과 스타일을 선택해 주세요.
        </p>
      </div>

      {/* Two Gender Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-3xl">
        {/* Male */}
        <div
          onClick={() => onSelectGender('male')}
          className={`rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 group select-none ${
            selectedGender === 'male'
              ? 'bg-[#800020] border-4 border-[#D4AF37] text-white ring-8 ring-[#800020]/20 shadow-2xl relative scale-[1.02]'
              : 'bg-white border-4 border-[#4A2C2A] text-[#2C1810] hover:bg-[#800020] hover:text-white shadow-xl hover:scale-[1.01]'
          }`}
        >
          {selectedGender === 'male' && (
            <div className="absolute -top-3 -right-3 bg-[#D4AF37] text-[#2C1810] px-4 py-1 font-black text-sm rotate-12 shadow-md rounded-xs">
              선택됨
            </div>
          )}

          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 transition-colors ${
              selectedGender === 'male'
                ? 'bg-white/20'
                : 'bg-[#F5F2ED] group-hover:bg-white/20'
            }`}
          >
            <span className="text-5xl">👨</span>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
              남자 스타일
            </h3>
            <p className="text-sm font-medium opacity-80 mb-4">
              남성 전통/레트로 의상 및 헤어스타일
            </p>
            <span
              className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-xs transition-colors ${
                selectedGender === 'male'
                  ? 'bg-white text-[#800020]'
                  : 'bg-[#D4AF37] text-white group-hover:bg-white group-hover:text-[#800020]'
              }`}
            >
              선택하기
            </span>
          </div>
        </div>

        {/* Female */}
        <div
          onClick={() => onSelectGender('female')}
          className={`rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-between text-center cursor-pointer transition-all duration-200 group select-none ${
            selectedGender === 'female'
              ? 'bg-[#800020] border-4 border-[#D4AF37] text-white ring-8 ring-[#800020]/20 shadow-2xl relative scale-[1.02]'
              : 'bg-white border-4 border-[#4A2C2A] text-[#2C1810] hover:bg-[#800020] hover:text-white shadow-xl hover:scale-[1.01]'
          }`}
        >
          {selectedGender === 'female' && (
            <div className="absolute -top-3 -right-3 bg-[#D4AF37] text-[#2C1810] px-4 py-1 font-black text-sm rotate-12 shadow-md rounded-xs">
              선택됨
            </div>
          )}

          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mb-5 transition-colors ${
              selectedGender === 'female'
                ? 'bg-white/20'
                : 'bg-[#F5F2ED] group-hover:bg-white/20'
            }`}
          >
            <span className="text-5xl">👩</span>
          </div>

          <div>
            <h3 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">
              여자 스타일
            </h3>
            <p className="text-sm font-medium opacity-80 mb-4">
              여성 전통/레트로 의상 및 헤어스타일
            </p>
            <span
              className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-xs transition-colors ${
                selectedGender === 'female'
                  ? 'bg-white text-[#800020]'
                  : 'bg-[#D4AF37] text-white group-hover:bg-white group-hover:text-[#800020]'
              }`}
            >
              선택하기
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
