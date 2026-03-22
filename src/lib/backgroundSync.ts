import type { UserPlant, Weather } from '@/types/database';
import { calculateSmartSchedule, SmartSchedule } from './scheduler';
import { sendLocalNotification, requestNotificationPermission } from './notifications';

const CHECK_INTERVAL = 10 * 60 * 1000; // 10분
const NOTIFICATION_COOLDOWN = 60 * 60 * 1000; // 1시간

let syncInterval:ReturnType<typeof setInterval> | null = null;
let lastNotificationTime: Map<string, number> = new Map();

export interface NotificationSettings {
  pushEnabled: boolean;
  wateringReminder: boolean;
  weatherAlert: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

function isQuietHours(settings: NotificationSettings): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [startHours, startMinutes] = settings.quietHoursStart.split(':').map(Number);
  const [endHours, endMinutes] = settings.quietHoursEnd.split(':').map(Number);
  
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  
  if (startTotal > endTotal) {
    return currentMinutes >= startTotal || currentMinutes < endTotal;
  }
  
  return currentMinutes >= startTotal && currentMinutes < endTotal;
}

function canSendNotification(plantId: string): boolean {
  const lastTime = lastNotificationTime.get(plantId);
  if (!lastTime) return true;
  
  return Date.now() - lastTime > NOTIFICATION_COOLDOWN;
}

function markNotificationSent(plantId: string): void {
  lastNotificationTime.set(plantId, Date.now());
}

export async function checkAndNotify(
  plants: UserPlant[],
  weather: Weather | null,
  settings: NotificationSettings
): Promise<SmartSchedule[]> {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.log('알림 권한이 없습니다.');
    return [];
  }
  
  if (!settings.pushEnabled || !settings.wateringReminder) {
    return [];
  }
  
  if (isQuietHours(settings)) {
    console.log('조용한 시간입니다. 알림을 보내지 않습니다.');
    return [];
  }
  
  const schedules = plants
    .map((plant) => calculateSmartSchedule(plant, weather))
    .filter((schedule) => schedule.priority === 'high' || schedule.isOverdue);
  
  const notificationsToSend: SmartSchedule[] = [];
  
  for (const schedule of schedules) {
    if (!canSendNotification(schedule.plantId)) {
      continue;
    }
    
    const title = schedule.isOverdue
      ? `🚨 ${schedule.plantName}이 목말라요!`
      : `💧 ${schedule.plantName} 물주기 알림`;
    
    const body = schedule.isOverdue
      ? `${Math.abs(schedule.daysUntilWatering)}일 지났어요. 지금 바로 물을 주세요!`
      : '물 줄 시간이에요! 잊지 마세요.';
    
    await sendLocalNotification(title, {
      body,
      icon: '/icon-192.png',
      tag: `watering-${schedule.plantId}`,
      data: {
        plantId: schedule.plantId,
        action: 'water',
      },
    });
    
    markNotificationSent(schedule.plantId);
    notificationsToSend.push(schedule);
  }
  
  return notificationsToSend;
}

export function startBackgroundSync(
  getPlants: () => UserPlant[],
  getWeather: () => Weather | null,
  getSettings: () => NotificationSettings
): void {
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  checkAndNotify(getPlants(), getWeather(), getSettings());
  
  syncInterval = setInterval(() => {
    checkAndNotify(getPlants(), getWeather(), getSettings());
  }, CHECK_INTERVAL);
  
  console.log('백그라운드 알림 동기화 시작');
}

export function stopBackgroundSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log('백그라운드 알림 동기화 중지');
  }
}

export function getUpcomingSchedules(
  plants: UserPlant[],
  weather: Weather | null,
  limit: number = 5
): SmartSchedule[] {
  return plants
    .map((plant) => calculateSmartSchedule(plant, weather))
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.daysUntilWatering - b.daysUntilWatering;
    })
    .slice(0, limit);
}

export function getDefaultSettings(): NotificationSettings {
  const saved = localStorage.getItem('chorokbyeol-notification-settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  return {
    pushEnabled: true,
    wateringReminder: true,
    weatherAlert: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  };
}

export function saveSettings(settings: NotificationSettings): void {
  localStorage.setItem('chorokbyeol-notification-settings', JSON.stringify(settings));
}