import React from 'react';
import { ArrowLeft, Sparkles, Check, HeartHandshake, Calendar } from 'lucide-react';
import { TargetAgeGroup } from '../types';
import { AGE_GROUP_OPTIONS } from '../constants/themes';

interface AgeGroupSelectorProps {
  selectedAgeGroup: TargetAgeGroup;
  onSelectAgeGroup: (ageGroup: TargetAgeGroup) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export const AgeGroupSelector: React.FC<AgeGroupSelectorProps> = ({
  selectedAgeGroup,
  onSelectAgeGroup,
  onSubmit,
  onBack,
}) => {
  // Precision de-aging narrative matching the exact master prompt
  const getDeAgingNarrative = () => {
    if (selectedAgeGroup === '10s') {
      return {
        highlight: `10대 학창 시절 (만 16~18세) 정밀 복원`,
        detail: `본인의 고유 이목구비(60%)는 유지하되, 나이 들어 보이게 만드는 모든 노화 요소를 100% 제거하고 10대 특유의 앳되고 도톰한 볼살(Cheek volume)과 매끄럽고 맑은 피부 톤, 초롱초롱한 눈망울로 정밀 리바이탈라이징합니다.`,
      };
    } else if (selectedAgeGroup === '20s') {
      return {
        highlight: `20대 꽃청춘 리즈 시절 (만 20~23세) 정밀 복원`,
        detail: `본인의 이목구비(60%)는 유지하되, 나이 들어 보이게 만드는 피부 노화 요소(눈 밑 눈물고랑, 다크서클, 꺼진 눈두덩이, 볼패임)를 100% 제거하고 20대 특유의 도톰한 볼륨감과 탄력 있고 맑은 피부 톤으로 정밀 리바이탈라이징합니다.`,
      };
    } else if (selectedAgeGroup === '30s') {
      return {
        highlight: `30대 당당한 전성기 (만 30~34세) 정밀 복원`,
        detail: `본인의 이목구비(60%)는 유지하되, 피로선과 주름을 제거하고 30대 특유의 생기 있고 매끄럽고 맑은 피부 톤과 세련된 카리스마로 정밀 리바이탈라이징합니다.`,
      };
    } else if (selectedAgeGroup === '40s') {
      return {
        highlight: `40대 품격 있는 원숙미 (만 40~44세) 리바이탈라이징`,
        detail: `깊은 주름과 피로는 자연스럽게 완화하되 본인 고유의 인상을 60% 이상 보존하여 약 10~15년 더 젊고 생기 있는 품격 화보로 완성합니다.`,
      };
    } else if (selectedAgeGroup === '50s') {
      return {
        highlight: `50대 이상 온화하고 멋진 모습 (만 50~55세) 리바이탈라이징`,
        detail: `깊은 주름과 피로는 자연스럽게 완화하되 본인 고유의 인상과 따뜻한 미소를 보존하여 약 10~15년 더 젊고 중후한 명품 화보로 완성합니다.`,
      };
    } else {
      return {
        highlight: `현재 모습 최고급 명품 스튜디오 보정`,
        detail: `손님 고유의 인상과 미소를 100% 보존하면서 화사하고 품격 있는 최고급 마스터 스튜디오 리터칭으로 완성합니다.`,
      };
    }
  };

  const narrative = getDeAgingNarrative();

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full flex items-center justify-between mb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-[#4A2C2A] bg-white border-2 border-[#4A2C2A]/20 hover:border-[#4A2C2A] hover:bg-white shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>스타일 다시 선택</span>
        </button>
      </div>

      {/* Heading */}
      <div className="text-center mb-5">
        <h2 className="text-3xl sm:text-4xl font-black text-[#800020] mb-1 tracking-tight font-serif-display">
          어느 시절의 내 모습으로 돌아갈까요?
        </h2>
        <p className="text-[#4A2C2A]/85 text-sm sm:text-base font-medium">
          되돌아가고 싶은 연령대를 선택하시면 40년 전통 동명사진관의 명품 화보로 완성해 드립니다.
        </p>
      </div>

      {/* Main Container */}
      <div className="w-full bg-white rounded-2xl border-4 border-[#4A2C2A] p-4 sm:p-7 shadow-xl flex flex-col items-center">
        {/* Title */}
        <div className="w-full mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#800020]" />
            <span className="text-sm sm:text-base font-black text-[#2C1810]">
              되돌아가고 싶은 찬란한 시절을 선택해 주세요:
            </span>
          </div>
        </div>

        {/* Target Age Group Cards Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
          {AGE_GROUP_OPTIONS.map((opt) => {
            const isSelected = selectedAgeGroup === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onSelectAgeGroup(opt.id)}
                className={`relative p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border-3 ${
                  isSelected
                    ? 'bg-[#800020] text-white border-[#D4AF37] shadow-xl scale-[1.03] ring-4 ring-[#800020]/20'
                    : 'bg-[#F5F2ED] text-[#2C1810] border-[#4A2C2A]/30 hover:border-[#800020] hover:bg-white'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between w-full mb-2">
                  <span
                    className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-[#D4AF37] text-[#2C1810] border-[#D4AF37]'
                        : 'bg-white text-[#4A2C2A] border-[#4A2C2A]/20'
                    }`}
                  >
                    {opt.badge}
                  </span>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#2C1810] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Age Label & Target Exact Age */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className={`text-2xl sm:text-3xl font-black tracking-tight ${
                        isSelected ? 'text-white' : 'text-[#800020]'
                      }`}
                    >
                      {opt.label}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isSelected ? 'text-[#D4AF37]' : 'text-[#800020]/70'
                      }`}
                    >
                      ({opt.targetExactAge})
                    </span>
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-bold block ${
                      isSelected ? 'text-[#D4AF37]' : 'text-[#4A2C2A]'
                    }`}
                  >
                    {opt.sublabel}
                  </span>
                </div>

                {/* Description */}
                <p
                  className={`text-[11px] sm:text-xs leading-snug ${
                    isSelected ? 'text-white/90' : 'text-[#4A2C2A]/75'
                  }`}
                >
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Dynamic De-aging Calculator Banner */}
        <div className="w-full p-4 rounded-xl bg-[#F5F2ED] border-2 border-[#D4AF37] text-left mb-6 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#800020] text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-black text-[#800020] mb-0.5">
              🎯 {narrative.highlight}
            </p>
            <p className="text-xs sm:text-sm text-[#4A2C2A] leading-relaxed">
              {narrative.detail}
            </p>
          </div>
        </div>

        {/* Huge Primary CTA Button */}
        <button
          onClick={onSubmit}
          className="w-full py-4 sm:py-5 px-8 rounded-xl bg-[#800020] text-white border-4 border-[#D4AF37] font-black text-xl sm:text-2xl hover:bg-[#990026] hover:scale-[1.01] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer"
        >
          <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#D4AF37] animate-spin" />
          <span>✨ 진짜 그 시절 얼굴로 사진 만들기</span>
        </button>
      </div>
    </div>
  );
};
