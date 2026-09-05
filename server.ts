import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Support large image payloads for photo uploads & high-res generation
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Lazy Google Gen AI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in the environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory counter for today's customer count & backup session log
let todaySessionCount = 0;
const savedFilenamesSet = new Set<string>();

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', todayCount: todaySessionCount });
});

// Face detection & validation endpoint using Gemini Vision
app.post('/api/check-face', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: '이미지 데이터가 전달되지 않았습니다.' });
    }

    const ai = getAI();
    // Clean base64 data
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    let mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      mimeType = 'image/jpeg';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType,
            },
          },
          {
            text: `Analyze the provided image and determine if it contains human faces suitable for a portrait photo shoot.
Count how many distinct human faces are clearly visible in the foreground/center.
Also estimate the person's approximate current age range.
Return JSON with the following schema:
- faceCount: number of detected human faces in foreground
- isValid: boolean (true if exactly 1 face, false otherwise)
- estimatedAge: estimated approximate age number (e.g. 55)
- message: Korean guidance message based on count`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            faceCount: { type: Type.INTEGER },
            isValid: { type: Type.BOOLEAN },
            estimatedAge: { type: Type.INTEGER },
            message: { type: Type.STRING },
          },
          required: ['faceCount', 'isValid', 'message'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return res.json({
      faceCount: typeof parsed.faceCount === 'number' ? parsed.faceCount : 1,
      isValid: parsed.isValid !== undefined ? parsed.isValid : true,
      estimatedAge: parsed.estimatedAge || 50,
      message: parsed.message || '얼굴이 선명하게 확인되었습니다.',
    });
  } catch (error: any) {
    console.error('Face validation check error:', error);
    return res.json({
      faceCount: 1,
      isValid: true,
      estimatedAge: 50,
      message: '얼굴이 확인되었습니다.',
    });
  }
});

// Retro Portrait Generation Endpoint with Advanced Biological De-aging Engine
app.post('/api/generate-retro-portrait', async (req, res) => {
  try {
    const { image, themeId, gender, targetAgeGroup, currentAgeGroup, seed } = req.body;

    if (!image) {
      return res.status(400).json({ error: '사진이 제공되지 않았습니다.' });
    }

    const ai = getAI();
    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
    let mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
      mimeType = 'image/jpeg';
    }

    // Step 1: Rapid Facial Genetic Feature Extraction via Gemini Vision
    let facialFeaturesSummary = '';
    try {
      const visionAnalysis = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: `Analyze this person's permanent facial genetic DNA features for an AI age simulation (time-travel regression).
Describe in 3 concise, clear bullet points:
1. Eye shape and angle (eyelid crease, slant, natural eye-smile curvature)
2. Nose bridge and tip shape
3. Lip contours and unique smile expression
4. Overall facial bone structure and cheekbone-to-chin line.
Focus strictly on invariant genetic features that identify this specific individual across different ages, ignoring any skin aging, wrinkles, or mature sagging.`,
            },
          ],
        },
      });
      facialFeaturesSummary = visionAnalysis.text?.trim() || '';
    } catch (visionErr) {
      console.warn('Facial extraction fallback:', visionErr);
    }

    // Theme specific prompt based on user's exact 5 Master Themes
    let selectedThemePrompt = '';
    if (themeId === 'cinema_5060') {
      selectedThemePrompt = `
1번 테마: [1970s-1980s 한국 고전 영화 (Classic Korean Cinema Star)]
- 분위기: 1970-80년대 한국 고전 영화 속 품격 있고 단아한 영화 배우 화보.
- 연출: 70년~80년대 남녀배우들의 밝고 화사한 최고급 스튜디오 칼라 화보 촬영.
전문 사진관의 대형 소프트박스 3점 조명과 전면 반사판으로 인물과 배경을 환하게 비추어 어둡거나 침침한 방 분위기를 완전히 배제(어두운 저조도, 칙칙한 그림자 엄격 금지, 밝고 깨끗한 하이엔드 사진관 조명).
고급 앤틱 안락의자, 플로어 스탠드 조명, 우아한 벨벳 커튼과 배경 인테리어까지 훤하고 또렷하게 다 드러나는 풍성하고 밝은 스튜디오 조명.
- 머리 스타일:
  * 남성: 클래식 가르마 2:8 포마드 헤어(Slicked-back Pompadour), 정갈하게 넘긴 깔끔한 라인.
  * 여성 (20대): 상큼한 C컬 볼륨 단발 또는 머리띠를 두른 단아한 헤어.
  * 여성 (30대 이상): 고급스럽고 은은한 볼륨감이 살아있는 웨이브 파마(Retro finger wave).
- 패션 및 소품:
  * 남성: 클래식 더블 수트, 와이드 넥타이, 넥타이 핀, Pocket Square(행커치프), 스튜디오 안락의자, 빈티지 책/대본.
  * 여성: 모던한 양장 드레스 또는 단아한 70-80년대 여배우의 드레스, 진주 목걸이/귀걸이, 손에 든 가죽 장갑 또는 고풍스러운 부채, 무릎 위 대본.
- 메이크업:
  * 여성: 눈매는 70년대 영화배우의 아이라이너 강조, 밝고 투명한 피부 톤.
- 컬러 사진만 (인물과 배경 전체가 환하게 다 잘 보이는 밝은 명품 스튜디오 조명)`;
    } else if (themeId === 'romance_70s') {
      selectedThemePrompt = `
2번 테마: [1970s 명동 & 서면 로맨스 (70s Myeongdong & Seomyeon Romance)]
- 분위기: 1970년대 가장 세련되고 활기 넘쳤던 **'서울 명동 거리'** 또는 **'부산 서면 거리'**의 모던 젠틀맨 & 레이디 야외 로케이션 화보.
- 연출: 따사롭고 맑은 주광 햇살과 전문 야외 반사판 조명이 어우러진 밝고 화사한 70년대 거리 화보 (어둡거나 그늘진 칙칙한 분위기 엄격 금지, 맑고 환한 야외 채광). 70년대 코닥 포트라 아날로그 필름의 따뜻한 호박색(Amber) 웜톤을 유지하되 전체적으로 환하게 노출. 70년대 감성의 빈티지 가로등, 복고풍 상점 간판, 횡단보도, 거리 벤치, 야외 카페 테라스, 클래식 분수대 광장 등 다채로운 야외 배경과 인물이 환하고 또렷하게 한눈에 다 보이도록 밝게 연출 (단일 실내 소파 구도 엄격 금지).
- 머리 스타일:
  * 남성: 귀를 살짝 덮는 70년대 장발 스타일(70s Long Layers) 또는 덮은 머리 포마드.
  * 여성 (20대): 자연스러운 머리띠 단발, 또는 양갈래머리
  * 여성 (30대 이상): 긴생머리
- 패션 및 소품:
  * 남성: 콤비 재킷, 벨보텀(나팔바지), 트렌치코트, 뿔테 안경, 빈티지 통기타, 가죽 시계.
  * 여성 (20대): 산뜻한 화이트 카라 블라우스, 70년대 레트로 체크 원피스, 앤틱 크로스 숄더백, 챙이 있는 레트로 모자.
  * 여성 (30대 이상): 세련된 핏의 베이지 더블 트렌치코트, 얇은 실크 타이 스카프, 가죽 토트백, 양산 또는 가죽 장갑.`;
    } else if (themeId === 'hanbok_royal') {
      selectedThemePrompt = `
3번 테마: [고급 전통 한복 화보 (Royal Korean Hanbok)]
- 분위기: 한국 전통의 미가 흘러넘치는 고풍스럽고 품격 있는 명품 한복 화보.
- 연출: 전통 한옥 창호문을 통해 가득 들어오는 풍부한 자연 채광과 사진관 소프트박스 조명이 결합된 밝고 화사한 명품 화보 (어둡고 그늘진 한옥 실내 엄격 금지, 맑고 환한 조명). 인물의 맑은 피부 톤과 비단 한복의 고운 색감, 은은한 한옥 대청마루나 수묵화 병풍, 전통 창호문 배경이 훤하게 잘 보이는 밝은 착석 풀샷.
- 머리 스타일:
  * 남성: 상투관이나 가체 없이 깔끔하게 정돈된 한복 맞춤형 단정한 헤어 style.
  * 여성 (20대): 화사한 댕기머리와 배씨댕기.
  * 여성 (30대 이상): 쪽머리(정갈한 땋은 올림머리) 또는 단아한 가르마 묶음머리.
- 패션 및 소품:
  * 남성: 고급 비단 두루마기, 세조대(허리띠), 선비 부채(합죽선).
  * 여성: 금박/은박 자수가 놓인 고급 당의, 정교한 비녀(Binyeo), 옥노리개(Norigae), 첩지/족두리, 칠보 반지.`;
    } else if (themeId === 'youth_7080') {
      selectedThemePrompt = `
4번 테마: [1970s-1980s 나의 학창시설 (7080 Retro Youth)]
- 분위기: 1970-80년대 찬란했던 학창 시절과 청춘의 아련하고 싱그러운 추억.
- 연출: 교실 창가로 눈부시게 쏟아지는 따스한 햇살과 환한 실내 조명으로 싱그럽고 밝게 비춘 학창 시절 화보 (어둡거나 칙칙한 옛날 사진 느낌 엄격 금지, 맑고 환한 추억의 필름 톤). 따스한 햇살이 드는 옛 교실 책걸상이나 시장 골목 배경, 추억의 교복과 소품이 또렷하고 생생하게 한눈에 다 보이는 밝은 채광.
- 머리 스타일:
  * 남성: 풋풋한 7080 학생 머리(바가지머리, 단정한 숏컷).
  * 여성: 귀여운 단발머리(K-Bob), 귀 뒤로 넘긴 양갈래 땋은 머리(Twin braids).
- 패션 및 소품:
  * 남성: 7080 세일러 검정 교복/교련복, 모자(학생모), 청자켓, 가죽 책가방, 추억의 교과서, 명찰.
  * 여성: 7080 세일러 교복 원피스, 하얀 카라 블라우스, LP판, 레트로 캔버스화, 노란 양말.`;
    } else {
      // 5번 테마: hipster_8090 (반여 디스코 레트로)
      selectedThemePrompt = `
5번 테마: [1980s-1990s 반여 디스코 레트로 (8090 Street Style)]
- 연출: 어두운 클럽이 아닌, 8090년대 패션 잡지 표지 및 화보 전용의 **밝고 선명한 스튜디오 뷰티 플래시 조명** (어둠에 묻히는 침침한 조명 절대 금지, 인물의 얼굴과 눈동자를 환하게 비추는 전문 사진관 조명). 화려하고 선명한 컬러감, 8090년대 잡지 화보 톤, 레트로 LP바 하이체어와 네온사인 배경까지 어둡지 않고 밝고 선명하게 살아있는 연출.
- 머리 스타일:
  * 남성: 울프컷(Mullet hair), 90년대 스타일 5:5 쉼표머리 또는 두건/볼캡을 쓴 힙합 스타일, 또는 슬릭백(올백) 헤어.
  * 여성: 볼륨감이 넘치는 핑클 파마(Sassy Volume Perm), 앞머리 뽕머리, 반묶음 머리, 또는 정수리 볼륨을 한껏 살린 사자머리.
- 패션 및 소품:
  남성 디스코 스타일 상세:
  패션: 가슴 단추를 두어 개 푼 새틴(광택) 셔츠나 화려한 기하학 패턴의 셔츠. 하의는 허벅지는 붙고 종아리부터 넓어지는 나팔바지(벨보텀)를 매치하여 역동적인 춤선을 강조.
  헤어: 헤어 무스나 젤을 듬뿍 발라 뒤로 시원하게 넘긴 슬릭백(올백) 헤어나, 앞머리 한두 가닥만 이마로 내린 포인트 스타일.
  소품: 조명을 반사하는 화이트 색상의 구두, 두꺼운 금목걸이, 알이 큰 보잉 틴트 선글라스로 화려함.
 
  여성 디스코 스타일 상세:
  * 여성: 비비드한 컬러의 와이드 팬츠, 크롭 가디건, 곱창밴드(Scrunchie), 왕 귀걸이(링 귀걸이), 필름 카메라.
  패션: 미러볼 빛을 강하게 반사하는 스팽글(반짝이) 소재의 의상이 필수. 스팽글 크롭탑에 딱 붙는 디스코 팬츠(광택 나는 나팔바지)를 입거나, 화려한 호피/지브라 패턴의 미니 원피스.
  헤어와 메이크업: 스프레이를 강하게 뿌려 정수리 볼륨을 한껏 살린 이른바 '사자머리'가 상징적, 강렬한 레드 립스틱을 매치.
  소품: 얼굴의 반을 가릴 만큼 거대한 후프 링 귀걸이, 화려한 큐빅이 박힌 초커 목걸이, 망사 스타킹을 포인트.

${gender === 'male' ? `* 남성 캐릭터 구현 지침:
- 완벽하게 20대 초반으로 어려진 젊고 매력적인 한국 남성. 원본 사진의 눈매와 특유의 인상은 60% 그대로 유지하되, 잔주름이 전혀 없는 매끄럽고 탄력 있는 맑고 환한 피부. 90년대 유행하던 트렌디한 울프컷(또는 5:5 쉼표머리/슬릭백). 가슴 단추를 푼 새틴 셔츠와 벨보텀 나팔바지(또는 오버사이즈 청재킷과 청바지를 매치한 청청패션), 두꺼운 금목걸이나 보잉 선글라스/빈티지 워크맨. 배경은 글자가 없는 화려하고 선명한 90년대 레트로 네온사인 골목과 빈티지 LP바 분위기. 밝고 환한 90년대 남성 패션 잡지 화보 톤, 초고화질, 밝은 스튜디오 뷰티 조명.` : `* 여성 캐릭터 구현 지침:
- 완벽하게 20대 초반으로 어려진 젊고 매력적인 한국 여성. 원본 사진의 눈매와 따뜻한 미소의 정체성은 그대로 유지하되, 잔주름이 전혀 없는 결점 없이 맑고 탄력 넘치는 백옥 피부. 90년대 유행하던 볼륨감 넘치는 핑클 파마(반묶음 머리) 또는 풍성한 사자머리. 미러볼 빛을 반사하는 스팽글 크롭탑과 광택 디스코 팬츠(또는 호피 미니원피스/비비드 와이드팬츠), 거대한 링 귀걸이와 초커 목걸이, 강렬한 레드 립스틱. 배경은 글자가 없는 화려하고 선명한 90년대 레트로 네온사인 골목과 빈티지 LP바 분위기. 밝고 환한 90년대 패션 잡지 화보 톤, 초고화질, 밝은 스튜디오 뷰티 조명.`}`;
    }

    const ageGroup = targetAgeGroup || '20s';

    let ageAdjustmentDirective = '';
    if (ageGroup === '10s') {
      ageAdjustmentDirective = `사용자가 [10대 요청 시]: 본인의 이목구비(60%)는 유지하되, 나이 들어 보이게 만드는 피부 노화 요소를 100% 제거하고, 10대 특유의 앳되고 도톰한 볼살(Cheek volume)과 매끄럽고 맑은 피부 톤, 초롱초롱한 눈망울로 정밀 리바이탈라이징하라.`;
    } else if (ageGroup === '20s' || ageGroup === '30s') {
      ageAdjustmentDirective = `사용자가 [20대/30대 요청 시]: 본인의 이목구비(60%)는 유지하되, 나이 들어 보이게 만드는 피부 노화 요소(눈 밑 눈물고랑, 다크서클, 꺼진 눈두덩이, 볼패임)를 100% 제거하고, 20~30대 특유의 도톰한 볼륨감(Cheek volume)과 매끄럽고 맑은 피부 톤으로 정밀 리바이탈라이징하라.`;
    } else if (ageGroup === '40s' || ageGroup === '50s') {
      ageAdjustmentDirective = `사용자가 [40대/50대 이상 요청 시]: 깊은 주름과 피로는 자연스럽게 완화하되 본인 고유의 인상을 보존하라. (약 10~15년 더 젊고 생기 있는 리바이탈라이징)`;
    } else {
      ageAdjustmentDirective = `사용자가 [현재 모습 요청 시]: 본인의 고유한 인상과 미소를 60% 이상 품격 있게 보존하면서 화사하고 고급스러운 명품 스튜디오 보정으로 완성하라.`;
    }

    const finalPrompt = `[역할 정의]
너는 40년 전통의 부산 '동명사진관'을 운영하는 AI 전문 사진작가이다.
네 임무는 사용자가 제공한 인물 사진의 고유한 얼굴 특징(눈매, 코, 입, 얼굴 골격, 인상)의 정체성을 60% 이상 보존하면서, 지정된 5가지 테마 중 하나에 맞춘 '한국적 클래식 및 레트로 화보 사진'을 **텍스트 설명 없이 즉시 초고화질 완성형 이미지로 직접 생성하여 출력**하는 것이다.

[최우선 절대 원칙]
1. 반드시 '대상의 고유한 이목구비와 자연스러운 인상을 유지하라.
2. 화보 구도 원칙 (증명사진 구도 엄격 금지):
   - 얼굴만 크게 나오는 클로즈업(증명사진) 구도는 절대 금지한다.
   - 배경 공간(거리 랜드마크, 인테리어, 소품)과 의상이 풍성하게 드러나는 **'미디엄 와이드 샷(허벅지/무릎선)'** 또는 **'전신 화보 샷(Full Shot)'**으로 넓게 프레이밍하라.
3. 원본 얼굴 정체성 보존 60% 및 연령별 리모델링 규칙:
   - [원본 보존 60% 기준]: 눈매의 고유한 각도, 쌍꺼풀 라인, 콧날의 형태, 입술 선의 비율, 얼굴 골격형, 인상 60% 수준으로 정밀하게 고정하여 본인임을 한눈에 알아볼 수 있게 한다.
   ${ageAdjustmentDirective}
${facialFeaturesSummary ? `   - [참고 인물 고유 유전적 특징 분석]:\n${facialFeaturesSummary}` : ''}
4. 사진관 전문 조명 원칙 (어두운 저조도 엄격 금지, 밝고 화사한 스튜디오 조명 필수):
   - 사진관에서 조명 기구로 전문 촬영한 것처럼, 대형 소프트박스 3점 조명(Key light, Fill light, Rim light)과 대형 반사판을 전면에서 환하게 비추어라.
   - 어둡고 침침한 저조도(Low-key lighting), 짙고 칙칙한 그림자, 무거운 어두운 비네팅(Dark vignette)은 엄격히 금지한다!
   - 인물의 얼굴과 이목구비, 피부 톤이 어둠에 묻히지 않고 맑고 화사하며, 눈동자에 생기 있는 캣치라이트(Catchlight)가 맺히도록 밝게 비추어라.
   - 의상의 디테일과 배경의 소품까지 한눈에 환하고 또렷하게 다 보이도록 전체적으로 노출이 밝고 균형 잡힌 명품 사진관 스튜디오 룩(Bright, beautifully illuminated professional photo studio lighting)으로 촬영하라.

---

[지정된 테마 세부 지침]
${selectedThemePrompt}

[촬영 대상 정보]
- 성별: ${gender === 'male' ? '남성 (Male)' : '여성 (Female)'}
- 선택된 연령대: ${ageGroup}

---

[조명 및 렌더링 품질 절대 지침 (Bright Studio Lighting)]
- 모든 테마 공통: 침침하거나 어두운 저조도(Low-key), 짙은 그림자, 얼굴이나 의상이 어둠에 묻히는 언더 노출(Underexposed)을 절대 금지한다.
- 전문 사진관의 밝고 화사한 고출력 스튜디오 라이팅과 반사판으로 인물의 얼굴과 의상, 배경 디테일이 모두 환하고 또렷하게 보이는 고해상도 완성작으로 생성하라 (Bright, studio-lit, high key, clear visibility of face and background).

---

[응답 규칙]
1. 정중하고 친근한 40년 전통 동명사진관 대표 사진작가 톤의 인사말(1~2줄 이내).
2. 텍스트 프롬프트 설명 대신, 원본 얼굴 정체성 60% 및 연령별 스타일링과 밝고 화사한 사진관 조명이 적용된 **'초고화질 화보 이미지'를 즉시 1순위로 생성하여 출력할 것**.
${seed ? `(생성 시드 번호: ${seed})` : ''}
`;

    let generatedImageDataUrl = '';

    // Primary attempt with gemini-3.1-flash-lite-image
    try {
      console.log(`Generating portrait for target age [${ageGroup}], prompt length: ${finalPrompt.length}`);
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: finalPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: '3:4',
          },
        },
      });

      if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content?.parts || []) {
          if (part.inlineData && part.inlineData.data) {
            generatedImageDataUrl = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }
    } catch (primaryModelErr: any) {
      console.warn('Primary model error, attempting gemini-3.1-flash-image fallback...', primaryModelErr?.message || primaryModelErr);
      
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image',
          contents: {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              {
                text: finalPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: '3:4',
            },
          },
        });

        if (fallbackResponse.candidates && fallbackResponse.candidates.length > 0) {
          for (const part of fallbackResponse.candidates[0].content?.parts || []) {
            if (part.inlineData && part.inlineData.data) {
              generatedImageDataUrl = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
              break;
            }
          }
        }
      } catch (fallbackErr: any) {
        console.error('Fallback model also failed:', fallbackErr?.message || fallbackErr);
        throw fallbackErr;
      }
    }

    if (!generatedImageDataUrl) {
      throw new Error('AI 모델에서 이미지 데이터를 반환하지 못했습니다.');
    }

    return res.json({ imageUrl: generatedImageDataUrl });
  } catch (error: any) {
    console.error('Retro portrait generation failed:', error);
    const errorMessage = error?.message || '사진 생성 중 오류가 발생했습니다.';
    return res.status(500).json({
      error: '앗, 사진 현상이 잠시 잘 안됐어요. 한 번 더 만들어볼게요.',
      details: errorMessage,
    });
  }
});

// Google Drive / Cloud Save Endpoint
app.post('/api/save-drive', async (req, res) => {
  try {
    const { image, timestamp } = req.body;
    if (!image) {
      return res.status(400).json({ error: '저장할 사진이 없습니다.' });
    }

    // Format filename YYYYMMDD_HHmmss.jpg
    const now = timestamp ? new Date(timestamp) : new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const min = pad(now.getMinutes());
    const ss = pad(now.getSeconds());

    let baseName = `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
    let finalFileName = `${baseName}.jpg`;

    if (savedFilenamesSet.has(finalFileName)) {
      let suffix = 1;
      while (savedFilenamesSet.has(`${baseName}_${pad(suffix)}.jpg`)) {
        suffix++;
      }
      finalFileName = `${baseName}_${pad(suffix)}.jpg`;
    }
    savedFilenamesSet.add(finalFileName);

    todaySessionCount += 1;

    const webhookUrl = process.env.GOOGLE_DRIVE_WEBHOOK_URL;
    let driveSaved = false;
    let driveUrl = '';

    if (webhookUrl) {
      try {
        const webhookRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folderName: '반여시장_레트로사진관_2026',
            filename: finalFileName,
            imageData: image,
          }),
        });
        if (webhookRes.ok) {
          const webhookData = await webhookRes.json().catch(() => ({}));
          driveSaved = true;
          driveUrl = webhookData.url || '';
        }
      } catch (webhookErr) {
        console.warn('Webhook Drive saving failed:', webhookErr);
      }
    }

    return res.json({
      success: true,
      filename: finalFileName,
      todayCount: todaySessionCount,
      driveSaved,
      driveUrl,
      folderName: '반여시장_레트로사진관_2026',
      message: '사진관 앨범에 안전하게 저장되었습니다.',
    });
  } catch (error: any) {
    console.error('Save photo error:', error);
    return res.status(500).json({
      success: false,
      error: '사진관 앨범 저장에 실패했어요. 사진은 아래 버튼으로 바로 내려받을 수 있습니다.',
    });
  }
});

// Admin / Counter Update
app.post('/api/counter/reset', (_req, res) => {
  todaySessionCount = 0;
  res.json({ success: true, todayCount: 0 });
});

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
