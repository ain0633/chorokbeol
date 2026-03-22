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
  Smoke: { label: '연기', emoji: '🌫️' },
  Dust: { label: '황사', emoji: '🏜️' },
  Sand: { label: '모래', emoji: '🏜️' },
  Ash: { label: '화산재', emoji: '🌋' },
  Squall: { label: '돌풍', emoji: '💨' },
  Tornado: { label: '토네이도', emoji: '🌪️' },
};

function formatTime(unix: number): string {
  return new Date(unix * 1000).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getUVIndex(uvi: number): { label: string; color: string } {
  if (uvi <= 2) return { label: '낮음', color: 'text-green-400' };
  if (uvi <= 5) return { label: '보통', color: 'text-yellow-400' };
  if (uvi <= 7) return { label: '높음', color: 'text-orange-400' };
  if (uvi <= 10) return { label: '매우높음', color: 'text-red-400' };
  return { label: '위험', color: 'text-purple-400' };
}

export default function WeatherWidget() {
  const { weather, isLoading, error, setLocation, setWeather, setLoading, setError } = useAppStore();

  useEffect(() => {
    if (weather) return;
    
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
          const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;
          
          if (!apiKey) {
            setError('OpenWeatherMap API 키가 설정되지 않았습니다.');
            setLoading(false);
            return;
          }

          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`
          );

          if (!res.ok) {
            throw new Error('날씨 API 요청 실패');
          }

          const data = await res.json();

          const cityName = data.name || '내 위치';
          const condition = data.weather[0]?.main || 'Clear';
          const description = data.weather[0]?.description || '맑음';

          setWeather({
            temp: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            condition,
            description,
            icon: data.weather[0]?.icon || '',
            cityName,
            windSpeed: data.wind.speed,
            uvi: 0,
            sunrise: data.sys.sunrise,
            sunset: data.sys.sunset,
            clouds: data.clouds.all,
            visibility: data.visibility || 10000,
          });
        } catch (err) {
          console.error('Weather API error:', err);
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