import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { calculateVitals } from '@/lib/vitals';
import PlantSearchModal from './PlantSearchModal';
import type { CareActivityType } from '@/types/database';

const FLOATING_PLANTS = ['🌿', '🍃', '🌱', '✨', '🌾', '🍀'];

const CARE_ACTIVITIES: { type: CareActivityType; label: string; icon: string }[] = [
  { type: 'watering', label: '물주기', icon: '💧' },
  { type: 'misting', label: '분무', icon: '🌫️' },
  { type: 'leaf_cleaning', label: '잎닦기', icon: '🍃' },
  { type: 'fertilizing', label: '영양제', icon: '🧪' },
  { type: 'repotting', label: '분갈이', icon: '🪴' },
];

interface BurstParticle {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

export default function GreenStarCard() {
  const { weather, myPlants, selectedPlant, setSelectedPlant, updateMyPlant, addCareLog } = useAppStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const [glowIntensity, setGlowIntensity] = useState(0);

  const currentPlant = selectedPlant || myPlants[0] || null;
  const vitals = useMemo(() => calculateVitals(weather, currentPlant), [weather, currentPlant]);

  const careSuggestion = useMemo(() => {
    if (!currentPlant) return '반려식물을 등록해주세요';
    if (currentPlant.soil_moisture_level === 'dry') return '흙이 말랐어요. 물을 듬뿍 주세요! 💧';

    const now = new Date();
    const lastWatered = new Date(currentPlant.last_watered_at);
    const diffDays = (now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24);
    const expectedInterval = (currentPlant.typical_dry_interval_days || 7) * (currentPlant.calibration_factor || 1.0);
    const progress = diffDays / expectedInterval;

    if (progress >= 1.0) {
      const overdue = Math.floor(diffDays - expectedInterval);
      return overdue > 0
        ? `예상 확인 시점을 ${overdue}일 지났어요. 흙을 확인해줄래? 🌱`
        : '예상 확인 시점이에요! 지금 흙 상태를 확인해볼까요? ✨';
    } else if (progress >= 0.7) {
      const daysLeft = Math.ceil(expectedInterval - diffDays);
      return `곧 흙 상태를 확인할 시간이에요 (약 ${daysLeft}일 후) ⌛`;
    } else {
      const daysLeft = Math.ceil(expectedInterval - diffDays);
      return `다음 흙 확인까지 약 ${daysLeft}일 남았어요 🌿`;
    }
  }, [currentPlant]);

  const triggerResonance = () => {
    const emojis = ['✨', '🌟', '💫', '⭐', '🌿', '🍃'];
    const particles: BurstParticle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
    }));
    setBurstParticles(particles);
    setGlowIntensity(1);
    setTimeout(() => {
      setBurstParticles([]);
      setGlowIntensity(0);
    }, 1500);
  };

  const handleCareAction = async (activityType: CareActivityType) => {
    if (!currentPlant || isActionLoading) return;
    setIsActionLoading(true);

    const now = new Date();
    const nowStr = now.toISOString();

    addCareLog({
      id: crypto.randomUUID(),
      plant_id: currentPlant.id,
      activity_type: activityType,
      amount_ml: activityType === 'watering' ? (currentPlant.water_amount_ml || 200) : undefined,
      timestamp: nowStr,
    });

    if (activityType === 'watering') {
      const lastWateredAt = new Date(currentPlant.last_watered_at);
      const actualInterval = (now.getTime() - lastWateredAt.getTime()) / (1000 * 60 * 60 * 24);
      const oldInterval = currentPlant.typical_dry_interval_days || 7;
      let newInterval = oldInterval;
      if (actualInterval > 1 && actualInterval < 30) {
        newInterval = Math.round(oldInterval * 0.7 + actualInterval * 0.3);
      }

      updateMyPlant({
        ...currentPlant,
        last_watered_at: nowStr,
        soil_moisture_level: 'moist',
        typical_dry_interval_days: newInterval,
      });
    }

    triggerResonance();
    setIsActionLoading(false);
  };

  const getVitalColor = (value: number) => {
    if (value >= 70) return 'bg-lime';
    if (value >= 40) return 'bg-sunlight';
    return 'bg-destructive';
  };

  return (
    <>
      <div className="relative w-full">
        {/* Burst particles */}
        <AnimatePresence>
          {burstParticles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              animate={{ opacity: 0, x: p.x, y: p.y, scale: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute left-1/2 top-1/3 text-xl pointer-events-none z-10"
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Header - Planet */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden">
          {/* Floating plant emojis */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {FLOATING_PLANTS.map((emoji, i) => (
              <motion.span
                key={i}
                className="absolute text-sm opacity-20"
                style={{
                  left: `${15 + i * 13}%`,
                  top: `${20 + (i % 3) * 25}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.15, 0.3, 0.15],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.8,
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>

          {/* Planet avatar */}
          <div className="flex flex-col items-center relative z-[1]">
            <motion.div
              animate={{
                boxShadow: glowIntensity > 0
                  ? '0 0 60px rgba(168, 214, 114, 0.5), 0 0 120px rgba(168, 214, 114, 0.2)'
                  : '0 0 30px rgba(168, 214, 114, 0.1)',
              }}
              className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden mb-3 animate-float"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              {currentPlant?.img_url ? (
                <img src={currentPlant.img_url} alt="plant" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl">🌿</span>
              )}
            </motion.div>

            <h1 className="text-xl font-semibold text-foreground">
              {currentPlant ? currentPlant.nickname : '초록별'}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {currentPlant ? currentPlant.plant_name : '나만의 반려식물 행성'}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              📍 {weather?.cityName || '위치 확인 중'}
              {weather && <span> · {weather.description}</span>}
            </p>
          </div>
        </div>

        {/* 4 Vitals */}
        <div className="glass rounded-2xl p-4 mt-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-foreground">4대 바이탈</h2>
            {!currentPlant && <span className="text-[10px] text-muted-foreground">식물 등록 후 활성화</span>}
          </div>

          {!currentPlant ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2 opacity-30">🌿</div>
              <p className="text-sm text-muted-foreground">반려식물이 아직 없어요</p>
              <p className="text-xs text-muted-foreground mt-1">하단의 버튼을 눌러 첫 식물을 등록해주세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'water', icon: '💧', label: '수분', data: vitals.water },
                { id: 'light', icon: '☀️', label: '조도', data: vitals.light },
                { id: 'air', icon: '💨', label: '통풍', data: vitals.air },
                { id: 'temp', icon: '🌡', label: '온도', data: vitals.temp },
              ].map((item) => (
                <div key={item.id} className="glass-light rounded-xl p-2.5 text-center">
                  <div className="text-xs mb-1.5">
                    {item.icon} <span className="text-muted-foreground">{item.label}</span>{' '}
                    <span className="text-foreground font-medium">{item.data.value}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.data.value}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className={`h-full rounded-full ${getVitalColor(item.data.value)}`}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1">{item.data.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Care Actions */}
        {currentPlant && (
          <div className="glass rounded-2xl p-4 mt-3 space-y-3">
            <div>
              <span className="text-[10px] text-muted-foreground">다음 케어 제안</span>
              <p className="text-sm text-foreground mt-0.5">{careSuggestion}</p>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {CARE_ACTIVITIES.map((act) => (
                <motion.button
                  key={act.type}
                  whileTap={{ scale: 0.9 }}
                  disabled={isActionLoading}
                  onClick={() => handleCareAction(act.type)}
                  className="flex flex-col items-center gap-1 py-2.5 rounded-xl glass-light hover:bg-foreground/5 transition-colors disabled:opacity-30"
                >
                  <span className="text-lg">{act.icon}</span>
                  <span className="text-[10px] text-muted-foreground">{act.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsSearchOpen(true)}
          className="w-full mt-3 py-3.5 rounded-2xl border border-secondary/40 text-secondary text-sm font-medium transition-colors cursor-pointer flex items-center justify-center gap-2 bg-secondary/5 hover:bg-secondary/10"
        >
          🌱 {currentPlant ? '새로운 반려식물 추가하기' : '첫 번째 식물을 등록해보세요'}
        </motion.button>
      </div>

      <PlantSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
