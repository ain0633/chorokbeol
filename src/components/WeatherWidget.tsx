import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

const WEATHER_CONDITION_MAP: Record<string, { label: string; emoji: string }> = {
  Clear: { label: '맑음', emoji: '☀️' },
  Clouds: { label: '흐림', emoji: '☁️' },
  Rain: { label: '비', emoji: '🌧️' },
  Drizzle: { label: '이슬비', emoji: '🌦️' },
  Thunderstorm: { label: '천둥번개', emoji: '⛈️' },
  Snow: { label: '눈', emoji: '❄️' },
  Mist: { label: '안개', emoji: '🌫️' },
  Fog: { label: '안개', emoji: '🌫️' },
  Haze: { label: '실안개', emoji: '🌫️' },
};

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function WeatherWidget() {
  const { weather, isLoading, error, setLocation, setWeather, setLoading, setError } = useAppStore();

  useEffect(() => {
    if (weather) return; // Already loaded
    
    if (!navigator.geolocation) {
      setError('위치 정보를 지원하지 않는 브라우저입니다.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        setLocation({ lat, lon });

        try {
          // Use Open-Meteo (free, no API key needed)
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,cloud_cover&daily=sunrise,sunset&timezone=auto`
          );
          const data = await res.json();
          const current = data.current;

          // Map WMO weather codes to conditions
          const weatherCode = current.weather_code;
          let condition = 'Clear';
          let description = '맑음';
          if (weatherCode >= 1 && weatherCode <= 3) { condition = 'Clouds'; description = '구름'; }
          if (weatherCode >= 45 && weatherCode <= 48) { condition = 'Fog'; description = '안개'; }
          if (weatherCode >= 51 && weatherCode <= 57) { condition = 'Drizzle'; description = '이슬비'; }
          if (weatherCode >= 61 && weatherCode <= 67) { condition = 'Rain'; description = '비'; }
          if (weatherCode >= 71 && weatherCode <= 77) { condition = 'Snow'; description = '눈'; }
          if (weatherCode >= 80 && weatherCode <= 82) { condition = 'Rain'; description = '소나기'; }
          if (weatherCode >= 95) { condition = 'Thunderstorm'; description = '천둥번개'; }

          // Get city name from reverse geocoding
          let cityName = '내 위치';
          try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ko`);
            const geoData = await geoRes.json();
            cityName = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.county || '내 위치';
          } catch { /* ignore */ }

          setWeather({
            temp: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            humidity: current.relative_humidity_2m,
            condition,
            description,
            icon: '',
            cityName,
            windSpeed: current.wind_speed_10m / 3.6, // km/h to m/s
            uvi: 0,
            sunrise: new Date(data.daily.sunrise[0]).getTime() / 1000,
            sunset: new Date(data.daily.sunset[0]).getTime() / 1000,
            clouds: current.cloud_cover,
            visibility: 10000,
          });
        } catch {
          setError('날씨 정보를 불러오는데 실패했습니다.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('위치 접근이 거부되었습니다.');
        setLoading(false);
      }
    );
  }, []);

  const conditionInfo = weather ? WEATHER_CONDITION_MAP[weather.condition] || { label: weather.description, emoji: '🌤️' } : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 min-w-[200px]"
    >
      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="animate-pulse">🌍</span> 날씨 확인 중...
        </div>
      )}

      {error && (
        <div className="text-destructive text-xs">{error}</div>
      )}

      {weather && conditionInfo && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl">{conditionInfo.emoji}</span>
            <span className="text-2xl font-light text-foreground">{weather.temp}°</span>
          </div>
          <div className="text-xs text-muted-foreground">
            📍 {weather.cityName} · {conditionInfo.label}
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
            <span>체감 {weather.feelsLike}°</span>
            <span>습도 {weather.humidity}%</span>
            <span>🌅 {formatTime(weather.sunrise)}</span>
            <span>🌇 {formatTime(weather.sunset)}</span>
          </div>
        </div>
      )}

      {!weather && !isLoading && !error && (
        <div className="text-xs text-muted-foreground">날씨 데이터 대기 중</div>
      )}
    </motion.div>
  );
}
