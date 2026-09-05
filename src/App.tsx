import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { PhotoUploader } from './components/PhotoUploader';
import { ThemeSelector } from './components/ThemeSelector';
import { GenderSelector } from './components/GenderSelector';
import { AgeGroupSelector } from './components/AgeGroupSelector';
import { LoadingScreen } from './components/LoadingScreen';
import { ResultViewer } from './components/ResultViewer';
import { OperatorModal } from './components/OperatorModal';
import { createPrintReadyPhoto } from './utils/photoFormatter';
import { RETRO_THEMES, getAgeGroupTitle } from './constants/themes';
import { ThemeId, Gender, Step, TargetAgeGroup, CustomerCurrentAge, PhotoStudioState } from './types';
import { AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<PhotoStudioState>({
    sourceImage: null,
    selectedTheme: null,
    selectedGender: null,
    targetAgeGroup: '20s',
    currentAgeGroup: '50s',
    generatedImage: null,
    finalPrintImage: null,
    isGenerating: false,
    isSaving: false,
    currentStep: 'upload',
    todayCount: 0,
    errorMessage: null,
    faceValidation: {
      isValid: false,
      faceCount: 0,
      estimatedAge: 50,
      message: '',
      isChecking: false,
    },
  });

  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    saved: boolean;
    driveSaved?: boolean;
    message: string;
    filename?: string;
  } | null>(null);

  // Initialize today's count from localStorage
  useEffect(() => {
    const savedCount = localStorage.getItem('banyeo_studio_today_count');
    if (savedCount) {
      const parsed = parseInt(savedCount, 10);
      if (!isNaN(parsed)) {
        setState((prev) => ({ ...prev, todayCount: parsed }));
      }
    }

    // Ping health check
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.todayCount !== undefined && data.todayCount > 0) {
          setState((prev) => ({ ...prev, todayCount: Math.max(prev.todayCount, data.todayCount) }));
        }
      })
      .catch((err) => console.log('Health check note:', err));
  }, []);

  const updateTodayCount = (newCount: number) => {
    setState((prev) => ({ ...prev, todayCount: newCount }));
    localStorage.setItem('banyeo_studio_today_count', newCount.toString());
  };

  // Helper to map numeric age to age group key
  const mapAgeToGroup = (age?: number): CustomerCurrentAge => {
    if (!age) return '50s';
    if (age >= 80) return '80s';
    if (age >= 70) return '70s';
    if (age >= 60) return '60s';
    if (age >= 50) return '50s';
    if (age >= 40) return '40s';
    return '30s';
  };

  // Handle uploaded/captured photo
  const handleImageSelected = async (imageDataUrl: string) => {
    setState((prev) => ({
      ...prev,
      sourceImage: imageDataUrl,
      faceValidation: {
        isValid: false,
        faceCount: 0,
        message: '얼굴을 확인하고 있습니다…',
        isChecking: true,
      },
      errorMessage: null,
    }));

    try {
      const res = await fetch('/api/check-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl }),
      });

      if (!res.ok) {
        throw new Error('Face check request failed');
      }

      const data = await res.json();
      const mappedAgeGroup = mapAgeToGroup(data.estimatedAge);

      setState((prev) => ({
        ...prev,
        currentAgeGroup: mappedAgeGroup,
        faceValidation: {
          isValid: data.isValid,
          faceCount: data.faceCount,
          estimatedAge: data.estimatedAge || 50,
          message: data.message,
          isChecking: false,
        },
      }));
    } catch (err) {
      console.warn('Face check API fallback:', err);
      setState((prev) => ({
        ...prev,
        faceValidation: {
          isValid: true,
          faceCount: 1,
          estimatedAge: 50,
          message: '얼굴이 확인되었습니다.',
          isChecking: false,
        },
      }));
    }
  };

  // Step transitions
  const handleProceedToTheme = () => {
    setState((prev) => ({ ...prev, currentStep: 'theme' }));
  };

  const handleSelectTheme = (themeId: ThemeId) => {
    setState((prev) => ({
      ...prev,
      selectedTheme: themeId,
      currentStep: 'gender',
    }));
  };

  const handleSelectGender = (gender: Gender) => {
    setState((prev) => ({
      ...prev,
      selectedGender: gender,
      currentStep: 'age',
    }));
  };

  const handleSelectAgeGroup = (ageGroup: TargetAgeGroup) => {
    setState((prev) => ({ ...prev, targetAgeGroup: ageGroup }));
  };

  const handleSelectCurrentAgeGroup = (currentAge: CustomerCurrentAge) => {
    setState((prev) => ({ ...prev, currentAgeGroup: currentAge }));
  };

  // Start Generation
  const handleStartGeneration = async (forcedSeed?: number) => {
    if (!state.sourceImage || !state.selectedTheme || !state.selectedGender) {
      return;
    }

    setState((prev) => ({
      ...prev,
      isGenerating: true,
      currentStep: 'generating',
      errorMessage: null,
      saveStatus: null,
    }));

    try {
      const payload = {
        image: state.sourceImage,
        themeId: state.selectedTheme,
        gender: state.selectedGender,
        targetAgeGroup: state.targetAgeGroup,
        currentAgeGroup: state.currentAgeGroup,
        seed: forcedSeed || Math.floor(Math.random() * 1000000),
      };

      const res = await fetch('/api/generate-retro-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.imageUrl) {
        throw new Error(data.error || '앗, 사진 현상이 잠시 잘 안됐어요. 한 번 더 만들어볼게요.');
      }

      // Convert generated image to 5:7 Print Ready High-Res Photo (1500 x 2100 px)
      const selectedThemeObj = RETRO_THEMES.find((t) => t.id === state.selectedTheme);
      const printReadyDataUrl = await createPrintReadyPhoto(data.imageUrl, {
        themeName: selectedThemeObj?.title,
        targetAgeGroup: state.targetAgeGroup,
        ageGroupText: getAgeGroupTitle(state.targetAgeGroup),
        showStudioStamp: true,
      });

      setState((prev) => ({
        ...prev,
        generatedImage: data.imageUrl,
        finalPrintImage: printReadyDataUrl,
        isGenerating: false,
        currentStep: 'result',
      }));
    } catch (err: any) {
      console.error('Generation failure:', err);
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        currentStep: 'age',
        errorMessage: err.message || '앗, 사진 현상이 잠시 잘 안됐어요. 한 번 더 만들어볼게요.',
      }));
    }
  };

  // Save Photo: Download locally + send to Google Drive storage API
  const handleSavePhoto = async () => {
    if (!state.finalPrintImage) return;

    setState((prev) => ({ ...prev, isSaving: true }));

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const defaultFilename = `반여시장_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.jpg`;

    // 1. Direct browser download so photo is never lost
    try {
      const a = document.createElement('a');
      a.href = state.finalPrintImage;
      a.download = defaultFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (dlErr) {
      console.warn('Browser direct download error:', dlErr);
    }

    // 2. Drive saving backend API
    try {
      const res = await fetch('/api/save-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: state.finalPrintImage,
          timestamp: now.toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        updateTodayCount(data.todayCount || state.todayCount + 1);
        setSaveStatus({
          saved: true,
          driveSaved: data.driveSaved,
          message: '사진관 앨범에 안전하게 저장되었습니다.',
          filename: data.filename || defaultFilename,
        });
      } else {
        updateTodayCount(state.todayCount + 1);
        setSaveStatus({
          saved: false,
          message: '사진관 앨범 저장에 실패했어요. 사진은 아래 버튼으로 바로 내려받을 수 있습니다.',
          filename: defaultFilename,
        });
      }
    } catch (saveErr) {
      console.warn('Drive save API call error:', saveErr);
      updateTodayCount(state.todayCount + 1);
      setSaveStatus({
        saved: false,
        message: '사진관 앨범 저장에 실패했어요. 사진은 아래 버튼으로 바로 내려받을 수 있습니다.',
        filename: defaultFilename,
      });
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  // Next Customer: Complete state and memory reset for customer privacy
  const handleNextCustomer = () => {
    setState((prev) => ({
      ...prev,
      sourceImage: null,
      selectedTheme: null,
      selectedGender: null,
      targetAgeGroup: '20s',
      currentAgeGroup: '50s',
      generatedImage: null,
      finalPrintImage: null,
      isGenerating: false,
      isSaving: false,
      currentStep: 'upload',
      errorMessage: null,
      faceValidation: {
        isValid: false,
        faceCount: 0,
        estimatedAge: 50,
        message: '',
        isChecking: false,
      },
    }));
    setSaveStatus(null);
  };

  const selectedThemeObj = RETRO_THEMES.find((t) => t.id === state.selectedTheme);

  const getStepLabel = (step: Step) => {
    switch (step) {
      case 'upload':
        return 'STEP 1 - 사진 등록';
      case 'theme':
        return 'STEP 2 - 테마 선택';
      case 'gender':
        return 'STEP 3 - 스타일 선택';
      case 'age':
        return 'STEP 4 - 연령대 선택';
      case 'generating':
        return 'STEP 5 - 암실 사진 현상 중';
      case 'result':
        return 'STEP 6 - 추억 사진 완성';
      default:
        return '반여시장 레트로 AI 사진관';
    }
  };

  return (
    <div className="min-h-screen bg-retro-kiosk text-[#2C1810] flex flex-col justify-between selection:bg-[#800020] selection:text-white border-[8px] sm:border-[12px] border-[#4A2C2A]">
      {/* Signboard Header */}
      <Header
        currentStep={state.currentStep}
        todayCount={state.todayCount}
        onOpenOperatorModal={() => setIsOperatorModalOpen(true)}
        onResetToStart={() => {
          if (state.currentStep !== 'upload') {
            handleNextCustomer();
          }
        }}
      />

      {/* Main Studio Work Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col items-center justify-center">
        {/* Error Notification Banner */}
        {state.errorMessage && (
          <div className="w-full max-w-2xl mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
              <p className="font-bold text-sm sm:text-base">{state.errorMessage}</p>
            </div>
            <button
              onClick={() => handleStartGeneration()}
              className="py-1.5 px-3 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#990026] flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> 다시 시도
            </button>
          </div>
        )}

        {/* Step Views with smooth transitions */}
        <AnimatePresence mode="wait">
          {state.currentStep === 'upload' && (
            <motion.div
              key="step-upload"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <PhotoUploader
                sourceImage={state.sourceImage}
                onImageSelected={handleImageSelected}
                onProceedToTheme={handleProceedToTheme}
                faceValidation={state.faceValidation}
                onResetPhoto={() => {
                  setState((prev) => ({
                    ...prev,
                    sourceImage: null,
                    faceValidation: {
                      isValid: false,
                      faceCount: 0,
                      message: '',
                      isChecking: false,
                    },
                  }));
                }}
              />
            </motion.div>
          )}

          {state.currentStep === 'theme' && (
            <motion.div
              key="step-theme"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <ThemeSelector
                selectedTheme={state.selectedTheme}
                onSelectTheme={handleSelectTheme}
                onBack={() => setState((prev) => ({ ...prev, currentStep: 'upload' }))}
              />
            </motion.div>
          )}

          {state.currentStep === 'gender' && (
            <motion.div
              key="step-gender"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <GenderSelector
                selectedGender={state.selectedGender}
                onSelectGender={handleSelectGender}
                onBack={() => setState((prev) => ({ ...prev, currentStep: 'theme' }))}
              />
            </motion.div>
          )}

          {state.currentStep === 'age' && (
            <motion.div
              key="step-age"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full"
            >
              <AgeGroupSelector
                selectedAgeGroup={state.targetAgeGroup}
                onSelectAgeGroup={handleSelectAgeGroup}
                onSubmit={() => handleStartGeneration()}
                onBack={() => setState((prev) => ({ ...prev, currentStep: 'gender' }))}
              />
            </motion.div>
          )}

          {state.currentStep === 'generating' && (
            <motion.div
              key="step-generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <LoadingScreen
                themeTitle={selectedThemeObj?.title}
                gender={state.selectedGender || 'male'}
                targetAgeGroup={state.targetAgeGroup}
              />
            </motion.div>
          )}

          {state.currentStep === 'result' && (
            <motion.div
              key="step-result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <ResultViewer
                sourceImage={state.sourceImage}
                finalPrintImage={state.finalPrintImage}
                theme={selectedThemeObj}
                gender={state.selectedGender}
                targetAgeGroup={state.targetAgeGroup}
                onRegenerate={() => handleStartGeneration(Date.now())}
                onSavePhoto={handleSavePhoto}
                onNextCustomer={handleNextCustomer}
                isSaving={state.isSaving}
                saveStatus={saveStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Immersive Studio Bottom Dock / Status Footer */}
      <footer className="h-20 sm:h-24 bg-[#4A2C2A] text-white flex items-center justify-between px-4 sm:px-12 border-t-2 border-[#D4AF37]/30 select-none">
        {/* Left: Current customer photo thumbnail and step indicator */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white border-2 border-[#D4AF37] rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-md">
            {state.sourceImage ? (
              <img
                src={state.sourceImage}
                alt="현재 손님 사진"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-[10px] text-[#4A2C2A] text-center font-bold leading-tight">
                촬영된<br />사진
              </div>
            )}
          </div>

          <div className="text-xs sm:text-sm font-medium leading-tight">
            <span className="opacity-60 text-[11px] sm:text-xs">현재 진행 단계</span>
            <div className="text-[#D4AF37] font-bold text-sm sm:text-base tracking-tight">
              {getStepLabel(state.currentStep)}
            </div>
          </div>
        </div>

        {/* Right: Quick action / festival info */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {state.currentStep === 'upload' && state.sourceImage && state.faceValidation.isValid && (
            <button
              onClick={handleProceedToTheme}
              className="px-5 sm:px-8 py-2.5 sm:py-3 bg-[#800020] border-2 border-white/20 text-sm sm:text-lg font-bold rounded-lg hover:bg-[#990026] text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <span>테마 선택</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
            </button>
          )}

          {state.currentStep !== 'upload' && state.currentStep !== 'generating' && (
            <button
              onClick={() => {
                if (state.currentStep === 'theme') setState((prev) => ({ ...prev, currentStep: 'upload' }));
                else if (state.currentStep === 'gender') setState((prev) => ({ ...prev, currentStep: 'theme' }));
                else if (state.currentStep === 'age') setState((prev) => ({ ...prev, currentStep: 'gender' }));
              }}
              className="px-3 sm:px-5 py-2 bg-white/10 border border-white/20 text-xs sm:text-sm font-bold rounded-lg hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              이전 단계
            </button>
          )}

          <div className="hidden md:flex flex-col text-right text-[11px] text-white/50">
            <span>2026 반여시장 페스타 공식 포토존</span>
            <span className="text-[#D4AF37]/80">5:7 고화질 인화 지원</span>
          </div>
        </div>
      </footer>

      {/* Operator Settings Modal */}
      <OperatorModal
        isOpen={isOperatorModalOpen}
        onClose={() => setIsOperatorModalOpen(false)}
        todayCount={state.todayCount}
        onUpdateCount={updateTodayCount}
        onSelectSampleImage={(sampleImg) => {
          handleImageSelected(sampleImg);
        }}
      />
    </div>
  );
}
