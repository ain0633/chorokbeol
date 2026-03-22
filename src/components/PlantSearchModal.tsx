import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import type { UserPlant, OnboardingData } from '@/types/database';
import Modal from './ModalWrapper';
import OnboardingWizard from './OnboardingWizard';
import {
  fetchPlantList,
  fetchPlantDetail,
  decodeLightCode,
  decodeWaterCode,
  decodeTempCode,
  decodeManageLevelCode,
  decodeGrowSpeedCode,
  decodeHumidityCode,
  getNongsaroImageUrl,
  type NongsaroPlant,
} from '@/lib/nongsaroApi';
import { getPersonaForPlant, generatePlantPersonaInfo } from '@/lib/personas';
import type { PlantPersonaInfo } from '@/types/database';

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

type PresetPlant = typeof PLANT_PRESETS[0];

interface NongsaroPlantDisplay {
  name: string;
  emoji: string;
  waterCycle: string;
  lightDemand: string;
  tempRange: string;
  interval: number;
  img_url: string;
  cntntsNo: string;
  isFromApi: true;
  manageLevel: string;
  growSpeed: string;
  humidity: string;
  adviceInfo: string;
}

type SelectedPlant = PresetPlant | NongsaroPlantDisplay;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlantSearchModal({ isOpen, onClose }: Props) {
  const { addMyPlant } = useAppStore();
  const [selectedPreset, setSelectedPreset] = useState<SelectedPlant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [nongsaroResults, setNongsaroResults] = useState<NongsaroPlant[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<NongsaroPlant | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const filteredPresets = PLANT_PRESETS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const searchNongsaro = useCallback(async (query: string) => {
    if (!query.trim()) {
      setNongsaroResults([]);
      return;
    }
    setIsLoadingApi(true);
    setApiError(null);
    try {
      const result = await fetchPlantList(query, 1, 20);
      setNongsaroResults(result.items);
    } catch (err) {
      setApiError('농사로 API 검색 실패');
      setNongsaroResults([]);
    } finally {
      setIsLoadingApi(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchNongsaro(searchQuery);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, searchNongsaro]);

  const handleSelectNongsaro = async (plant: NongsaroPlant) => {
    setIsLoadingDetail(true);
    const detail = await fetchPlantDetail(plant.cntntsNo);
    setIsLoadingDetail(false);

    const waterCycle = detail?.waterCycleSpringCode
      ? decodeWaterCode(detail.waterCycleSpringCode)
      : '정보 없음';
    const lightDemand = detail?.lightDemand
      ? decodeLightCode(detail.lightDemand)
      : '정보 없음';
    const tempRange = detail?.grwhTpCode
      ? decodeTempCode(detail.grwhTpCode)
      : '정보 없음';

    const display: NongsaroPlantDisplay = {
      name: plant.cntntsSj,
      emoji: '🌱',
      waterCycle,
      lightDemand,
      tempRange,
      interval: 7,
      img_url: getNongsaroImageUrl(plant.rtnFileUrl || ''),
      cntntsNo: plant.cntntsNo,
      isFromApi: true,
      manageLevel: detail?.manageLevel ? decodeManageLevelCode(detail.manageLevel) : '',
      growSpeed: detail?.growthAroma ? decodeGrowSpeedCode(detail.growthAroma) : '',
      humidity: detail?.humidity ? decodeHumidityCode(detail.humidity) : '',
      adviceInfo: detail?.adviceInfo || '',
    };

    if (detail) setSelectedDetail(detail);
    setSelectedPreset(display);
  };

  const handlePlantSelected = (plant: SelectedPlant, detail: NongsaroPlant | null) => {
    setSelectedPreset(plant);
    setSelectedDetail(detail);
    setShowWizard(true);
  };

  const handleWizardComplete = (data: OnboardingData) => {
    if (!selectedPreset) return;

    const isApi = 'isFromApi' in selectedPreset && selectedPreset.isFromApi;
    
    let personaInfo: PlantPersonaInfo;
    if (isApi && selectedDetail) {
      personaInfo = generatePlantPersonaInfo(selectedDetail);
    } else {
      const basePersona = getPersonaForPlant(selectedPreset.name);
      const fakePlant: NongsaroPlant = {
        cntntsNo: 'preset',
        cntntsSj: selectedPreset.name,
        lightDemand: '055002',
        waterCycleSpringCode: '053002',
        growthAroma: '058002',
        manageLevel: '089002',
        humidity: '083002',
        winterLwetTp: '10',
        summerMxtp: '30',
        orgplceInfo: undefined,
        adviceInfo: undefined,
        waterCycle: selectedPreset.waterCycle,
      };
      personaInfo = {
        ...generatePlantPersonaInfo(fakePlant),
        name: basePersona.name,
        personality: basePersona.coreTraits,
        speechStyle: basePersona.speechStyle,
        emoji: basePersona.emoji,
      };
    }

    const newPlant: UserPlant = {
      id: crypto.randomUUID(),
      cntnts_no: data.cntntsNo,
      plant_name: data.plantName,
      nickname: data.nickname,
      img_url: data.plantImgUrl,
      water_cycle: data.waterCycle,
      light_demand: data.lightDemand,
      temp_range: data.tempRange,
      last_watered_at: data.lastWateredAt.toISOString(),
      typical_dry_interval_days: data.interval,
      calibration_factor: 1.0,
      water_amount_ml: 200,
      placement_setting: data.placement,
      placement_direction: data.direction,
      pot_type: data.potType,
      soil_type: data.soilType,
      has_ac_nearby: data.hasAcNearby,
      ventilation_level: data.ventilation,
      created_at: new Date().toISOString(),
      persona_info: personaInfo,
    };

    addMyPlant(newPlant);
    
    setSelectedPreset(null);
    setSelectedDetail(null);
    setShowWizard(false);
    setSearchQuery('');
    setNongsaroResults([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedPreset(null);
    setSearchQuery('');
    setNongsaroResults([]);
    setSelectedDetail(null);
    setShowWizard(false);
    onClose();
  };

  const getSelectedPlantData = () => {
    if (!selectedPreset) return null;
    const isApi = 'isFromApi' in selectedPreset && selectedPreset.isFromApi;
    return {
      name: selectedPreset.name,
      img_url: isApi ? (selectedPreset as NongsaroPlantDisplay).img_url : '',
      cntntsNo: isApi ? (selectedPreset as NongsaroPlantDisplay).cntntsNo : '',
      waterCycle: selectedPreset.waterCycle,
      lightDemand: selectedPreset.lightDemand,
      tempRange: selectedPreset.tempRange,
      interval: selectedPreset.interval,
      emoji: isApi ? undefined : (selectedPreset as PresetPlant).emoji,
    };
  };

  return (
    <>
      <Modal isOpen={isOpen && !showWizard} onClose={handleClose} maxWidth="max-w-lg">
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
                  placeholder="식물 이름으로 검색... (농사로 API 연동)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />

                {filteredPresets.length > 0 && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-2 font-medium">인기 식물</div>
                    <div className="grid grid-cols-2 gap-2 max-h-[20vh] overflow-y-auto scrollbar-hide">
                      {filteredPresets.map((plant) => (
                        <motion.button
                          key={plant.name}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePlantSelected(plant, null)}
                          className="glass-light rounded-xl p-3 text-left hover:bg-foreground/5 transition-colors"
                        >
                          <div className="text-2xl mb-1">{plant.emoji}</div>
                          <div className="text-sm font-medium text-foreground">{plant.name}</div>
                          <div className="text-[10px] text-muted-foreground mt-1">{plant.waterCycle} · {plant.lightDemand}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {searchQuery.trim() && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-muted-foreground font-medium">농사로 검색 결과</span>
                      {isLoadingApi && (
                        <span className="text-xs text-muted-foreground animate-pulse">검색 중...</span>
                      )}
                    </div>
                    {apiError && (
                      <div className="text-xs text-red-400 mb-2">{apiError}</div>
                    )}
                    {nongsaroResults.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-[25vh] overflow-y-auto scrollbar-hide">
                        {nongsaroResults.map((plant) => {
                          const imgUrl = getNongsaroImageUrl(plant.rtnFileUrl || '');
                          return (
                            <motion.button
                              key={plant.cntntsNo}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSelectNongsaro(plant)}
                              className="glass-light rounded-xl p-3 text-left hover:bg-foreground/5 transition-colors"
                            >
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={plant.cntntsSj}
                                  className="w-12 h-12 object-cover rounded-lg mb-1"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              ) : (
                                <div className="text-2xl mb-1">🌱</div>
                              )}
                              <div className="text-sm font-medium text-foreground truncate">{plant.cntntsSj}</div>
                              <div className="text-[10px] text-muted-foreground mt-1">농사로 DB</div>
                            </motion.button>
                          );
                        })}
                      </div>
                    ) : (
                      !isLoadingApi && (
                        <div className="text-xs text-muted-foreground text-center py-3">
                          검색 결과가 없습니다
                        </div>
                      )
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <button 
                  onClick={() => { setSelectedPreset(null); setSelectedDetail(null); }} 
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← 다른 식물 선택
                </button>

                {isLoadingDetail ? (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2 animate-pulse">🌱</div>
                    <div className="text-sm text-muted-foreground">상세 정보 로딩 중...</div>
                  </div>
                ) : (
                  <>
                    <div className="glass-light rounded-xl p-4 text-center">
                      {'isFromApi' in selectedPreset && selectedPreset.img_url ? (
                        <img
                          src={selectedPreset.img_url}
                          alt={selectedPreset.name}
                          className="w-24 h-24 object-cover rounded-xl mx-auto mb-2"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="text-4xl mb-2">{selectedPreset.emoji}</div>
                      )}
                      <div className="text-base font-semibold text-foreground">{selectedPreset.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 space-x-2 flex flex-wrap justify-center gap-1">
                        <span>💧 {selectedPreset.waterCycle}</span>
                        <span>☀️ {selectedPreset.lightDemand}</span>
                        <span>🌡 {selectedPreset.tempRange}</span>
                      </div>

                      {'isFromApi' in selectedPreset && (selectedPreset as NongsaroPlantDisplay).manageLevel && (
                        <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
                          {(selectedPreset as NongsaroPlantDisplay).manageLevel && (
                            <div>🔧 관리 난이도: {(selectedPreset as NongsaroPlantDisplay).manageLevel}</div>
                          )}
                          {(selectedPreset as NongsaroPlantDisplay).growSpeed && (
                            <div>📈 생장 속도: {(selectedPreset as NongsaroPlantDisplay).growSpeed}</div>
                          )}
                          {(selectedPreset as NongsaroPlantDisplay).humidity && (
                            <div>💧 습도: {(selectedPreset as NongsaroPlantDisplay).humidity}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShowWizard(true)}
                      className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
                    >
                      다음 단계로 →
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      <OnboardingWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        selectedPlant={getSelectedPlantData()}
        onComplete={handleWizardComplete}
      />
    </>
  );
}