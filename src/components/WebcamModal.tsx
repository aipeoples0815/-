import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, Timer } from 'lucide-react';

interface WebcamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const WebcamModal: React.FC<WebcamModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start camera stream
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCountdown(null);
      return;
    }

    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode: 'user' | 'environment') => {
    stopCamera();
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('카메라에 접근할 수 없습니다. 브라우저 권한을 확인해주세요.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const triggerCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // If front camera, flip horizontally for natural mirror feel
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setCapturedImage(dataUrl);
    }
  };

  const handleStartCountdown = () => {
    if (countdown !== null) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setTimeout(() => {
            triggerCapture();
            setCountdown(null);
          }, 100);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="bg-[#FAF7F2] rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border-4 border-[#C5A059] flex flex-col">
        {/* Header */}
        <div className="bg-[#3C2A21] px-5 py-3.5 flex items-center justify-between text-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#C5A059]" />
            <h3 className="text-lg font-bold">사진 촬영하기</h3>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#D8C7B5] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-[#FAF7F2]">
              <p className="text-base text-red-400 font-medium mb-3">{cameraError}</p>
              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-[#6B1D2F] text-white rounded-lg text-sm font-semibold"
              >
                다시 시도하기
              </button>
            </div>
          ) : capturedImage ? (
            <img
              src={capturedImage}
              alt="촬영된 사진"
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? '-scale-x-100' : ''
                }`}
              />

              {/* Face Guide Oval */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-52 h-72 rounded-[50%] border-2 border-dashed border-[#C5A059]/70 shadow-[0_0_20px_rgba(197,160,89,0.3)] flex flex-col items-center justify-between py-6">
                  <span className="text-[11px] font-medium text-white/90 bg-black/60 px-2 py-0.5 rounded-full">
                    얼굴을 가이드에 맞춰주세요
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                </div>
              </div>

              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#6B1D2F] text-[#FAF7F2] border-4 border-[#C5A059] flex items-center justify-center text-5xl font-black animate-pulse shadow-2xl">
                    {countdown}
                  </div>
                </div>
              )}

              {/* Flash animation */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white transition-opacity duration-200" />
              )}
            </>
          )}

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-[#FAF7F2] flex items-center justify-between border-t border-[#E8DFD5]">
          {capturedImage ? (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 py-3.5 px-4 rounded-xl border-2 border-[#8C7A6B] bg-white text-[#3C2A21] font-bold text-base hover:bg-[#F3EAD8] flex items-center justify-center gap-2 shadow-sm"
              >
                <RefreshCw className="w-5 h-5" />
                다시 찍기
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3.5 px-4 rounded-xl bg-[#6B1D2F] text-[#FAF7F2] border-2 border-[#C5A059] font-bold text-base hover:bg-[#800020] flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
              >
                <Check className="w-5 h-5 text-[#C5A059]" />
                이 사진으로 사용하기
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-3">
              <button
                onClick={toggleFacingMode}
                className="p-3 rounded-xl border border-[#D8C7B5] bg-white text-[#4A3B32] hover:bg-[#F3EAD8]"
                title="카메라 전환"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={handleStartCountdown}
                disabled={countdown !== null}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#6B1D2F] text-white border-2 border-[#C5A059] font-bold text-lg hover:bg-[#800020] flex items-center justify-center gap-2 shadow-md hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Camera className="w-6 h-6 text-[#C5A059]" />
                {countdown !== null ? '촬영 준비 중...' : '3초 타이머 촬영'}
              </button>

              <button
                onClick={triggerCapture}
                className="py-3.5 px-4 rounded-xl border-2 border-[#3C2A21] bg-white text-[#3C2A21] font-bold text-sm hover:bg-[#F3EAD8]"
                title="즉시 촬영"
              >
                즉시 촬영
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
