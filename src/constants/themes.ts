import { RetroTheme, AgeGroupOption, TargetAgeGroup } from '../types';

export const RETRO_THEMES: RetroTheme[] = [
  {
    id: 'cinema_5060',
    title: '1970~80년대 한국 고전 영화',
    subtitle: '그 시절 영화배우 칼라 화보',
    recommendation: '전 연령 · 어르신 추천',
    era: '1970~1980s',
    icon: '🎬',
    accentColor: '#4A3B32',
    bgGradient: 'from-[#3A2E2B] to-[#1E1715]',
    description: '70-80년대 영화배우 칼라 화보, 화사하고 밝은 사진관 조명과 품격 있는 명품 화보',
    promptKey: 'cinema_5060',
  },
  {
    id: 'romance_70s',
    title: '1970년대 명동 & 서면 로맨스',
    subtitle: '70년대 모던 젠틀맨 & 레이디',
    recommendation: '20~60대 강력 추천',
    era: '1970s',
    icon: '☕',
    accentColor: '#B85D19',
    bgGradient: 'from-[#6E350E] to-[#3B1A04]',
    description: '명동·서면 거리 야외 카페 테라스와 가로등 아래 감성 야외 화보',
    promptKey: 'romance_70s',
  },
  {
    id: 'hanbok_royal',
    title: '고급 전통 한복 화보',
    subtitle: '가장 아름다운 한국의 멋',
    recommendation: '전 연령 추천',
    era: '전통 품격',
    icon: '👑',
    accentColor: '#8C2D38',
    bgGradient: 'from-[#6B1D2F] to-[#3B101A]',
    description: '최고급 비단 두루마기와 당의, 고즈넉한 한옥 대청마루 화보',
    promptKey: 'hanbok_royal',
  },
  {
    id: 'youth_7080',
    title: '1970~80년대 나의 학창시절',
    subtitle: '그때 그 시절, 다시 열여덟',
    recommendation: '50~70대 강력 추천',
    era: '1970~1980s',
    icon: '🎒',
    accentColor: '#2C4A52',
    bgGradient: 'from-[#1E353B] to-[#102024]',
    description: '추억의 교복과 옛 교실 나무 책걸상, 풋풋한 학창시절의 아련한 추억',
    promptKey: 'youth_7080',
  },
  {
    id: 'hipster_8090',
    title: '1980~90년대 반여 디스코 레트로',
    subtitle: '응답하라! 화려한 디스코 & 리즈 시절',
    recommendation: '20~50대 추천',
    era: '1980~1990s',
    icon: '📻',
    accentColor: '#9E5B2E',
    bgGradient: 'from-[#7A3E1B] to-[#451F0A]',
    description: '화려한 디스코 벨보텀, 스팽글, LP바와 네온 골목의 화려한 리즈 시절',
    promptKey: 'hipster_8090',
  },
];

export const AGE_GROUP_OPTIONS: AgeGroupOption[] = [
  {
    id: '10s',
    targetExactAge: '만 16~18세',
    label: '10대',
    sublabel: '풋풋한 학창 시절',
    description: '주름 100% 제거! 앳된 볼살과 맑은 피부 톤, 초롱초롱한 눈망울',
    badge: '🎒 10대 학창 시절',
  },
  {
    id: '20s',
    targetExactAge: '만 20~23세',
    label: '20대',
    sublabel: '꽃청춘 리즈 시절',
    description: '노화 요소 100% 제거, 팽팽한 탄력과 도톰한 볼륨감의 리즈 시절',
    badge: '👑 20대 꽃청춘 (리즈)',
  },
  {
    id: '30s',
    targetExactAge: '만 30~34세',
    label: '30대',
    sublabel: '당당한 전성기',
    description: '피로선 완벽 제거, 세련된 카리스마와 생기 넘치는 전성기 화보',
    badge: '✨ 30대 전성기',
  },
  {
    id: '40s',
    targetExactAge: '만 40~44세',
    label: '40대',
    sublabel: '우아한 원숙미',
    description: '고유 인상 60% 보존, 10~15년 더 젊고 생기 있는 품격 화보',
    badge: '🎩 40대 원숙미',
  },
  {
    id: '50s',
    targetExactAge: '만 50~55세',
    label: '50대 이상',
    sublabel: '온화하고 멋진 모습',
    description: '깊은 주름 완화, 고유 인상 보존과 따뜻한 미소의 명품 화보',
    badge: '🌿 50대 이상 중후미',
  },
  {
    id: 'current',
    targetExactAge: '현재 나이',
    label: '현재 모습',
    sublabel: '명품 스튜디오 보정',
    description: '본인 인상 100% 보존, 화사하고 품격 있는 최고급 마스터 리터칭',
    badge: '📸 명품 스튜디오 보정',
  },
];

export const getAgeGroupTitle = (id?: string | TargetAgeGroup): string => {
  const item = AGE_GROUP_OPTIONS.find((a) => a.id === id);
  if (!item) return '20대 청춘 시절';
  if (item.id === 'current') return '현재 모습 (명품 보정)';
  return `${item.label} (${item.sublabel})`;
};

export const LOADING_MESSAGES = [
  '동명사진관 암실에서 필름을 정성껏 현상하고 있습니다…',
  '손님의 고유 이목구비 골격을 보존하며 생물학적 청춘 얼굴로 복원 중입니다…',
  '나이에 맞게 주름을 지우고 앳되고 생기 넘치는 피부로 다듬고 있습니다…',
  '그 시절 헤어스타일과 레트로 교복/의상을 정밀하게 매만지고 있습니다…',
  '추억 속의 나를 만나기 직전입니다…',
  '고화질 인화용 사진이 거의 완성되었습니다!',
];
