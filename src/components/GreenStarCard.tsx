import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { calculateVitals } from '@/lib/vitals';
import PlantSearchModal from './PlantSearchModal';
import GreenPlanet from './GreenPlanet';
import VitalGauge from './VitalGauge';
import type { CareActivityType } from '@/types/database';

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
  const { weather, myPlants, selectedPlant, updateMyPlant, addCareLog } = useAppStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);
  const [glowIntensity, setGlowIntensity] = useState(0);

  const currentPlant = selectedPlant || myPlants[0] || null;
  const vitals = useMemo(() => calculateVitals(weather, currentPlant), [weather, currentPlant]);

  const careSuggestion = useMemo(() => {
    if (!currentPlant) return '반려식물을 등록해주세요 🌱';
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

  const vitalScore = (value: number) => {
    return Math.round(value * 5).toString();
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
              className="absolute left-1/2 top-1/4 text-xl pointer-events-none z-30"
            >
              {p.emoji}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* Green Planet */}
        <GreenPlanet glowIntensity={glowIntensity} />

        {/* AI 말풍선 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 px-2 -mt-4 mb-4"
        >
          <div className="shrink-0 w-7 h-7 rounded-full bg-lime/20 border border-lime/30 flex items-center justify-center text-[10px] font-bold text-lime">
            AI
          </div>
          <div className="glass-light rounded-xl rounded-bl-sm px-3 py-2.5 max-w-[80%]">
            <p className="text-xs text-foreground/90 leading-relaxed">{careSuggestion}</p>
          </div>
        </motion.div>

        {/* 4대 바이탈 게이지 */}
        <div className="mt-1">
          {!currentPlant ? (
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-4xl mb-2 opacity-30">🌿</div>
              <p className="text-sm text-muted-foreground">반려식물이 아직 없어요</p>
              <p className="text-xs text-muted-foreground mt-1">아래 버튼을 눌러 첫 식물을 등록해주세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <VitalGauge icon="💧" label="수분" value={vitals.water.value} score={vitalScore(vitals.water.value)} />
              <VitalGauge icon="☀️" label="조도" value={vitals.light.value} score={vitalScore(vitals.light.value)} />
              <VitalGauge icon="💨" label="통풍" value={vitals.air.value} score={vitalScore(vitals.air.value)} />
              <VitalGauge icon="🌡" label="온도" value={vitals.temp.value} score={vitalScore(vitals.temp.value)} />
            </div>
          )}
        </div>

        {/* 케어 액션 */}
        {currentPlant && (
          <div className="glass rounded-2xl p-4 mt-3">
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

        {/* 식물 등록 버튼 */}
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
