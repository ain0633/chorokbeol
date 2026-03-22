import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { 
  startBackgroundSync, 
  stopBackgroundSync, 
  getDefaultSettings,
  type NotificationSettings as LocalNotificationSettings 
} from '@/lib/backgroundSync';

interface ReminderContextType {
  isEnabled: boolean;
  startSync: () => void;
  stopSync: () => void;
}

const ReminderContext = createContext<ReminderContextType>({
  isEnabled: false,
  startSync: () => {},
  stopSync: () => {},
});

export function ReminderProvider({ children }: { children: ReactNode }) {
  const { myPlants, weather } = useAppStore();
  
  useEffect(() => {
    const settings: LocalNotificationSettings = getDefaultSettings();
    
    if (myPlants.length === 0 || !settings.pushEnabled) {
      stopBackgroundSync();
      return;
    }
    
    startBackgroundSync(
      () => myPlants,
      () => weather,
      () => settings
    );
    
    return () => {
      stopBackgroundSync();
    };
  }, [myPlants, weather]);
  
  const startSync = () => {
    const settings: LocalNotificationSettings = getDefaultSettings();
    if (settings.pushEnabled) {
      startBackgroundSync(
        () => myPlants,
        () => weather,
        () => settings
      );
    }
  };
  
  const stopSync = () => {
    stopBackgroundSync();
  };
  
  const settings: LocalNotificationSettings = getDefaultSettings();
  const isEnabled = settings.pushEnabled && myPlants.length > 0;
  
  return (
    <ReminderContext.Provider value={{ isEnabled, startSync, stopSync }}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminderContext() {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminderContext must be used within ReminderProvider');
  }
  return context;
}