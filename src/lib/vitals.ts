import type { Weather, UserPlant, Vitals } from '@/types/database';

export function calculateVitals(weather: Weather | null, plant: UserPlant | null): Vitals {
  const empty = { value: 0, label: '데이터 없음' };
  if (!plant) return { water: empty, light: empty, air: empty, temp: empty };

  // Water vitals
  const now = new Date();
  const lastWatered = new Date(plant.last_watered_at);
  const diffDays = (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24);
  const expectedInterval = (plant.typical_dry_interval_days || 7) * (plant.calibration_factor || 1.0);
  const waterProgress = Math.max(0, 100 - (diffDays / expectedInterval) * 100);
  const waterLabel = waterProgress > 70 ? '충분' : waterProgress > 30 ? '보통' : '부족';

  // Light vitals
  let lightValue = 60;
  let lightLabel = '보통';
  if (weather) {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 20;
    const cloudFactor = 1 - (weather.clouds / 100) * 0.5;
    lightValue = isDay ? Math.round(80 * cloudFactor) : 10;
    lightLabel = lightValue > 70 ? '충분' : lightValue > 40 ? '보통' : '부족';
  }

  // Air vitals
  let airValue = 50;
  let airLabel = '보통';
  if (weather) {
    airValue = Math.min(100, Math.round(weather.windSpeed * 15 + 30));
    airLabel = airValue > 70 ? '좋음' : airValue > 40 ? '보통' : '환기 필요';
  }

  // Temp vitals
  let tempValue = 50;
  let tempLabel = '보통';
  if (weather) {
    const optMin = 18;
    const optMax = 27;
    if (weather.temp >= optMin && weather.temp <= optMax) {
      tempValue = 90;
      tempLabel = '적정';
    } else if (weather.temp < optMin) {
      tempValue = Math.max(10, 90 - (optMin - weather.temp) * 8);
      tempLabel = weather.temp < 10 ? '매우 낮음' : '낮음';
    } else {
      tempValue = Math.max(10, 90 - (weather.temp - optMax) * 8);
      tempLabel = weather.temp > 35 ? '매우 높음' : '높음';
    }
  }

  return {
    water: { value: Math.round(waterProgress), label: waterLabel },
    light: { value: lightValue, label: lightLabel },
    air: { value: airValue, label: airLabel },
    temp: { value: Math.round(tempValue), label: tempLabel },
  };
}
