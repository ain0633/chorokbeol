import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  startBackgroundSync, 
  stopBackgroundSync, 
  getDefaultSettings,
  getUpcomingSchedules,
  type NotificationSettings 
} from '@/lib/backgroundSync';
import type { SmartSchedule } from '@/lib/scheduler';

export function useReminderCheck() {
  const { myPlants, weather } = useAppStore();
  
  const checkReminders = useCallback(() => {
    if (myPlants.length === 0) return [];
    
    const settings = getDefaultSettings();
    return getUpcomingSchedules(myPlants, weather, 5);
  }, [myPlants, weather]);
  
  useEffect(() => {
    if (myPlants.length === 0) {
      stopBackgroundSync();
      return;
    }
    
    const settings = getDefaultSettings();
    
    if (settings.pushEnabled && settings.wateringReminder) {
      startBackgroundSync(
        () => myPlants,
        () => weather,
        () => settings
      );
    }
    
    return () => {
      stopBackgroundSync();
    };
  }, [myPlants, weather]);
  
  return {
    checkReminders,
    getUpcoming: useCallback(() => {
      const settings = getDefaultSettings();
      return getUpcomingSchedules(myPlants, weather, 5);
    }, [myPlants, weather]),
  };
}

export function useNotificationSettings() {
  const { notificationSettings, setNotificationSettings } = useAppStore();
  
  const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
    const current = notificationSettings || getDefaultSettings();
    const newSettings = { ...current, ...updates };
    setNotificationSettings(newSettings as any);
    localStorage.setItem('chorokbyeol-notification-settings', JSON.stringify(newSettings));
  }, [notificationSettings, setNotificationSettings]);
  
  const loadSettings = useCallback(() => {
    const saved = getDefaultSettings();
    setNotificationSettings(saved as any);
  }, [setNotificationSettings]);
  
  return {
    settings: notificationSettings || getDefaultSettings(),
    updateSettings,
    loadSettings,
  };
}

export function useScheduleOverview() {
  const { myPlants, weather } = useAppStore();
  
  const schedules = getUpcomingSchedules(myPlants, weather, 10);
  
  const overdueCount = schedules.filter((s) => s.isOverdue).length;
  const upcomingCount = schedules.filter((s) => !s.isOverdue && s.daysUntilWatering <= 2).length;
  const totalNeedsAttention = overdueCount + upcomingCount;
  
  const prioritySchedules = schedules
    .filter((s) => s.priority === 'high')
    .slice(0, 3);
  
  return {
    schedules,
    overdueCount,
    upcomingCount,
    totalNeedsAttention,
    prioritySchedules,
    hasOverdue: overdueCount > 0,
    needsAttention: totalNeedsAttention > 0,
  };
}