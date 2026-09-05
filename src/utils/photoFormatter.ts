import { TargetAgeGroup } from '../types';
import { getAgeGroupTitle } from '../constants/themes';

/**
 * Generates a 5:7 print-ready high-resolution photo (1500 x 2100 px)
 * with a classic 2~3% white border, smart center crop with head clearance,
 * and subtle vintage photo studio markings.
 */
export async function createPrintReadyPhoto(
  imageSrc: string,
  options: {
    themeName?: string;
    targetAgeGroup?: TargetAgeGroup;
    ageGroupText?: string;
    showStudioStamp?: boolean;
  } = {}
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const TARGET_WIDTH = 1500;
        const TARGET_HEIGHT = 2100;

        const canvas = document.createElement('canvas');
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }

        // Fill background with warm studio photo paper white
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

        // Calculate 2.5% border margin
        const marginX = Math.round(TARGET_WIDTH * 0.028); // ~42px
        const marginY = Math.round(TARGET_HEIGHT * 0.028); // ~58px
        const bottomMarginExtra = options.showStudioStamp !== false ? 60 : 0;

        const innerWidth = TARGET_WIDTH - marginX * 2;
        const innerHeight = TARGET_HEIGHT - marginY * 2 - bottomMarginExtra;

        // Smart Crop calculation to fill innerWidth x innerHeight maintaining 5:7 ratio
        const imgAspect = img.width / img.height;
        const targetAspect = innerWidth / innerHeight;

        let srcX = 0;
        let srcY = 0;
        let srcWidth = img.width;
        let srcHeight = img.height;

        if (imgAspect > targetAspect) {
          // Source image is wider than target -> crop sides
          srcWidth = img.height * targetAspect;
          srcX = (img.width - srcWidth) / 2;
        } else {
          // Source image is taller than target -> prioritize keeping upper portion (head clearance)
          srcHeight = img.width / targetAspect;
          // Offset slightly toward the top for natural portrait head clearance
          srcY = Math.max(0, (img.height - srcHeight) * 0.22);
        }

        // Draw image onto inner canvas area
        ctx.drawImage(
          img,
          srcX,
          srcY,
          srcWidth,
          srcHeight,
          marginX,
          marginY,
          innerWidth,
          innerHeight
        );

        // Draw inner subtle border around photo
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 2;
        ctx.strokeRect(marginX, marginY, innerWidth, innerHeight);

        // Draw vintage studio bottom stamp if enabled
        if (options.showStudioStamp !== false) {
          const stampY = TARGET_HEIGHT - marginY / 2 - 14;

          ctx.font = '600 24px sans-serif';
          ctx.fillStyle = '#4A3B32';
          ctx.textAlign = 'center';
          ctx.letterSpacing = '2px';

          const year = new Date().getFullYear();
          const ageText = options.ageGroupText || (options.targetAgeGroup ? getAgeGroupTitle(options.targetAgeGroup) : '꽃청춘 시절');
          const subtitleText = `그 시절의 나를 다시 만나다 (${ageText})`;

          ctx.fillText(`반여시장 레트로 AI 사진관 · ${year}`, TARGET_WIDTH / 2, stampY - 14);

          ctx.font = '400 16px sans-serif';
          ctx.fillStyle = '#8C7A6B';
          ctx.fillText(subtitleText, TARGET_WIDTH / 2, stampY + 12);
        }

        // Ultra thin cutting guide marks at the 4 corners
        ctx.strokeStyle = '#E0D8D0';
        ctx.lineWidth = 1;
        const guideLen = 16;
        // Top-left
        ctx.beginPath();
        ctx.moveTo(8, 8);
        ctx.lineTo(8 + guideLen, 8);
        ctx.moveTo(8, 8);
        ctx.lineTo(8, 8 + guideLen);
        // Top-right
        ctx.moveTo(TARGET_WIDTH - 8, 8);
        ctx.lineTo(TARGET_WIDTH - 8 - guideLen, 8);
        ctx.moveTo(TARGET_WIDTH - 8, 8);
        ctx.lineTo(TARGET_WIDTH - 8, 8 + guideLen);
        // Bottom-left
        ctx.moveTo(8, TARGET_HEIGHT - 8);
        ctx.lineTo(8 + guideLen, TARGET_HEIGHT - 8);
        ctx.moveTo(8, TARGET_HEIGHT - 8);
        ctx.lineTo(8, TARGET_HEIGHT - 8 - guideLen);
        // Bottom-right
        ctx.moveTo(TARGET_WIDTH - 8, TARGET_HEIGHT - 8);
        ctx.lineTo(TARGET_WIDTH - 8 - guideLen, TARGET_HEIGHT - 8);
        ctx.moveTo(TARGET_WIDTH - 8, TARGET_HEIGHT - 8);
        ctx.lineTo(TARGET_WIDTH - 8, TARGET_HEIGHT - 8 - guideLen);
        ctx.stroke();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
}
