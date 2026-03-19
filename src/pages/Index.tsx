import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import GreenStarCard from '@/components/GreenStarCard';
import GardenList from '@/components/GardenList';
import WeatherWidget from '@/components/WeatherWidget';

function getWeatherTheme(condition: string, hour: number) {
  const isNight = hour < 6 || hour >= 20;

  if (isNight) {
    return {
      gradient: 'from-[#030a02] via-[#071a06] to-[#0d2b0a]',
      glowColor: 'rgba(30, 60, 30, 0.2)',
      particleCount: 50,
      overlay: null as string | null,
    };
  }

  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) {
    return {
      gradient: 'from-[#0a1a1a] via-[#0d2b0a] to-[#1a3040]',
      glowColor: 'rgba(60, 100, 140, 0.2)',
      particleCount: 15,
      overlay: 'rain' as string | null,
    };
  }
  if (c.includes('snow')) {
    return {
      gradient: 'from-[#0d1a1a] via-[#1a2a2a] to-[#1e3a3a]',
      glowColor: 'rgba(180, 200, 220, 0.15)',
      particleCount: 40,
      overlay: 'snow' as string | null,
    };
  }
  if (c.includes('cloud') || c.includes('mist') || c.includes('fog')) {
    return {
      gradient: 'from-[#0a1508] via-[#0d2b0a] to-[#1a3a18]',
      glowColor: 'rgba(100, 120, 100, 0.15)',
      particleCount: 20,
      overlay: null as string | null,
    };
  }
  return {
    gradient: 'from-[#050f04] via-[#0d2b0a] to-[#1e4a1a]',
    glowColor: 'rgba(45, 90, 39, 0.35)',
    particleCount: 28,
    overlay: null as string | null,
  };
}

export default function Index() {
  const { weather } = useAppStore();
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);

  const currentHour = new Date().getHours();
  const theme = useMemo(() => {
    const condition = weather?.condition || 'clear';
    return getWeatherTheme(condition, currentHour);
  }, [weather?.condition, currentHour]);

  useEffect(() => {
    const bgParticles = Array.from({ length: theme.particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      duration: Math.random() * 5 + 4,
      delay: Math.random() * 4,
    }));
    setParticles(bgParticles);
  }, [theme.particleCount]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Weather gradient background */}
      <div className={`fixed inset-0 bg-gradient-to-b ${theme.gradient} transition-all duration-1000`} />

      {/* Ambient glow orbs */}
      <div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background: theme.glowColor }}
      />
      <div
        className="fixed top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: theme.glowColor, opacity: 0.5 }}
      />

      {/* Rain overlay */}
      {theme.overlay === 'rain' && (
        <div className="fixed inset-0 pointer-events-none z-[2]">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-blue-300/20 rain-drop"
              style={{
                left: `${Math.random() * 100}%`,
                height: `${Math.random() * 20 + 10}px`,
                animationDuration: `${Math.random() * 0.5 + 0.5}s`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Snow overlay */}
      {theme.overlay === 'snow' && (
        <div className="fixed inset-0 pointer-events-none z-[2]">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-white/50 snow-flake"
              style={{
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 3 + 3}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Background particles (stars) */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed rounded-full bg-foreground/30 animate-twinkle pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 pt-4 pb-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xl">🌿</span>
            <span className="text-sm font-semibold text-foreground tracking-wide">Chorokbyeol</span>
          </motion.div>
          <WeatherWidget />
        </header>

        {/* Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8 max-w-md mx-auto w-full gap-4">
          <GardenList />
          <GreenStarCard />
        </main>

        {/* Footer tagline */}
        <footer className="text-center py-4">
          <p className="text-[10px] text-muted-foreground/50 tracking-widest">
            생명과 교감하는 가드닝 · Chorokbyeol
          </p>
        </footer>
      </div>
    </div>
  );
}
