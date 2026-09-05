import React, { useState } from 'react';
import { X, Sparkles, FolderOpen, RotateCcw, ShieldCheck, Image as ImageIcon } from 'lucide-react';

interface OperatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  todayCount: number;
  onUpdateCount: (count: number) => void;
  onSelectSampleImage?: (sampleDataUrl: string) => void;
}

export const OperatorModal: React.FC<OperatorModalProps> = ({
  isOpen,
  onClose,
  todayCount,
  onUpdateCount,
  onSelectSampleImage,
}) => {
  if (!isOpen) return null;

  // Sample portrait generation helper
  const generateSampleFace = (type: 'senior_man' | 'senior_woman' | 'young_adult') => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, 800);
    grad.addColorStop(0, '#EAE5DF');
    grad.addColorStop(1, '#D5CEC5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 800);

    // Body silhouette
    ctx.fillStyle = type === 'senior_man' ? '#2A3B4C' : type === 'senior_woman' ? '#6B2D5C' : '#3C5233';
    ctx.beginPath();
    ctx.ellipse(300, 720, 240, 200, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#E8BEAC';
    ctx.fillRect(260, 440, 80, 100);

    // Head
    ctx.fillStyle = '#F2CDBE';
    ctx.beginPath();
    ctx.ellipse(300, 360, 120, 150, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = type === 'young_adult' ? '#1A1817' : '#5A5856';
    ctx.beginPath();
    ctx.ellipse(300, 280, 130, 90, 0, Math.PI, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#2C1D11';
    ctx.beginPath();
    ctx.arc(250, 350, 8, 0, Math.PI * 2);
    ctx.arc(350, 350, 8, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = '#3C2D21';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(230, 330);
    ctx.lineTo(270, 335);
    ctx.moveTo(330, 335);
    ctx.lineTo(370, 330);
    ctx.stroke();

    // Nose
    ctx.beginPath();
    ctx.moveTo(300, 355);
    ctx.lineTo(295, 395);
    ctx.lineTo(308, 395);
    ctx.stroke();

    // Smile
    ctx.strokeStyle = '#9C4D3B';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(300, 410, 30, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Badge text
    ctx.fillStyle = '#4A2C2A';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    const label = type === 'senior_man' ? '어르신 (남성) 샘플' : type === 'senior_woman' ? '어르신 (여성) 샘플' : '청년 손님 샘플';
    ctx.fillText(`반여시장 페스타 ${label}`, 300, 100);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    if (onSelectSampleImage) {
      onSelectSampleImage(dataUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#F5F2ED] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-[#4A2C2A] flex flex-col">
        {/* Header */}
        <div className="bg-[#4A2C2A] px-6 py-4 flex items-center justify-between text-white border-b-2 border-[#D4AF37]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-lg font-bold">운영자 관리 모드</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#D4AF37] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Today's Counter Controls */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#4A2C2A]/20 shadow-xs">
            <h4 className="font-bold text-[#2C1810] text-base mb-3 flex items-center gap-2">
              <span>📊 오늘 누적 촬영 인원 관리</span>
            </h4>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-black text-[#800020] px-4 py-2 bg-[#F5F2ED] border-2 border-[#D4AF37] rounded-xl min-w-[90px] text-center">
                {todayCount}명
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateCount(todayCount + 1)}
                    className="flex-1 py-2 px-3 bg-[#4A2C2A] text-white rounded-lg text-xs font-bold hover:bg-[#38201E] cursor-pointer"
                  >
                    +1 추가
                  </button>
                  <button
                    onClick={() => onUpdateCount(Math.max(0, todayCount - 1))}
                    className="flex-1 py-2 px-3 bg-gray-200 text-[#4A2C2A] rounded-lg text-xs font-bold hover:bg-gray-300 cursor-pointer"
                  >
                    -1 차감
                  </button>
                  <button
                    onClick={() => onUpdateCount(0)}
                    className="py-2 px-3 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> 초기화
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Google Drive & Storage Policy */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#4A2C2A]/20 shadow-xs">
            <h4 className="font-bold text-[#2C1810] text-base mb-2 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#800020]" />
              <span>Google Drive 저장 설정</span>
            </h4>
            <div className="text-xs text-[#4A2C2A] space-y-1.5 font-medium">
              <p>• <strong>기본 폴더명:</strong> 반여시장_레트로사진관_2026</p>
              <p>• <strong>파일명 규칙:</strong> YYYYMMDD_HHmmss.jpg</p>
              <p>• <strong>인화 규격:</strong> 1500 × 2100 px (5:7 세로형 고화질 JPEG)</p>
            </div>
          </div>

          {/* Quick Sample Photos for Kiosk Demo */}
          <div className="bg-white p-5 rounded-2xl border-2 border-[#4A2C2A]/20 shadow-xs">
            <h4 className="font-bold text-[#2C1810] text-base mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
              <span>현장 시연용 샘플 사진 불러오기</span>
            </h4>
            <p className="text-xs text-[#4A2C2A]/70 mb-3">
              카메라가 없는 환경이나 부스 테스트 시 샘플 사진을 바로 적용할 수 있습니다.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => generateSampleFace('senior_man')}
                className="py-2.5 px-2 bg-[#F5F2ED] border border-[#4A2C2A]/30 rounded-xl text-xs font-bold text-[#4A2C2A] hover:bg-[#800020] hover:text-white transition-colors cursor-pointer"
              >
                👴 어르신 (남)
              </button>
              <button
                onClick={() => generateSampleFace('senior_woman')}
                className="py-2.5 px-2 bg-[#F5F2ED] border border-[#4A2C2A]/30 rounded-xl text-xs font-bold text-[#4A2C2A] hover:bg-[#800020] hover:text-white transition-colors cursor-pointer"
              >
                👵 어르신 (여)
              </button>
              <button
                onClick={() => generateSampleFace('young_adult')}
                className="py-2.5 px-2 bg-[#F5F2ED] border border-[#4A2C2A]/30 rounded-xl text-xs font-bold text-[#4A2C2A] hover:bg-[#800020] hover:text-white transition-colors cursor-pointer"
              >
                🧑 청년 손님
              </button>
            </div>
          </div>

          {/* Privacy & Safety Guide */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 mb-0.5">개인정보 보호 정책</p>
              <p>
                촬영 원본 사진은 브라우저 메모리에만 일시 보관되며, "다음 손님"을 누르면 즉시 폐기됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F5F2ED] border-t border-[#4A2C2A]/20 text-right">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-[#4A2C2A] text-white font-bold text-sm hover:bg-[#38201E] cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
