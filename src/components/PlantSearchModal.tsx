import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import type { UserPlant, SAMPLE_PLANTS } from '@/types/database';
import Modal from './ModalWrapper';

// Popular houseplant presets
const PLANT_PRESETS = [
  { name: '몬스테라 델리시오사', emoji: '🌿', waterCycle: '주 1-2회', lightDemand: '밝은 간접광', tempRange: '18-27°C', interval: 7 },
  { name: '스투키', emoji: '🪴', waterCycle: '월 1-2회', lightDemand: '반양지', tempRange: '15-30°C', interval: 14 },
  { name: '아레카야자', emoji: '🌴', waterCycle: '주 2-3회', lightDemand: '밝은 간접광', tempRange: '18-24°C', interval: 4 },
  { name: '스파티필럼', emoji: '🤍', waterCycle: '주 1-2회', lightDemand: '반음지', tempRange: '16-24°C', interval: 5 },
  { name: '포토스', emoji: '💚', waterCycle: '주 1회', lightDemand: '반음지~반양지', tempRange: '15-25°C', interval: 7 },
  { name: '산세베리아', emoji: '🐍', waterCycle: '월 1-2회', lightDemand: '밝은 간접광', tempRange: '15-30°C', interval: 14 },
  { name: '고무나무', emoji: '🌳', waterCycle: '주 1회', lightDemand: '밝은 간접광', tempRange: '18-28°C', interval: 7 },
  { name: '행운목', emoji: '🎋', waterCycle: '주 1회', lightDemand: '반양지', tempRange: '18-24°C', interval: 7 },
  { name: '다육식물', emoji: '🌵', waterCycle: '월 2-3회', lightDemand: '직사광선', tempRange: '15-30°C', interval: 10 },
  { name: '장미', emoji: '🌹', waterCycle: '주 2-3회', lightDemand: '직사광선', tempRange: '15-25°C', interval: 3 },
  { name: '라벤더', emoji: '💜', waterCycle: '주 1회', lightDemand: '직사광선', tempRange: '15-25°C', interval: 7 },
  { name: '바질', emoji: '🌱', waterCycle: '매일', lightDemand: '직사광선', tempRange: '18-30°C', interval: 2 },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlantSearchModal({ isOpen, onClose }: Props) {
  const { addMyPlant } = useAppStore();
  const [selectedPreset, setSelectedPreset] = useState<typeof PLANT_PRESETS[0] | null>(null);
  const [nickname, setNickname] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlants = PLANT_PRESETS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegister = () => {
    if (!selectedPreset) return;
    
    const newPlant: UserPlant = {
      id: crypto.randomUUID(),
      cntnts_no: '',
      plant_name: selectedPreset.name,
      nickname: nickname || selectedPreset.name,
      img_url: '',
      water_cycle: selectedPreset.waterCycle,
      light_demand: selectedPreset.lightDemand,
      temp_range: selectedPreset.tempRange,
      last_watered_at: new Date().toISOString(),
      typical_dry_interval_days: selectedPreset.interval,
      calibration_factor: 1.0,
      water_amount_ml: 200,
      placement_setting: 'indoor',
      placement_direction: 'south',
      created_at: new Date().toISOString(),
    };

    addMyPlant(newPlant);
    setSelectedPreset(null);
    setNickname('');
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSelectedPreset(null);
    setNickname('');
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">🌱 식물 등록하기</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">✕</button>
        </div>

        <AnimatePresence mode="wait">
          {!selectedPreset ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <input
                type="text"
                placeholder="식물 이름으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="grid grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto scrollbar-hide">
                {filteredPlants.map((plant) => (
                  <motion.button
                    key={plant.name}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPreset(plant)}
                    className="glass-light rounded-xl p-3 text-left hover:bg-foreground/5 transition-colors"
                  >
                    <div className="text-2xl mb-1">{plant.emoji}</div>
                    <div className="text-sm font-medium text-foreground">{plant.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{plant.waterCycle} · {plant.lightDemand}</div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <button onClick={() => setSelectedPreset(null)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                ← 다른 식물 선택
              </button>
              
              <div className="glass-light rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">{selectedPreset.emoji}</div>
                <div className="text-base font-semibold text-foreground">{selectedPreset.name}</div>
                <div className="text-xs text-muted-foreground mt-1 space-x-2">
                  <span>💧 {selectedPreset.waterCycle}</span>
                  <span>☀️ {selectedPreset.lightDemand}</span>
                  <span>🌡 {selectedPreset.tempRange}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">애칭 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 몬몬이, 초록이..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleRegister}
                className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                🌿 등록하기
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
