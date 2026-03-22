import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  plantId: string;
}

export default function DiaryList({ plantId }: Props) {
  const { diaryEntries, removeDiaryEntry } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const plantDiaries = useMemo(() => {
    return diaryEntries
      .filter((entry) => entry.plant_id === plantId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [diaryEntries, plantId]);

  const displayedDiaries = showAll ? plantDiaries : plantDiaries.slice(0, 3);

  if (plantDiaries.length === 0) {
    return (
      <div className="glass-light rounded-xl p-4 text-center">
        <div className="text-2xl mb-1 opacity-50">📝</div>
        <p className="text-xs text-muted-foreground">아직 일기가 없어요</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">첫 번째 일기를 작성해보세요!</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getWeatherEmoji = (condition?: string) => {
    if (!condition) return '';
    const map: Record<string, string> = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Snow: '❄️',
      Drizzle: '🌦️',
      Thunderstorm: '⛈️',
      Mist: '🌫️',
      Fog: '🌫️',
    };
    return map[condition] || '🌤️';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-muted-foreground">📝 초록별 일기 ({plantDiaries.length})</h3>
      </div>

      <div className="space-y-2 max-h-[40vh] overflow-y-auto scrollbar-hide">
        <AnimatePresence>
          {displayedDiaries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-light rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="w-full p-3 text-left flex items-start gap-3 hover:bg-foreground/5 transition-colors"
                >
                  {/* 썸네일 */}
                  {entry.image_url ? (
                    <img
                      src={entry.image_url}
                      alt="일기 사진"
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <span className="text-lg">🌱</span>
                    </div>
                  )}

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">{formatDate(entry.created_at)}</span>
                      {entry.weather_condition && (
                        <span className="text-[10px]">{getWeatherEmoji(entry.weather_condition)}</span>
                      )}
                      {entry.weather_temp !== undefined && (
                        <span className="text-[10px] text-muted-foreground">{entry.weather_temp}°C</span>
                      )}
                    </div>
                    <p className={`text-xs text-foreground/90 mt-0.5 ${isExpanded ? '' : 'line-clamp-2'}`}>
                      {entry.content}
                    </p>
                  </div>

                  {/* 펼침 아이콘 */}
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    className="text-xs text-muted-foreground shrink-0"
                  >
                    ▼
                  </motion.span>
                </button>

                {/* 펼친 상태 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border/50"
                    >
                      {entry.image_url && (
                        <img
                          src={entry.image_url}
                          alt="일기 사진"
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-3 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(entry.created_at).toLocaleString('ko-KR')}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDiaryEntry(entry.id);
                            setExpandedId(null);
                          }}
                          className="text-[10px] text-destructive/70 hover:text-destructive transition-colors"
                        >
                          삭제
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {plantDiaries.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAll ? '접기' : `${plantDiaries.length - 3}개 더보기`}
        </button>
      )}
    </div>
  );
}
