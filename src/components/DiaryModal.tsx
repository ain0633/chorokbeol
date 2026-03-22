import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import Modal from './ModalWrapper';
import type { DiaryEntry } from '@/types/database';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiaryModal({ isOpen, onClose }: Props) {
  const { weather, selectedPlant, myPlants, addDiaryEntry } = useAppStore();
  const currentPlant = selectedPlant || myPlants[0] || null;
  
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!currentPlant || !content.trim()) return;
    
    setIsSaving(true);

    const entry: DiaryEntry = {
      id: crypto.randomUUID(),
      plant_id: currentPlant.id,
      content: content.trim(),
      image_url: imageUrl || undefined,
      weather_temp: weather?.temp,
      weather_condition: weather?.condition,
      created_at: new Date().toISOString(),
    };

    addDiaryEntry(entry);
    
    // 초기화
    setContent('');
    setImageUrl(null);
    setIsSaving(false);
    onClose();
  };

  const handleClose = () => {
    setContent('');
    setImageUrl(null);
    onClose();
  };

  const formatDate = () => {
    const now = new Date();
    return now.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">📝 초록별 일기</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">✕</button>
        </div>

        {!currentPlant ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2 opacity-30">🌿</div>
            <p className="text-sm text-muted-foreground">먼저 반려식물을 등록해주세요</p>
          </div>
        ) : (
          <>
            {/* 날짜 & 날씨 */}
            <div className="glass-light rounded-xl p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">{formatDate()}</div>
                <div className="text-sm font-medium text-foreground mt-0.5">
                  {currentPlant.nickname || currentPlant.plant_name}의 하루
                </div>
              </div>
              {weather && (
                <div className="text-right">
                  <div className="text-lg">
                    {weather.condition === 'Clear' ? '☀️' : 
                     weather.condition === 'Clouds' ? '☁️' :
                     weather.condition === 'Rain' ? '🌧️' :
                     weather.condition === 'Snow' ? '❄️' : '🌤️'}
                  </div>
                  <div className="text-xs text-muted-foreground">{weather.temp}°C</div>
                </div>
              )}
            </div>

            {/* 사진 첨부 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">사진 (선택)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imageUrl ? (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="첨부 사진"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setImageUrl(null)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/80 text-foreground text-xs flex items-center justify-center hover:bg-background transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-muted-foreground/50 transition-colors flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-xs text-muted-foreground">사진 추가하기</span>
                </motion.button>
              )}
            </div>

            {/* 메모 작성 */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">오늘의 메모</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="오늘 식물과 어떤 시간을 보냈나요? 🌱"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>

            {/* 저장 버튼 */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={!content.trim() || isSaving}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isSaving ? '저장 중...' : '🌿 일기 저장하기'}
            </motion.button>
          </>
        )}
      </div>
    </Modal>
  );
}
