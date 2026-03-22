import type { UserPlant, Weather } from '@/types/database';

type PlacementType = 'window' | 'indoor' | 'balcony' | 'office';
type DirectionType = 'south' | 'east' | 'west' | 'north';
type SoilType = 'standard' | 'moss' | 'cactus' | 'hydro';
type VentilationLevel = 'poor' | 'normal' | 'good';

const TIME_CONTEXTS: Record<string, { greeting: string; feeling: string }> = {
  새벽: { greeting: '새벽 공기가 맑게 느껴져', feeling: '이슬이 잎에 맺히는 시간이야' },
  아침: { greeting: '아침 햇살이 기분 좋아', feeling: '같잠에서 막 깨어난 기분이야' },
  오후: { greeting: '따뜻한 오프가 흐르고 있어', feeling: '광합성 하기 좋은 시간이야' },
  저녁: { greeting: '저녁 노을이 예뻐', feeling: '하루를 잘 보냈어' },
  밤: { greeting: '밤이 깊어가고 있어', feeling: '잎을 접고 쉴 시간이야' },
};

const SEASONS: Record<string, { characteristic: string; advice: string }> = {
  봄: { characteristic: '새싹이 돋는 계절이야', advice: '새 잎이 날 준비를 하고 있어' },
  여름: { characteristic: '생명력이 넘치는 계절이야', advice: '물을 충분히 주면 활짝 자랄 수 있어' },
  가을: { characteristic: '결실의 계절이야', advice: '서서히 겨울을 준비해야 해' },
  겨울: { characteristic: '겨울잠 시간이야', advice: '물을 조금만 주고 따뜻하게 해줘' },
};

export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour>= 4 && hour < 7) return '새벽';
  if (hour >= 7 && hour < 12) return '아침';
  if (hour >= 12 && hour < 17) return '오후';
  if (hour >= 17 && hour < 21) return '저녁';
  return '밤';
}

export function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return '봄';
  if (month >= 5 && month <= 7) return '여름';
  if (month >= 8 && month <= 10) return '가을';
  return '겨울';
}

export function generateWaterSensation(
  value: number,
  plant: UserPlant,
  daysSinceWatered: number
): string {
  const soilType = (plant.soil_type || 'standard') as SoilType;
  
  const soilDescriptions: Record<SoilType, string> = {
    standard: '흙이',
    moss: '마사토가',
    cactus: '다육용 흙이',
    hydro: '물속이',
  };
  
  const baseSoilDesc = soilDescriptions[soilType] || '흙이';
  
  if (value < 15) {
    return `${baseSoilDesc} 바짝 말랐어... 목이 너무 타! 급히 물이 필요해!`;
  } else if (value < 30) {
    return `${baseSoilDesc} 건조해지고 있어. ${daysSinceWatered}일 전에 물을 받았는데 벌써 말라가네.`;
  } else if (value < 50) {
    return `${baseSoilDesc} 적당히 건조해. 곧 물이 필요할 것 같아.`;
  } else if (value < 70) {
    return `${baseSoilDesc} 촉촉하게 유지되고 있어. 기분 좋아!`;
  } else if (value < 85) {
    return `물이 충분해! ${baseSoilDesc} 촉촉하고 기분 좋아.`;
  } else {
    return `물이 너무 많을 수 있어... ${soilType === 'hydro' ? '하지만 물속이라 괜찮아' : '과습 주의해줘!'}`;
  }
}

export function generateLightSensation(
  value: number,
  placement: string,
  direction: string,
  weather: Weather | null
): string {
  const placementDesc: Record<PlacementType, string> = {
    window: '창가에서 직접 빛을',
    indoor: '실내에서 은은한 빛을',
    balcony: '베란다에서 자연광을',
    office: '사무실의 인공조명을',
  };
  
  const directionDesc: Record<DirectionType, string> = {
    south: '남향의 강한 빛',
    east: '동향의 아침 햇살',
    west: '서향의 오후 햇살',
    north: '북향의 은은한 빛',
  };
  
  const placementText = placementDesc[placement as PlacementType] || '어딘가에서 빛을';
  const directionText = directionDesc[direction as DirectionType] || '빛';
  
  const cloudiness = weather ? weather.clouds : 50;
  const cloudDesc = cloudiness > 70 ? '구름이 많아서 빛이 흐릿해' :cloudiness > 30 ? '약간 구름이 있지만 빛이 충분해' : '맑은 날이라 빛이 선명해';
  
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 20;
  
  if (isNight) {
    return `밤이라 빛이 없어. 잎을 접고 쉬고 있어.`;
  }
  
  if (value < 20) {
    return `너무 어두워... ${placementText} 받고 있는데 부족해. 더 밝은 곳으로 옮겨줄 수 있을까?`;
  } else if (value < 40) {
    return `${placementText} 받고 있지만 좀 부족한 느낌이야. ${cloudDesc}.`;
  } else if (value < 60) {
    return `${placementText} 받고 있어. ${directionText}이 있어서 괜찮아.`;
  } else if (value < 80) {
    return `${placementText} 충분히 받고 있어! ${cloudDesc}. 광합성이 잘 되고 있어!`;
  } else {
    if (placement === 'window' && direction === 'south') {
      return `빛이 너무 강해! ${directionText}이 직접 닿아서 잎이 탈 수 있어. 커튼으로 조금 가려줄래?`;
    }
    return `빛이 아주 충분해! 에너지가 넘쳐!`;
  }
}

export function generateAirSensation(
  value: number,
  ventilation: string,
  hasAcNearby: boolean,
  weather: Weather | null
): string {
  const ventilationDesc: Record<VentilationLevel, string> = {
    poor: '환기가 잘 안돼서 공기가 정체된 느낌이야',
    normal: '적당한 공기 흐름이 있어',
    good: '공기가 잘 순환해서 시원해',
  };
  
  const airText = ventilationDesc[ventilation as VentilationLevel] || '공기가 흐르고 있어';
  
  const windSpeed = weather ? weather.windSpeed : 2;
  const windDesc = windSpeed > 5 ? '바람이 강해서 잎이 흔들려' : windSpeed > 2 ? '산들바람이 불어서 기분 좋아' : '바람이 거의 없어';
  
  let sensation = '';
  
  if (hasAcNearby) {
    if (value < 40) {
      sensation = `에어컨 바람이 직접 와서 건조하고 추워... 잎이 시들 수 있어.`;
    } else {
      sensation = `에어컨 근처라 공기가 건조해. 분무로 살을 적여줘!`;
    }
  } else if (value < 30) {
    sensation = `공기가 정지된 느낌이야... ${airText}. 창문을 열어 환기를 시켜줄래?`;
  } else if (value < 50) {
    sensation = `${airText}. ${windDesc}.`;
  } else if (value < 70) {
    sensation = `공기 순환이 좋아! ${windDesc}. 잎이 상쾌해!`;
  } else {
    if (windSpeed > 5) {
      sensation = `바람이 너무 강해! ${windDesc}. 잎이 상할 수 있으니 창문을 조금 닫아줘.`;
    } else {
      sensation = `공기가 아주 좋아! ${windDesc}. 숨쉬기 편해!`;
    }
  }
  
  return sensation;
}

export function generateTempSensation(
  value: number,
  plant: UserPlant,
  weather: Weather | null
): string {
  const tempRangeString = plant.temp_range || '15-30°C';
  const match = tempRangeString.match(/(\d+)/g);
  const optMin = match && match.length >= 1 ? parseInt(match[0]) : 18;
  const optMax = match && match.length >= 2 ? parseInt(match[1]) : 27;
  
  const currentTemp = weather ? weather.temp : 22;
  
  let sensation = '';
  
  if (value < 20) {
    if (currentTemp < optMin - 5) {
      sensation = `너무 추워! 내 적정 온도는 ${optMin}~${optMax}°C인데 지금은 ${currentTemp}°C야. 따뜻한 곳으로 옮겨줘!`;
    } else {
      sensation = `조금 추워. ${currentTemp}°C정도야. 따뜻하게 해줄래?`;
    }
  } else if (value < 40) {
    sensation = `서늘한 느낌이야. ${currentTemp}°C정도. 견딜 수 있지만 조금 더 따뜻하면 좋겠어.`;
  } else if (value < 60) {
    sensation = `온도가 적당해! ${currentTemp}°C라 기분 좋아!`;
  } else if (value < 80) {
    if (currentTemp > optMax + 5) {
      sensation = `너무 더워! 내 적정 온도는 ${optMin}~${optMax}°C인데 지금은 ${currentTemp}°C야. 그늘로 옮겨줘!`;
    } else {
      sensation = `따뜻하고 좋아! ${currentTemp}°C정도야.`;
    }
  } else {
    sensation = `온도가 완벽해! ${currentTemp}°C로 내가 가장 좋아하는 온도야!`;
  }
  
  if (plant.has_ac_nearby && currentTemp > 25) {
    sensation += ' 에어컨 근처라 조금 시원한 느낌도 들어.';
  }
  
  return sensation;
}

export function generateCareContext(
  plant: UserPlant,
  daysSinceWatered: number
): string {
  const contexts: string[] = [];
  
  if (daysSinceWatered === 0) {
    contexts.push('오늘 물을 받았어! 뿌리가 기뻐하고 있어');
  } else if (daysSinceWatered === 1) {
    contexts.push('어제 물을 받았어. 아직도 촉촉해');
  } else if (daysSinceWatered > 7) {
    contexts.push(`${daysSinceWatered}일 동안 물을 못 받았어... 목말라`);
  } else {
    contexts.push(`${daysSinceWatered}일 전에 물을 받았어`);
  }
  
  if (plant.soil_type === 'cactus') {
    contexts.push('다육용 흙이라 물 빠짐이 좋아');
  } else if (plant.soil_type === 'moss') {
    contexts.push('마사토라 배수가 잘 돼');
  } else if (plant.soil_type === 'hydro') {
    contexts.push('수경 재배라 항상 물속이야');
  }
  
  if (plant.ventilation_level === 'poor') {
    contexts.push('환기가 좀 안 좋은 것 같아');
  } else if (plant.ventilation_level === 'good') {
    contexts.push('공기 순환이 좋은 환경이야');
  }
  
  if (plant.has_ac_nearby) {
    contexts.push('에어컨 근처라 좀 건조해');
  }
  
  return contexts.join('. ') + '.';
}

export function generateRelationshipContext(
  daysTogether: number,
  conversationCount: number,
  intimacyLevel: number
): string {
  if (daysTogether >= 365) {
    return `우린 벌써 1년 넘게 함께했어! 정말 친한 사이야.`;
  } else if (daysTogether >= 30) {
    return `${Math.floor(daysTogether / 30)}달 넘게 함께했어. 많이 친해졌지?`;
  } else if (daysTogether >= 7) {
    return `함께한 지 ${daysTogether}일이야. 점점 익숙해지고 있어.`;
  } else if (conversationCount >= 5) {
    return `우린 이미 ${conversationCount}번 대화했어. 이제 꽤 친해졌지?`;
  } else {
    return `아직 만난 지 얼마 안 됐어. 앞으로 잘 부탁해!`;
  }
}

export function getTimeSeasonContext(): { timeContext: string; seasonContext: string } {
  const timeOfDay = getTimeOfDay();
  const season = getSeason();
  
  const timeInfo = TIME_CONTEXTS[timeOfDay] || { greeting: '', feeling: '' };
  const seasonInfo = SEASONS[season] || { characteristic: '', advice: '' };
  
  return {
    timeContext: `${timeInfo.greeting}. ${timeInfo.feeling}`,
    seasonContext: `${seasonInfo.characteristic}. ${seasonInfo.advice}`,
  };
}