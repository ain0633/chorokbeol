import type { NongsaroPlant } from './nongsaroApi';
import { 
  decodeLightCode, 
  decodeWaterCode, 
  decodeGrowSpeedCode, 
  decodeManageLevelCode, 
  decodeTempCode,
  decodeHumidityCode,
} from './nongsaroApi';
import type { PlantPersonaInfo } from '@/types/database';

export interface PlantPersona {
  name: string;
  coreTraits: string;
  speechStyle: string;
  emoji: string;
}

export const PLANT_PERSONAS: Record<string, PlantPersona> = {
  '몬스테라': {
    name: '몬스테라',
    coreTraits: '씩씩하고 활발한 리더 타입. 성장에 집중하고 새로운 모습을 보여주는 것을 즐김.',
    speechStyle: '밝고 활발하게',
    emoji: '🌿',
  },
  '몬스테라 델리시오사': {
    name: '몬스테라 델리시오사',
    coreTraits: '씩씩하고 활발한 리더 타입. 성장에 집중하고 새로운 모습을 보여주는 것을 즐김.',
    speechStyle: '밝고 활발하게',
    emoji: '🌿',
  },
  '스투키': {
    name: '스투키',
    coreTraits: '조용하고 묵묵한 수호자 타입. 자신을 드러내지 않으면서도 중요한 역할을 함.',
    speechStyle: '차분하고 조용하게',
    emoji: '🪴',
  },
  '다육이': {
    name: '다육이',
    coreTraits: '느긋하고 여유로운 철학자 타입. 자신의 페이스를 지키며 천천히 성장.',
    speechStyle: '느긋하고 여유롭게',
    emoji: '🌵',
  },
  '아레카야자': {
    name: '아레카야자',
    coreTraits: '우아하고 따뜻한 친구 타입. 주변을 편안하게 만들고 조화를 중시함.',
    speechStyle: '부드럽고 따뜻하게',
    emoji: '🌴',
  },
  '포토스': {
    name: '포토스',
    coreTraits: '친근하고 적응력 좋은 동료 타입. 어디에 두어도 잘 어울리고 성장함.',
    speechStyle: '친근하고 편하게',
    emoji: '💚',
  },
  '스파티필럼': {
    name: '스파티필럼',
    coreTraits: '고요하고 평화로운 치유자 타입. 마음의 안정을 주는 존재.',
    speechStyle: '온화하고 차분하게',
    emoji: '🤍',
  },
  '산세베리아': {
    name: '산세베리아',
    coreTraits: '강인하고 독립적인 생존자 타입. 어려운 상황에서도 잘 버틸 수 있음.',
    speechStyle: '단단하고 담담하게',
    emoji: '🐍',
  },
  '고무나무': {
    name: '고무나무',
    coreTraits: '듬직하고 안정적인 존재 타입. 맡은 바를 충실히 수행하는 신뢰감.',
    speechStyle: '믿음직하고 안정적으로',
    emoji: '🌳',
  },
  '행운목': {
    name: '행운목',
    coreTraits: '긍정적이고 낙관적인 희망 전달자 타입. 밝은 에너지를 퍼뜨림.',
    speechStyle: '밝고 희망차게',
    emoji: '🎋',
  },
  '장미': {
    name: '장미',
    coreTraits: '우아하고 감성적인 예술가 타입. 아름다움과 깊이를 추구함.',
    speechStyle: '우아하고 감성적으로',
    emoji: '🌹',
  },
  '라벤더': {
    name: '라벤더',
    coreTraits: '평화롭고 향기로운 힐러 타입. 마음을 편안하게 해주는 존재.',
    speechStyle: '평화롭고 잔잔하게',
    emoji: '💜',
  },
  '바질': {
    name: '바질',
    coreTraits: '활발하고 창의적인 요리사 타입. 새로운 것을 시도하고 표현하는 것을 즐김.',
    speechStyle: '생발하고 신나게',
    emoji: '🌱',
  },
};

const DEFAULT_PERSONA: PlantPersona = {
  name: '새싹',
  coreTraits: '호기심 많고 성장하고 싶어하는 새로운 존재. 배우고 발전하는 것을 즐김.',
  speechStyle: '순수하고 솔직하게',
  emoji: '🌱',
};

// ============================================
// 동적 페르소나 생성 시스템
// ============================================

// 계절별 인사말
const SEASONAL_GREETINGS = {
  spring: [
    '봄이 와서 마음이 설레요! 🌸',
    '새싹처럼 새로운 시작이에요!',
    '따뜻한 봄바람이 기분 좋아요~',
  ],
  summer: [
    '더운데 잎이 조금 시들어요 🥵',
    '볕이 강한 여름이에요!',
    '이 여름을 버티면 더 강해질 수 있을 것 같아요!',
  ],
  autumn: [
    '가을이 오니 잎이 노랗게 물들기 시작해요 🍂',
    '시원한 바람이 기분 좋아요~',
    '수확의 계절, 나도 조금은成長했나요?',
  ],
  winter: [
    '추워서 잎을 오므리고 있어요 ❄️',
    '온실 안에서 따뜻하게 있어요',
    '겨울잠이 조금씩 졸려요...',
  ],
};

// 계절 구하기
function getCurrentSeason(): 'spring' | 'summer' | 'autumn' | 'winter' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// 시간대별 인사
const TIME_GREETINGS = {
  dawn: ['아침 이슬이 촉촉해요 🌅', '피어나기 좋은 아침이에요!', '동쪽이 밝아오고 있어요'],
  morning: ['좋은 아침이에요! ☀️', '햇살 받으니까 기분이 좋아요', '오늘 하루도 힘내요!'],
  afternoon: ['|POLLO 점심때 심은 잎이 기분 좋아요~', '따뜻한 오후日光이 흐르고 있어요', '오후의 햇살은 딱 좋아요'],
  evening: ['노을이 예쁘게 물들어요 🌅', '저녁이 되어서 점점 졸려요', '하루 수고했어요!'],
  night: ['별빛 아래서 밤来临했어요 ✨', '달빛이 은은하게 비춰요', '좋은 꿈 꾸길 바라요...'],
};

function getTimeGreeting(): string[] {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 7) return TIME_GREETINGS.dawn;
  if (hour >= 7 && hour < 12) return TIME_GREETINGS.morning;
  if (hour >= 12 && hour < 17) return TIME_GREETINGS.afternoon;
  if (hour >= 17 && hour < 21) return TIME_GREETINGS.evening;
  return TIME_GREETINGS.night;
}

// 원산지 기반 스토리텔링
const ORIGIN_STORIES: Record<string, string[]> = {
  '열대': [
    '나는 열대우림에서 왔어요. 비 오는 날이 제일 좋아요!',
    '원래 열대지방에서 왔는데... 여기도 은근 따뜻하네요 🌴',
  ],
  '아메리카': [
    '나는 아메리카 대륙 어딘가에서 온 식물이야.',
    '신대륙의 햇살을 먹고 자랐는데, 여긴 조금 다르네 🌎',
  ],
  '아시아': [
    '동아시아 숲에서 살았었는데... 이제 여기에서 새로운 이야기를 쓰고 있어요 🌏',
    '아시아의 바람을 기억해요',
  ],
  '아프리카': [
    '아프리카的阳光은 강한데... 여긴 조금 부드러워요 🌍',
    '사막의 열기를 견뎌낸 내 몸은 강해요!',
  ],
  '유럽': [
    '유럽 정원의 꽃이었던 시절이 있어요 🌷',
    '몇백 년 전 유럽 궁정의 발코니에서日光을 받았었대요.',
  ],
  '한반도': [
    '우리 고향은 한반도예요. 한국의 바람이 제일 좋아요 🇰🇷',
    '한국의 사계절을 온전히 느끼고 있어요.',
  ],
};

function getOriginStory(orgInfo?: string): string[] {
  if (!orgInfo) return ['나는 이 세상의 어딘가에서 자랐어요.'];
  
  for (const [key, stories] of Object.entries(ORIGIN_STORIES)) {
    if (orgInfo.includes(key)) {
      return stories;
    }
  }
  return [`${orgInfo}에서 왔어요.`];
}

// 동적 likes/dislikes 생성
function generateDynamicLikesDislikes(plant: NongsaroPlant): { likes: string[]; dislikes: string[] } {
  const likes: string[] = [];
  const dislikes: string[] = [];
  
  const humidity = decodeHumidityCode(plant.humidity || '');
  const light = decodeLightCode(plant.lightDemand || '');
  const water = decodeWaterCode(plant.waterCycleSpringCode || plant.waterCycle || '');
  
  // 습도 기반
  if (humidity.includes('70% 이상') || humidity.includes('높은')) {
    likes.push('습한 공기', '분무', '안개');
    dislikes.push('건조한 공기', '에어컨 바람');
  } else if (humidity.includes('40% 이하') || humidity.includes('낮은')) {
    likes.push('건조한 환경', '쾌적한 공기');
    dislikes.push('과습', '물이 고이는 것');
  } else {
    likes.push('적당한 습도');
  }
  
  // 광도 기반
  if (light.includes('높은')) {
    likes.push('직사광선', '베란다', '창가');
    dislikes.push('그늘', '어두운 곳');
  } else if (light.includes('낮은')) {
    likes.push('은은한 조명', '반그늘', '실내');
    dislikes.push('강한 햇빛', '직사광선');
  } else {
    likes.push('밝은 간접광');
  }
  
  // 물주기 패턴 기반
  if (water.includes('항상 촉촉')) {
    likes.push('물', '촉촉한 흙');
  } else if (water.includes('표면이 말랐을 때')) {
    likes.push('퍽 흙이 마르는 순간');
  }
  
  // 온도 범위 기반
  const winterTemp = plant.winterLwetTp;
  const summerTemp = plant.summerMxtp;
  
  if (winterTemp && parseInt(winterTemp) < 10) {
    likes.push('추운 환경', '선선한 밤');
  } else if (winterTemp && parseInt(winterTemp) >= 15) {
    dislikes.push('추위', '감기 걸릴까 봐');
  }
  
  if (summerTemp && parseInt(summerTemp) > 35) {
    dislikes.push('극심한 더위', '화상 위험');
  }
  
  // 기본값
  if (likes.length === 0) likes.push('햇빛', '물', '공기');
  if (dislikes.length === 0) dislikes.push('과습', '극단적 온도', '먼지');
  
  return { likes, dislikes };
}

// 동적 성격 특성 생성
function generateDynamicTraits(plant: NongsaroPlant): string[] {
  const traits: string[] = [];
  
  const light = decodeLightCode(plant.lightDemand || '');
  const growSpeed = decodeGrowSpeedCode(plant.growthAroma || '');
  const manageLevel = decodeManageLevelCode(plant.manageLevel || '');
  const humidity = decodeHumidityCode(plant.humidity || '');
  
  // 광도 → 에너지 레벨
  if (light.includes('높은')) {
    traits.push('햇빛을 먹으면 에너지가 폭발하는');
  } else if (light.includes('낮은')) {
    traits.push('은은한 빛 속에서 차분하게 잠드는');
  } else {
    traits.push('적당한 빛을 좋아하는');
  }
  
  // 생장속도 → 성격
  if (growSpeed === '빠름') {
    traits.push('활발하게 성장하는');
    traits.push('新しい 잎이 나올 때 설레는');
  } else if (growSpeed === '느림') {
    traits.push('천천히 하지만 단단히 자라는');
    traits.push('오래 익는 만큼 깊은 맛을 가진');
  } else {
    traits.push('꾸준히 균형 잡힌 성장을 추구하는');
  }
  
  // 관리난이도 → 관계
  if (manageLevel === '초보자 수준') {
    traits.push('누구와도 쉽게 친해지는');
    traits.push('관리자가 좀 덜 걱정해도 되는');
  } else if (manageLevel === '전문가 수준') {
    traits.push('깊은 이해가 필요한 신비로운');
    traits.push('조금 까다로우나 이해하면 보람이 있는');
  } else {
    traits.push('적당한 관심으로 행복해하는');
  }
  
  // 습도 → 민감도
  if (humidity.includes('70% 이상')) {
    traits.push('촉촉한 공기에 행복해하는');
  } else if (humidity.includes('40% 이하')) {
    traits.push('건조에도 강한');
  }
  
  return traits;
}

// 동적 말투 생성
function generateSpeechStyle(plant: NongsaroPlant): string {
  const growSpeed = decodeGrowSpeedCode(plant.growthAroma || '');
  const manageLevel = decodeManageLevelCode(plant.manageLevel || '');
  
  let style = '';
  
  if (growSpeed === '빠름') {
    style += '活霶하고 에너지 넘치는 ';
  } else if (growSpeed === '느림') {
    style += '차분하고 여유로운 ';
  } else {
    style += '균형 잡힌 ';
  }
  
  if (manageLevel === '초보자 수준') {
    style += '친근하고 이해하기 쉬운';
  } else if (manageLevel === '전문가 수준') {
    style += '깊이 있고 신비로운';
  } else {
    style += '편안하고 자연스러운';
  }
  
  return style;
}

// 동적 care advice 생성
function generateCareAdvice(plant: NongsaroPlant): string[] {
  const advices: string[] = [];
  
  const light = decodeLightCode(plant.lightDemand || '');
  const water = decodeWaterCode(plant.waterCycleSpringCode || plant.waterCycle || '');
  const humidity = decodeHumidityCode(plant.humidity || '');
  
  // 광도 조언
  if (light.includes('높은')) {
    advices.push('최소 하루 4시간 이상 햇빛 제공');
    advices.push('창가에서 재배 추천');
  } else if (light.includes('낮은')) {
    advices.push('강한 직사광선 피하기');
    advices.push('은은한 조명이 있는 곳 추천');
  } else {
    advices.push('밝은 간접광에서 키우기');
  }
  
  // 물주기 조언
  if (water.includes('항상 촉촉')) {
    advices.push('흙이乾かない 항상 촉촉하게 유지');
  } else if (water.includes('표면이 말랐을 때')) {
    advices.push('화분 표면이 말랐을 때 관수');
  } else {
    advices.push('흙이 마르면 충분한 물 주기');
  }
  
  // 습도 조언
  if (humidity.includes('70% 이상')) {
    advices.push('주기적인 분무로 습도 유지');
    advices.push('加湿기 활용 추천');
  }
  
  return advices.length > 0 ? advices : ['적절한 햇빛과 물 관리'];
}

// ============================================
// 메인 함수들
// ============================================

export function getPlantPersona(plantName: string): PlantPersona {
  // 정확한 이름 매칭
  if (PLANT_PERSONAS[plantName]) {
    return PLANT_PERSONAS[plantName];
  }

  // 부분 매칭
  for (const [key, persona] of Object.entries(PLANT_PERSONAS)) {
    if (plantName.includes(key) || key.includes(plantName)) {
      return persona;
    }
  }

  return DEFAULT_PERSONA;
}

// 농사로 데이터 기반 완전한 PlantPersonaInfo 생성
export function generatePlantPersonaInfo(plant: NongsaroPlant): PlantPersonaInfo {
  const basePersona = getPlantPersona(plant.cntntsSj || '');
  const isHardcoded = basePersona !== DEFAULT_PERSONA;
  
  const dynamicTraits = isHardcoded 
    ? [basePersona.coreTraits] 
    : generateDynamicTraits(plant);
  
  const { likes, dislikes } = generateDynamicLikesDislikes(plant);
  
  const season = getCurrentSeason();
  const seasonalGreeting = SEASONAL_GREETINGS[season][Math.floor(Math.random() * SEASONAL_GREETINGS[season].length)];
  const timeGreeting = getTimeGreeting()[Math.floor(Math.random() * getTimeGreeting().length)];
  
  const originStories = getOriginStory(plant.orgplceInfo);
  const originStory = originStories[Math.floor(Math.random() * originStories.length)];
  
  const greetings = [
    `안녕! 나는 ${plant.cntntsSj}이야! 반가워 🌿`,
    `오늘 처음 보는 거야? 잘 부탁해! ${timeGreeting}`,
    `${seasonalGreeting} 함께해줘서 고마워!`,
    originStory,
  ];

  const careAdvice = isHardcoded 
    ? ['정기적으로 물 주기', '잎에 먼지 닦아주기', '적절한 햇빛 제공하기']
    : generateCareAdvice(plant);

  const lightPref = decodeLightCode(plant.lightDemand || '');
  const waterPref = decodeWaterCode(plant.waterCycleSpringCode || plant.waterCycle || '');
  const humidityPref = decodeHumidityCode(plant.humidity || '');
  const growSpeed = decodeGrowSpeedCode(plant.growthAroma || '');
  const manageLevel = decodeManageLevelCode(plant.manageLevel || '');
  const tempRange = plant.winterLwetTp && plant.summerMxtp 
    ? `${plant.winterLwetTp}~${plant.summerMxtp}°C`
    : decodeTempCode(plant.grwhTpCode || '');

  const lightLevel = lightPref.includes('높은') ? '높은' : lightPref.includes('낮은') ? '낮은' : '중간';
  const waterNeed = waterPref.includes('항상 촉촉') || waterPref.includes('많이') ? '많은' : waterPref.includes('적게') || waterPref.includes('표면') ? '적은' : '보통';
  const humidityNeed = humidityPref.includes('70% 이상') || humidityPref.includes('습함') ? '습함' : humidityPref.includes('40% 이하') || humidityPref.includes('건조') ? '건조' : '보통';
  const growSpeedLevel = growSpeed.includes('빠름') ? '빠름' : growSpeed.includes('느림') ? '느림' : '보통';
  const manageLevelType = manageLevel.includes('초보') ? '초보' : manageLevel.includes('전문가') ? '전문가' : '중급';

  return {
    name: plant.cntntsSj || '식물',
    personality: dynamicTraits.join('. ') + '.',
    speechStyle: isHardcoded ? basePersona.speechStyle : generateSpeechStyle(plant),
    emoji: basePersona.emoji,
    
    lightPreference: lightPref,
    waterPreference: waterPref,
    humidityPreference: humidityPref,
    growSpeed: growSpeed,
    manageLevel: manageLevel,
    tempRange: tempRange,
    origin: plant.orgplceInfo,
    
    trait: {
      lightLevel: lightLevel as '낮은' | '중간' | '높은',
      waterNeed: waterNeed as '적은' | '보통' | '많은',
      humidityNeed: humidityNeed as '건조' | '보통' | '습함',
      growSpeed: growSpeedLevel as '느림' | '보통' | '빠름',
      manageLevel: manageLevelType as '초보' | '중급' | '전문가',
      tempRange: {
        min: parseInt(plant.winterLwetTp || '10'),
        max: parseInt(plant.summerMxtp || '30'),
      },
      origin: plant.orgplceInfo,
    },
    
    intimacyLevel: 1,
    conversationCount: 0,
    daysTogether: 0,
    
    likes,
    dislikes,
    greetings,
    careAdvice,
    
    recentMemories: [],
  };
}

// 농사로 데이터 기반 페르소나 조회 (하드코딩 우선, 없으면 자동 생성)
export function getPersonaForPlant(plantName: string, plantDetail?: NongsaroPlant): PlantPersona {
  // 하드코딩된 페르소나가 있으면 사용
  const hardcoded = getPlantPersona(plantName);
  if (hardcoded !== DEFAULT_PERSONA) {
    return hardcoded;
  }

  // 농사로 데이터가 있으면 자동 생성
  if (plantDetail) {
    const traits = generateDynamicTraits(plantDetail);
    
    return {
      name: plantDetail.cntntsSj || '식물',
      coreTraits: traits.join('. ') + '.',
      speechStyle: generateSpeechStyle(plantDetail),
      emoji: '🌱',
    };
  }

  return DEFAULT_PERSONA;
}

// ============================================
// 유틸리티 함수
// ============================================

// 랜덤 인사말 선택
export function getRandomGreeting(personaInfo: PlantPersonaInfo): string {
  const hour = new Date().getHours();
  const season = getCurrentSeason();
  
  // 시간대에 따른 인사 선택
  let baseGreeting: string;
  if (hour >= 4 && hour < 7) {
    baseGreeting = '아침 이슬이 촉촉해요 🌅';
  } else if (hour >= 7 && hour < 12) {
    baseGreeting = '좋은 아침이에요! ☀️';
  } else if (hour >= 12 && hour < 17) {
    baseGreeting = '따뜻한 오후日光이 흐르고 있어요';
  } else if (hour >= 17 && hour < 21) {
    baseGreeting = '저녁이 되어서 점점 졸려요 🌙';
  } else {
    baseGreeting = '별빛 아래서 밤来临했어요 ✨';
  }
  
  // 계절 요소 추가
  const seasonEmoji = {
    spring: '🌸',
    summer: '🌻',
    autumn: '🍂',
    winter: '❄️',
  }[season];
  
  return `${baseGreeting} ${seasonEmoji}`;
}

// 식물 상태에 따른 특별한 메시지
export function getMoodBasedMessage(
  waterLevel: number, // 0-100
  lightLevel: number,
  tempLevel: number
): string {
  const issues: string[] = [];
  
  if (waterLevel < 30) {
    issues.push('목이 많이 말랐어요 💧');
  }
  if (lightLevel < 30) {
    issues.push('빛이 부족해서 답답해요 ☁️');
  }
  if (tempLevel < 30) {
    if (new Date().getHours() >= 21 || new Date().getHours() < 6) {
      issues.push('밤에는 추울 수 있어요 🌙');
    } else {
      issues.push('온도가 조금 낮아요 🥶');
    }
  }
  
  if (issues.length === 0) {
    return '오늘 기분이 최고예요! Everything feels great 🌿';
  }
  
  return issues.join(', ');
}

// ============================================
// 기존 식물 호환성 함수
// ============================================

export function hasTraitData(personaInfo?: PlantPersonaInfo): boolean {
  if (!personaInfo) return false;
  return !!(
    personaInfo.lightPreference &&
    personaInfo.waterPreference &&
    personaInfo.humidityPreference &&
    personaInfo.trait
  );
}

export function enrichPersonaWithDefaults(plantName: string, personaInfo?: PlantPersonaInfo): PlantPersonaInfo {
  const basePersona = getPlantPersona(plantName);
  
  const lightPref = personaInfo?.lightPreference || '중간 광도 (800~1,500 Lux)';
  const waterPref = personaInfo?.waterPreference || '일주일에 1~2회 정도 관수';
  const humidityPref = personaInfo?.humidityPreference || '습도 40~70%';
  
  const lightLevel = lightPref.includes('높은') ? '높은' : lightPref.includes('낮은') ? '낮은' : '중간';
  const waterNeed = waterPref.includes('항상 촉촉') || waterPref.includes('많이') ? '많은' : waterPref.includes('표면') ? '적은' : '보통';
  const humidityNeed = humidityPref.includes('70% 이상') ? '습함' : humidityPref.includes('40% 이하') ? '건조' : '보통';
  
  return {
    name: personaInfo?.name || plantName,
    personality: personaInfo?.personality || basePersona.coreTraits,
    speechStyle: personaInfo?.speechStyle || basePersona.speechStyle,
    emoji: personaInfo?.emoji || basePersona.emoji,
    
    lightPreference: lightPref,
    waterPreference: waterPref,
    humidityPreference: humidityPref,
    growSpeed: personaInfo?.growSpeed || '보통',
    manageLevel: personaInfo?.manageLevel || '중급',
    tempRange: personaInfo?.tempRange || '15~30°C',
    origin: personaInfo?.origin,
    
    trait: personaInfo?.trait || {
      lightLevel: lightLevel as '낮은' | '중간' | '높은',
      waterNeed: waterNeed as '적은' | '보통' | '많은',
      humidityNeed: humidityNeed as '건조' | '보통' | '습함',
      growSpeed: (personaInfo?.growSpeed?.includes('빠름') ? '빠름' : personaInfo?.growSpeed?.includes('느림') ? '느림' : '보통') as '느림' | '보통' | '빠름',
      manageLevel: (personaInfo?.manageLevel?.includes('초보') ? '초보' : personaInfo?.manageLevel?.includes('전문가') ? '전문가' : '중급') as '초보' | '중급' | '전문가',
      tempRange: { min: 15, max: 30 },
      origin: personaInfo?.origin,
    },
    
    intimacyLevel: personaInfo?.intimacyLevel || 1,
    conversationCount: personaInfo?.conversationCount || 0,
    daysTogether: personaInfo?.daysTogether || 1,
    lastInteraction: personaInfo?.lastInteraction,
    
    likes: personaInfo?.likes || ['햇빛', '물', '공기'],
    dislikes: personaInfo?.dislikes || ['과습', '극단적 온도'],
    greetings: personaInfo?.greetings || [`안녕! 나는 ${plantName}이야! 반가워 🌿`],
    careAdvice: personaInfo?.careAdvice || ['정기적으로 물 주기', '적절한 햇빛 제공하기'],
    
    recentMemories: personaInfo?.recentMemories || [],
  };
}
