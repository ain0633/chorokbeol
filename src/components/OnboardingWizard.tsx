import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './ModalWrapper';
import type { 
  PlacementType, 
  DirectionType, 
  PotType, 
  SoilType, 
  VentilationLevel,
  OnboardingData 
} from '@/types/database';

interface SelectedPlantData {
  name: string;
  img_url: string;
  cntntsNo: string;
  waterCycle: string;
  lightDemand: string;
  tempRange: string;
  interval: number;
  emoji?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedPlant: SelectedPlantData | null;
  onComplete: (data: OnboardingData) => void;
}

const PLACEMENT_OPTIONS: { value: PlacementType; label: string; emoji: string; desc: string }[] = [
  { value: 'window', label: '창가', emoji: '🪟', desc: '햇빛이 잘 드는 곳' },
  { value: 'indoor', label: '실내 안쪽', emoji: '🏠', desc: '간접광이 드는 곳' },
  { value: 'balcony', label: '베란다', emoji: '🌅', desc: '외부 공기와 맞닿은 곳' },
  { value: 'office', label: '사무실', emoji: '🏢', desc: '형광등 조명 환경' },
];

const DIRECTION_OPTIONS: { value: DirectionType; label: string; emoji: string }[] = [
  { value: 'south', label: '남향', emoji: '☀️' },
  { value: 'east', label: '동향', emoji: '🌅' },
  { value: 'west', label: '서향', emoji: '🌇' },
  { value: 'north', label: '북향', emoji: '🌫️' },
];

const POT_TYPE_OPTIONS: { value: PotType; label: string; emoji: string; desc: string }[] = [
  { value: 'general', label: '일반 화분', emoji: '🪴', desc: '배수구가 있는 화분' },
  { value: 'terrarium', label: '테라리움', emoji: '🫙', desc: '밀폐된 유리 용기' },
  { value: 'hydroponic', label: '수경 재배', emoji: '💧', desc: '물에서 키우는 방식' },
];

const SOIL_TYPE_OPTIONS: { value: SoilType; label: string; emoji: string; desc: string }[] = [
  { value: 'standard', label: '배양토', emoji: '🌱', desc: '일반 흙, 보습과 배수 균형' },
  { value: 'moss', label: '마사토', emoji: '🪨', desc: '배수가 매우 잘됨' },
  { value: 'cactus', label: '다육 전용', emoji: '🌵', desc: '모래 섞인 흙' },
  { value: 'hydro', label: '수경용', emoji: '💧', desc: '물 전용' },
];

const WATER_DATE_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: '오늘' },
  { value: 1, label: '어제' },
  { value: 2, label: '2일 전' },
  { value: 3, label: '3일 전' },
  { value: 7, label: '일주일 전' },
  { value: 14, label: '2주 전' },
];

export default function OnboardingWizard({ isOpen, onClose, selectedPlant, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState('');
  const [placement, setPlacement] = useState<PlacementType>('window');
  const [direction, setDirection] = useState<DirectionType>('south');
  const [lastWateredDays, setLastWateredDays] = useState(0);
  const [potType, setPotType] = useState<PotType>('general');
  const [soilType, setSoilType] = useState<SoilType>('standard');
  const [hasAcNearby, setHasAcNearby] = useState(false);
  const [ventilation, setVentilation] = useState<VentilationLevel>('normal');

  const resetAndClose = () => {
    setStep(1);
    setNickname('');
    setPlacement('window');
    setDirection('south');
    setLastWateredDays(0);
    setPotType('general');
    setSoilType('standard');
    setHasAcNearby(false);
    setVentilation('normal');
    onClose();
  };

  const handleComplete = () => {
    if (!selectedPlant) return;

    const lastWateredAt = new Date();
    lastWateredAt.setDate(lastWateredAt.getDate() - lastWateredDays);

    const data: OnboardingData = {
      plantName: selectedPlant.name,
      plantImgUrl: selectedPlant.img_url,
      cntntsNo: selectedPlant.cntntsNo,
      waterCycle: selectedPlant.waterCycle,
      lightDemand: selectedPlant.lightDemand,
      tempRange: selectedPlant.tempRange,
      interval: selectedPlant.interval,
      nickname: nickname || selectedPlant.name,
      lastWateredAt,
      placement,
      direction,
      potType,
      soilType,
      hasAcNearby,
      ventilation,
    };

    onComplete(data);
    resetAndClose();
  };

  if (!selectedPlant) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
        <div className="text-center py-8">
          <div className="text-4xl mb-2 opacity-30">🌱</div>
          <p className="text-sm text-muted-foreground">먼저 식물을 선택해주세요</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">🪐 초록별 탐사대장</h2>
          <button onClick={resetAndClose} className="text-muted-foreground hover:text-foreground transition-colors">✕</button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {selectedPlant.img_url ? (
            <img src={selectedPlant.img_url} alt={selectedPlant.name} className="w-10 h-10 object-cover rounded-lg" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
              {selectedPlant.emoji || '🌱'}
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-foreground">{selectedPlant.name}</div>
            <div className="text-[10px] text-muted-foreground">{selectedPlant.waterCycle}</div>
          </div>
        </div>

        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-lime' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <p className="text-sm text-foreground mb-1">🌟 이 친구를 뭐라고 부를까요?</p>
                <input
                  type="text"
                  placeholder="애칭을 입력 (선택)"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <p className="text-sm text-foreground mb-2">📍 행성의 어느 구역에 자리 잡았나요?</p>
                <div className="grid grid-cols-2 gap-2">
                  {PLACEMENT_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPlacement(opt.value)}
                      className={`p-3 rounded-xl text-left transition-colors ${
                        placement === opt.value
                          ? 'bg-lime/20 border border-lime/50'
                          : 'bg-muted/50 border border-border hover:border-lime/30'
                      }`}
                    >
                      <div className="text-xl mb-1">{opt.emoji}</div>
                      <div className="text-sm font-medium text-foreground">{opt.label}</div>
                      <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground mb-2">☀️ 창문 방향은요?</p>
                <div className="grid grid-cols-4 gap-2">
                  {DIRECTION_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDirection(opt.value)}
                      className={`p-2 rounded-xl text-center transition-colors ${
                        direction === opt.value
                          ? 'bg-lime/20 border border-lime/50'
                          : 'bg-muted/50 border border-border hover:border-lime/30'
                      }`}
                    >
                      <div className="text-lg">{opt.emoji}</div>
                      <div className="text-[10px] text-muted-foreground">{opt.label}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <p className="text-sm text-foreground mb-2">💧 마지막으로 수분을 공급한 시점은?</p>
                <div className="grid grid-cols-3 gap-2">
                  {WATER_DATE_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setLastWateredDays(opt.value)}
                      className={`p-2.5 rounded-xl text-center transition-colors ${
                        lastWateredDays === opt.value
                          ? 'bg-lime/20 border border-lime/50'
                          : 'bg-muted/50 border border-border hover:border-lime/30'
                      }`}
                    >
                      <div className="text-sm text-foreground">{opt.label}</div>
                    </motion.button>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-muted/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">
                    💡 <span className="text-foreground">Tip:</span> 식물의 권장 물주기는 <strong>{selectedPlant.waterCycle}</strong>입니다.
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground mb-2">🪴 마지막 흙 상태 체크 (선택)</p>
                <div className="flex gap-2">
                  {(['dry', 'moist', 'wet'] as const).map((level) => (
                    <motion.button
                      key={level}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 p-2 rounded-xl text-center bg-muted/50 border border-border text-xs text-muted-foreground"
                    >
                      {level === 'dry' ? '🏜️ 마름' : level === 'moist' ? '💧 적당' : '🌊 과습'}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <p className="text-sm text-foreground mb-2">🏺 어떤 화분에 살고 있나요?</p>
                <div className="grid grid-cols-3 gap-2">
                  {POT_TYPE_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPotType(opt.value)}
                      className={`p-3 rounded-xl text-center transition-colors ${
                        potType === opt.value
                          ? 'bg-lime/20 border border-lime/50'
                          : 'bg-muted/50 border border-border hover:border-lime/30'
                      }`}
                    >
                      <div className="text-xl mb-1">{opt.emoji}</div>
                      <div className="text-xs font-medium text-foreground">{opt.label}</div>
                      <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-foreground mb-2">🌱 어떤 흙을 쓰고 있나요?</p>
                <div className="grid grid-cols-2 gap-2">
                  {SOIL_TYPE_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.value}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSoilType(opt.value)}
                      className={`p-3 rounded-xl text-center transition-colors ${
                        soilType === opt.value
                          ? 'bg-lime/20 border border-lime/50'
                          : 'bg-muted/50 border border-border hover:border-lime/30'
                      }`}
                    >
                      <div className="text-xl mb-1">{opt.emoji}</div>
                      <div className="text-xs font-medium text-foreground">{opt.label}</div>
                      <div className="text-[10px] text-muted-foreground">{opt.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <p className="text-sm text-foreground mb-2">❄️ 특이사항이 있나요?</p>
                
                <div className="space-y-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setHasAcNearby(!hasAcNearby)}
                    className={`w-full p-4 rounded-xl text-left transition-colors ${
                      hasAcNearby
                        ? 'bg-lime/20 border border-lime/50'
                        : 'bg-muted/50 border border-border hover:border-lime/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">❄️</span>
                      <div>
                        <div className="text-sm font-medium text-foreground">에어컨 근처에 있어요</div>
                        <div className="text-[10px] text-muted-foreground">건조한 바람을 직접 받는 위치입니다</div>
                      </div>
                    </div>
                  </motion.button>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">환기 상태</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['poor', 'normal', 'good'] as const).map((v) => (
                        <motion.button
                          key={v}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setVentilation(v)}
                          className={`p-2.5 rounded-xl text-center transition-colors ${
                            ventilation === v
                              ? 'bg-lime/20 border border-lime/50'
                              : 'bg-muted/50 border border-border hover:border-lime/30'
                          }`}
                        >
                          <div className="text-xs text-foreground">
                            {v === 'poor' ? '🚫 환기 불량' : v === 'normal' ? '✅ 보통' : '💨 환기 좋음'}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-lime/10 rounded-xl border border-lime/30">
                <p className="text-sm font-medium text-foreground mb-2">📋 등록 요약</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>식물명:</span>
                    <span className="text-foreground">{nickname || selectedPlant.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>위치:</span>
                    <span className="text-foreground">
                      {PLACEMENT_OPTIONS.find(o => o.value === placement)?.label} ({DIRECTION_OPTIONS.find(o => o.value === direction)?.label})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>마지막 물:</span>
                    <span className="text-foreground">{WATER_DATE_OPTIONS.find(o => o.value === lastWateredDays)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>환경:</span>
                    <span className="text-foreground">
                      {POT_TYPE_OPTIONS.find(o => o.value === potType)?.label} / {SOIL_TYPE_OPTIONS.find(o => o.value === soilType)?.label}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 mt-4">
          {step > 1 && (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-xl border border-border text-muted-foreground text-sm hover:bg-muted/50 transition-colors"
            >
              ← 이전
            </motion.button>
          )}
          
          {step < 4 ? (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setStep(step + 1)}
              className="flex-1 py-3 rounded-xl bg-lime/20 border border-lime/50 text-lime text-sm font-medium hover:bg-lime/30 transition-colors"
            >
              다음 →
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              className="flex-1 py-3 rounded-xl bg-lime text-lime-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              ✨ 등록 완료
            </motion.button>
          )}
        </div>
      </div>
    </Modal>
  );
}