export type ThemeId = 'cinema_5060' | 'romance_70s' | 'hanbok_royal' | 'youth_7080' | 'hipster_8090';

export type Gender = 'male' | 'female';

export type Step = 'upload' | 'theme' | 'gender' | 'age' | 'generating' | 'result';

export type TargetAgeGroup = '10s' | '20s' | '30s' | '40s' | '50s' | 'current';

export type CustomerCurrentAge = '30s' | '40s' | '50s' | '60s' | '70s' | '80s';

export interface AgeGroupOption {
  id: TargetAgeGroup;
  targetExactAge: string;
  label: string;
  sublabel: string;
  description: string;
  badge: string;
}

export interface RetroTheme {
  id: ThemeId;
  title: string;
  subtitle: string;
  recommendation: string;
  era: string;
  icon: string;
  accentColor: string;
  bgGradient: string;
  description: string;
  promptKey: string;
}

export interface PhotoStudioState {
  sourceImage: string | null;
  selectedTheme: ThemeId | null;
  selectedGender: Gender | null;
  targetAgeGroup: TargetAgeGroup;
  currentAgeGroup: CustomerCurrentAge;
  generatedImage: string | null;
  finalPrintImage: string | null;
  isGenerating: boolean;
  isSaving: boolean;
  currentStep: Step;
  todayCount: number;
  errorMessage: string | null;
  faceValidation: {
    isValid: boolean;
    faceCount: number;
    estimatedAge?: number;
    message: string;
    isChecking: boolean;
  };
}

export interface GenerateRequestPayload {
  image: string; // base64
  themeId: ThemeId;
  gender: Gender;
  targetAgeGroup: TargetAgeGroup;
  currentAgeGroup?: CustomerCurrentAge;
  seed?: number;
}

export interface SaveDriveResponse {
  success: boolean;
  filename: string;
  message: string;
  driveUrl?: string;
}
