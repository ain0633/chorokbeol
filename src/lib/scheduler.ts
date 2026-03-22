import type { UserPlant, Reminder, ReminderType, Weather } from '@/types/database';
import { getNextWateringDate } from './vitals';
import { sendLocalNotification, requestNotificationPermission } from './notifications';

export interface SmartSchedule {
  plantId: string;
  plantName: string;
  nextWatering: Date;
  daysUntilWatering: number;
  isOverdue: boolean;
  weatherAdjusted: boolean;
  priority: 'high' | 'medium' | 'low';
}

export function calculateSmartSchedule(
  plant: UserPlant,
  weather: Weather | null
): SmartSchedule {
  const nextWatering = getNextWateringDate(plant);
  const now = new Date();
  const daysUntilWatering = Math.ceil(
    (nextWatering.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  let weatherAdjusted = false;
  let adjustedDate = new Date(nextWatering);
  
  if (weather) {
    if (weather.temp > 30) {
      adjustedDate.setDate(adjustedDate.getDate() - 1);
      weatherAdjusted = true;
    } else if (weather.temp < 15) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      weatherAdjusted = true;
    }
    
    if (weather.condition === 'Rain' || weather.condition === 'Drizzle') {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      weatherAdjusted = true;
    }
    
    if (weather.humidity > 80) {
      adjustedDate.setDate(adjustedDate.getDate() + 1);
      weatherAdjusted = true;
    }
  }
  
  const soilType = plant.soil_type || 'standard';
  if (soilType === 'cactus') {
    adjustedDate.setDate(adjustedDate.getDate() + 1);
  } else if (soilType === 'moss') {
    adjustedDate.setDate(adjustedDate.getDate() - 0.5);
  }
  
  let priority: 'high' | 'medium' | 'low';
  if (daysUntilWatering <= 0) {
    priority = 'high';
  } else if (daysUntilWatering <= 2) {
    priority = 'medium';
  } else {
    priority = 'low';
  }
  
  return {
    plantId: plant.id,
    plantName: plant.nickname || plant.plant_name,
    nextWatering: adjustedDate,
    daysUntilWatering,
    isOverdue: daysUntilWatering < 0,
    weatherAdjusted,
    priority,
  };
}

export function generateReminders(plants: UserPlant[], weather: Weather | null): Reminder[] {
  const reminders: Reminder[] = [];
  const now = new Date();
  
  plants.forEach((plant) => {
    const schedule = calculateSmartSchedule(plant, weather);
    
    if (schedule.priority === 'high') {
      reminders.push({
        id: crypto.randomUUID(),
        user_id: '',
        plant_id: plant.id,
        reminder_type: 'watering',
        title: `${plant.nickname || plant.plant_name} 물주기 알림`,
        message: schedule.isOverdue 
         ? `${plant.nickname || plant.plant_name}이 물을 기다리고 있어요!` 
          : `곧 ${plant.nickname || plant.plant_name}에 물을 줄 시간이에요.`,
        scheduled_for: now.toISOString(),
        is_completed: false,
        is_repeatable: true,
        repeat_interval_days: plant.typical_dry_interval_days,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
    }
    
    if (plant.soil_moisture_level === 'dry') {
      reminders.push({
        id: crypto.randomUUID(),
        user_id: '',
        plant_id: plant.id,
        reminder_type: 'soil_check',
        title: `${plant.nickname || plant.plant_name} 흙 상태 확인`,
        message: '흙이 말랐어요. 상태를 확인해주세요!',
        scheduled_for: now.toISOString(),
        is_completed: false,
        is_repeatable: false,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      });
    }
  });
  
  return reminders;
}

export async function triggerWateringReminder(
  plant: UserPlant,
  schedule: SmartSchedule
): Promise<boolean> {
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.log('알림 권한이 없습니다.');
    return false;
  }
  
  const title = schedule.isOverdue 
    ? `🚨 ${plant.nickname || plant.plant_name}이 목말라요!`
    : `💧 ${plant.nickname || plant.plant_name} 물주기`;
  
  const body = schedule.isOverdue
    ? `${Math.abs(schedule.daysUntilWatering)}일 지났어요. 지금 바로 확인해주세요!`
    : schedule.weatherAdjusted
    ? '날씨 때문에 일정이 조정됐어요. 확인해주세요!'
    : '물 줄 시간이에요!';
  
  await sendLocalNotification(title, {
    body,
    icon: '/icon-192.png',
    tag: `watering-${plant.id}`,
    data: {
      plantId: plant.id,
      action: 'water',
    },
  });
  
  return true;
}

export function getNextReminders(plants: UserPlant[], weather: Weather | null): SmartSchedule[] {
  return plants
    .map((plant) => calculateSmartSchedule(plant, weather))
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      return a.daysUntilWatering - b.daysUntilWatering;
    });
}

export function getPriorityPlants(
  plants: UserPlant[],
  weather: Weather | null,
  limit: number = 3
): SmartSchedule[] {
  const schedules = getNextReminders(plants, weather);
  return schedules.filter((s) => s.priority === 'high').slice(0, limit);
}

export function formatTimeUntilWatering(schedule: SmartSchedule): string {
  if (schedule.isOverdue) {
    const days = Math.abs(schedule.daysUntilWatering);
    return `${days}일 지남`;
  }
  
  const hours = schedule.daysUntilWatering * 24;
  if (hours < 24) {
    return `약 ${hours}시간 후`;
  }
  
  return `${schedule.daysUntilWatering}일 후`;
}

export function getWateringMessage(schedule: SmartSchedule): string {
  if (schedule.isOverdue) {
    return '지금 바로 물을 줘야 해요!';
  }
  
  if (schedule.daysUntilWatering === 0) {
    return '오늘 물을 줘야 해요.';
  }
  
  if (schedule.daysUntilWatering === 1) {
    return '내일 물을 줘야 해요.';
  }
  
  return `${schedule.daysUntilWatering}일 후에 물을 줘야 해요.`;
}