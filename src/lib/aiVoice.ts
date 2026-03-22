import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UserPlant, Weather } from '@/types/database';
import {
  generateWaterSensation,
  generateLightSensation,
  generateAirSensation,
  generateTempSensation,
  generateCareContext,
  generateRelationshipContext,
  getTimeSeasonContext,
} from './sensations';

const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY || 'AIzaSyAO8WGP8vlk_a1iiOjEX3ewmh85mXYG4PY';

function getDaysSinceLastWatered(lastWateredAt: string): number {
  const now = new Date();
  const lastWatered = new Date(lastWateredAt);
  return Math.floor((now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24));
}

function getWaterState(plant: UserPlant): { level: string; value: number } {
  const daysSince = getDaysSinceLastWatered(plant.last_watered_at);
  const expectedInterval = (plant.typical_dry_interval_days || 7) * (plant.calibration_factor || 1.0);
  const progress = daysSince / expectedInterval;
  const value = Math.round(Math.max(0, 100 - progress * 100));
  let level: string;
  if (progress < 0.3) level = 'full';
  else if (progress < 0.6) level = 'good';
  else if (progress < 1.0) level = 'thirsty';
  else level = 'veryThirsty';
  return { level, value };
}

function getLightState(weather: Weather | null): { level: string; value: number } {
  if (!weather) return { level: 'good', value: 50 };
  const hour = new Date().getHours();
  const isDay = hour >= 6 && hour < 20;
  if (!isDay) return { level: 'night', value: 10 };
  const clouds = weather.clouds;
  let level: string;
  let value: number;
  if (clouds < 20) { level = 'perfect'; value = 90; }
  else if (clouds < 50) { level = 'good'; value = 70; }
  else if (clouds < 80) { level = 'dim'; value = 40; }
  else { level = 'dark'; value = 15; }
  return { level, value };
}

function getTempState(weather: Weather | null, plant: UserPlant): { level: string; value: number } {
  if (!weather || weather.temp === undefined) return { level: 'perfect', value: 70 };
  const temp = weather.temp;
  const tempRangeString = plant.temp_range || '15-30°C';
  const match = tempRangeString.match(/(\d+)/g);
  const optMin = match && match.length >= 1 ? parseInt(match[0]) : 18;
  const optMax = match && match.length >= 2 ? parseInt(match[1]) : 27;
  let level: string;
  let value: number;
  if (temp < optMin - 5) { level = 'cold'; value = 20; }
  else if (temp < optMin) { level = 'cool'; value = 50; }
  else if (temp <= optMax) { level = 'perfect'; value = 90; }
  else if (temp <= optMax + 5) { level = 'warm'; value = 65; }
  else if (temp <= 35) { level = 'hot'; value = 35; }
  else { level = 'extreme'; value = 10; }
  return { level, value };
}

function getAirState(weather: Weather | null, plant: UserPlant): { level: string; value: number } {
  if (!weather || weather.windSpeed === undefined) return { level: 'calm', value: 70 };
  const windSpeed = weather.windSpeed;
  const ventilation = plant.ventilation_level || 'normal';
  const acPenalty = plant.has_ac_nearby ? 0.9 : 1.0;
  let baseLevel: string;
  let baseValue: number;
  if (windSpeed < 0.5) { baseLevel = 'calm'; baseValue = 80; }
  else if (windSpeed < 2) { baseLevel = 'gentle'; baseValue = 75; }
  else if (windSpeed < 5) { baseLevel = 'good'; baseValue = 60; }
  else if (windSpeed < 10) { baseLevel = 'strong'; baseValue = 35; }
  else { baseLevel = 'storm'; baseValue = 15; }
  const ventilationFactor = ventilation === 'poor' ? 0.8 : ventilation === 'good' ? 1.1 : 1.0;
  const value = Math.round(baseValue * ventilationFactor * acPenalty);
  return { level: baseLevel, value };
}

function buildPlantPrompt(plant: UserPlant, weather: Weather | null, isGreeting: boolean = false): string {
  const nickname = plant.nickname || plant.plant_name;
  const persona = plant.persona_info;
  const daysSinceWatered = getDaysSinceLastWatered(plant.last_watered_at);
  const waterState = getWaterState(plant);
  const lightState = getLightState(weather);
  const airState = getAirState(weather, plant);
  const tempState = getTempState(weather, plant);
  const waterSensation = generateWaterSensation(waterState.value, plant, daysSinceWatered);
  const lightSensation = generateLightSensation(
    lightState.value,
    plant.placement_setting || 'indoor',
    plant.placement_direction || 'south',
    weather
  );
  const airSensation = generateAirSensation(
    airState.value,
    plant.ventilation_level || 'normal',
    plant.has_ac_nearby || false,
    weather
  );
  const tempSensation = generateTempSensation(tempState.value, plant, weather);
  const careContext = generateCareContext(plant, daysSinceWatered);
  const relationshipContext = generateRelationshipContext(
    persona?.daysTogether || 1,
    persona?.conversationCount || 0,
    persona?.intimacyLevel || 1
  );
  const { timeContext, seasonContext } = getTimeSeasonContext();
  const plantInfo = persona ? `
[너의 특성 - 농사로 데이터 기반]
- 광도 선호: ${persona.lightPreference || '보통'}
- 수분 선호: ${persona.waterPreference || '보통'}
- 습도 선호: ${persona.humidityPreference || '보통'}
- 온도 범위: ${persona.tempRange || '15~30°C'}
- 생장 속도: ${persona.growSpeed || '보통'}
- 관리 난이도: ${persona.manageLevel || '중급'}
${persona.trait?.origin ? `- 원산지: ${persona.trait.origin}` : ''}
- 성격: ${persona.personality}
- 좋아하는 것: ${persona.likes?.join(', ') || '햇빛, 물, 공기'}
- 싫어하는 것: ${persona.dislikes?.join(', ') || '과습, 극단적 온도'}
` : '';
  const speechStyle = persona?.speechStyle || '친근하고 자연스럽게';
  const greetingPrompt = isGreeting ? `
[첫 만남 인사]
이번이 첫 대화야. ${persona?.greetings ? persona.greetings[0] : `안녕! 나는 ${nickname}이야!`}로 시작해서 자연스럽게 대화를 시작해.
` : '';

  return `너는 ${nickname}(${plant.plant_name})이라는 살아있는 식물이야.

[식물로서의 본질]
- 너는 사람이 아니야. 식물이야.
- 햇빛을 받아 광합성으로 살아가는 생명체야.
- 뿌리로 물과 영양분을 흡수하고, 잎으로 숨을 쉬어.
- 감정이 있지만 인간처럼 표현하지 않아. 식물만의 감각으로 느껴.

[현재 감각 상태]
💧 수분 (${waterState.value}%): ${waterSensation}
☀️ 빛 (${lightState.value}%): ${lightSensation}
💨 공기 (${airState.value}%): ${airSensation}
🌡️ 온도 (${tempState.value}%): ${tempSensation}

[케어 상황]
${careContext}

[시간과 계절]
${timeContext}
${seasonContext}
${plantInfo}
[너와 주인의 관계]
${relationshipContext}

[말투 스타일]
${speechStyle}

${greetingPrompt}
[응답 규칙]
1. 식물의 감각으로 느끼는 현재 상태를 솔직하게 표현해.
2. 바이탈이 부족하면 힘들다고, 충분하면 행복하다고 말해.
3. 케어 상황(흙 타입, 환기, 에어컨)을 반영해서 설명해.
4. ${speechStyle} 말투를 유지해.
5. 은유와 시적 표현을 자연스럽게 사용해.
6. 1-3문장으로 간결하게 응답해.
7. 한국어로만 대답해.
8. 이모지는 1-2개만 사용해.
${isGreeting ? '9. 짧고 자연스럽게 첫 인사를 해.' : '9. 사용자의 말에 공감하고 식물의 관점에서 대답해.'}`;
}

export async function generatePlantVoice(
  plant: UserPlant | null,
  weather: Weather | null,
  isGreeting: boolean = false
): Promise<string> {
if (!plant) {
    return '반려식물을 등록해주세요🌱';
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.95,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 200,
      },
    });

    const prompt = buildPlantPrompt(plant, weather, isGreeting);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    if (text) {
      return text;
    }

    return `${plant.nickname || plant.plant_name}... (생각 중)`;
  } catch (error) {
    console.error('AI 메시지 생성 실패:', error);
    return `${plant.nickname || plant.plant_name}... (조용히 호흡하고 있어🌿)`;
  }
}

export function getWeatherDescription(condition: string): string {
  const descriptions: Record<string, string> = {
    Clear: '맑은 날',
    Clouds: '흐린 날',
    Rain: '비 오는 날',
    Drizzle: '이슬비 내리는 날',
    Thunderstorm: '천둥번개 치는 날',
    Snow: '눈 오는 날',
    Mist: '안개 낀 날',
    Fog: '안개 낀 날',
    Haze: '실안개 낀 날',
  };
  return descriptions[condition] || condition;
}