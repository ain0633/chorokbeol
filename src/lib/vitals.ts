import type { Weather, UserPlant, Vitals, PlacementType, DirectionType, SoilType, VentilationLevel } from '@/types/database';

const PLACEMENT_LIGHT_FACTORS: Record<PlacementType, number> = {
  window: 1.0,
  indoor: 0.7,
  balcony: 0.9,
  office: 0.75,
};

const DIRECTION_LIGHT_FACTORS: Record<DirectionType, number> = {
  south: 1.15,
  east: 1.0,
  west: 0.9,
  north: 0.6,
};

const SOIL_MOISTURE_FACTORS: Record<SoilType, number> = {
  standard: 1.0,
  moss: 0.85,
  cactus: 1.2,
  hydro: 0.5,
};

const VENTILATION_AIR_FACTORS: Record<VentilationLevel, number> = {
  poor: 0.8,
  normal: 1.0,
  good: 1.15,
};

function getPlacementLightBonus(placement: string, direction: string): number {
  const placementFactor = PLACEMENT_LIGHT_FACTORS[placement as PlacementType] || 0.8;
  const directionFactor = DIRECTION_LIGHT_FACTORS[direction as DirectionType] || 1.0;
  return placementFactor * directionFactor;
}

function getSoilMoistureFactor(soilType: string): number {
  return SOIL_MOISTURE_FACTORS[soilType as SoilType] || 1.0;
}

function getVentilationFactor(ventilation: string): number {
  return VENTILATION_AIR_FACTORS[ventilation as VentilationLevel] || 1.0;
}

function getAcNearbyPenalty(hasAcNearby: boolean | undefined): number {
  return hasAcNearby ? 0.9 : 1.0;
}

function extractTempRange(tempRange: string): { min: number; max: number } {
  if (!tempRange) return { min: 18, max: 27 };
  const match = tempRange.match(/(\d+)/g);
  if (match && match.length >= 2) {
    return { 
      min: parseInt(match[0]), 
      max: parseInt(match[1]) 
    };
  }
  return { min: 18, max: 27 };
}

export function calculateVitals(weather: Weather | null, plant: UserPlant | null): Vitals {
  const empty = { value: 0, label: '데이터 없음' };
  if (!plant) return { water: empty, light: empty, air: empty, temp: empty };

  const now = new Date();
  const lastWatered = new Date(plant.last_watered_at);
  const diffDays = (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24);
  
  const soilFactor = getSoilMoistureFactor(plant.soil_type || 'standard');
  const expectedInterval = (plant.typical_dry_interval_days || 7) * (plant.calibration_factor || 1.0) * soilFactor;
  
  const waterProgress = Math.max(0, 100 - (diffDays / expectedInterval) * 100);
  const waterLabel = waterProgress > 70 ? '충분' : waterProgress > 30 ? '보통' : '부족';

  const placementBonus = getPlacementLightBonus(plant.placement_setting, plant.placement_direction);
  let lightValue = 60;
  let lightLabel = '보통';
  
  if (weather) {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 20;
    const cloudFactor = 1 - (weather.clouds / 100) * 0.5;
    const baseLight = isDay ? 80 : 10;
    lightValue = Math.round(baseLight * cloudFactor * placementBonus);
    lightValue = Math.min(100, Math.max(0, lightValue));
    lightLabel = lightValue > 70 ? '충분' : lightValue > 40 ? '보통' : '부족';
  } else {
    lightValue = Math.round(60 * placementBonus);
  }

  const ventilationFactor = getVentilationFactor(plant.ventilation_level || 'normal');
  const acPenalty = getAcNearbyPenalty(plant.has_ac_nearby);
  
  let airValue = 50;
  let airLabel = '보통';
  
  if (weather) {
    airValue = Math.min(100, Math.round(weather.windSpeed * 15 + 30) * ventilationFactor * acPenalty);
    airLabel = airValue > 70 ? '좋음' : airValue > 40 ? '보통' : '환기 필요';
  }

  const tempRangeValues = extractTempRange(plant.temp_range);
  const optMin = tempRangeValues.min;
  const optMax = tempRangeValues.max;
  
  let tempValue = 50;
  let tempLabel = '보통';
  
  if (weather) {
    if (weather.temp >= optMin && weather.temp <= optMax) {
      tempValue = 90;
      tempLabel = '적정';
    } else if (weather.temp < optMin) {
      tempValue = Math.max(10, 90 - (optMin - weather.temp) * 6);
      tempLabel = weather.temp < 10 ? '매우 낮음' : '낮음';
    } else {
      tempValue = Math.max(10, 90 - (weather.temp - optMax) * 6);
      tempLabel = weather.temp > 35 ? '매우 높음' : '높음';
    }
    
    if (plant.has_ac_nearby && weather.temp > optMax) {
      tempValue = Math.max(tempValue - 5, 10);
    }
  }

  return {
    water: { value: Math.round(waterProgress), label: waterLabel },
    light: { value: lightValue, label: lightLabel },
    air: { value: Math.round(airValue), label: airLabel },
    temp: { value: tempValue, label: tempLabel },
  };
}

export function getVitalsAdvice(plant: UserPlant, weather: Weather | null): string[] {
  const advice: string[] = [];
  const vitals = calculateVitals(weather, plant);
  
  if (vitals.water.value < 30) {
    const soilInfo = plant.soil_type === 'cactus' ? '다육용 흙은 배수가 잘되니 조심해서 물을 주세요' : '';
    advice.push(`수분이 부족해요! ${soilInfo}`);
  }
  
  if (vitals.light.value < 40) {
    if (plant.placement_setting === 'indoor') {
      advice.push('실내 안쪽이라 빛이 부족할 수 있어요. 창가 근처로 옮겨보세요.');
    } else if (plant.placement_direction === 'north') {
      advice.push('북향 창문은 빛이 약해요. 조명을 추가하거나 남향으로 옮기세요.');
    }
  }
  
  if (vitals.air.value < 40 && plant.ventilation_level === 'poor') {
    advice.push('환기가 잘 안돼요. 창문을 열어 환기를 시켜주세요.');
  }
  
  if (plant.has_ac_nearby) {
    advice.push('에어컨 근처는 건조할 수 있어요. 분무로 습도를 보충해주세요.');
  }
  
  return advice;
}

export function getNextWateringDate(plant: UserPlant): Date {
  const lastWatered = new Date(plant.last_watered_at);
  const soilFactor = getSoilMoistureFactor(plant.soil_type || 'standard');
  const interval = (plant.typical_dry_interval_days || 7) * (plant.calibration_factor || 1.0) * soilFactor;
  
  const nextDate = new Date(lastWatered);
  nextDate.setDate(nextDate.getDate() + Math.round(interval));
  
  return nextDate;
}

export function formatTimeUntilWatering(plant: UserPlant): string {
  const nextDate = getNextWateringDate(plant);
  const now = new Date();
  const diffMs = nextDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)}일 지남`;
  } else if (diffDays === 0) {
    return '오늘';
  } else if (diffDays === 1) {
    return '내일';
  } else {
    return `${diffDays}일 후`;
  }
}