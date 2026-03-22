import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { getNextReminders, formatTimeUntilWatering, getWateringMessage } from '@/lib/scheduler';
import { canSendNotifications } from '@/lib/notifications';

export default function ScheduleWidget() {
  const { myPlants, weather } = useAppStore();

  const schedules = useMemo(() => {
    if (myPlants.length === 0) return [];
    return getNextReminders(myPlants, weather);
  }, [myPlants, weather]);

  const hasNotificationPermission = canSendNotifications();

  const prioritySchedules = schedules.filter((s) => s.priority === 'high').slice(0, 3);

  if (myPlants.length === 0) return null;

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-medium text-muted-foreground">
          📅 다가오는 일정 ({schedules.length})
        </h3>
        {!hasNotificationPermission && (
          <span className="text-[10px] text-orange-400">알림 꺼짐</span>
        )}
      </div>

      {prioritySchedules.length === 0 ? (
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground">
            ✅ 급한 일정이 없어요
          </p>
          {schedules.length > 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              다음: {schedules[0].plantName} - {formatTimeUntilWatering(schedules[0])}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {prioritySchedules.map((schedule, index) => (
            <motion.div
              key={schedule.plantId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-light rounded-xl p-3 ${
                schedule.isOverdue ? 'border border-orange-500/50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">
                    {schedule.isOverdue ? '🚨' : '💧'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {schedule.plantName}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {getWateringMessage(schedule)}
                      {schedule.weatherAdjusted && ' (날씨 반영)'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    schedule.isOverdue ? 'text-orange-400' : 'text-lime'
                  }`}>
                    {formatTimeUntilWatering(schedule)}
                  </p>
                  {schedule.isOverdue && (
                    <p className="text-[10px] text-orange-400">지남</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {schedules.length > 3 && (
        <button className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1">
          +{schedules.length - 3}개 더 보기
        </button>
      )}
    </div>
  );
}