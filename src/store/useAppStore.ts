import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPlant, Weather, Location, CareLog, CareActivityType, DiaryEntry, ChatMessage, Reminder, NotificationSettings } from '@/types/database';

interface AppState {
  location: Location | null;
  weather: Weather | null;
  isLoading: boolean;
  error: string | null;
  setLocation: (loc: Location) => void;
  setWeather: (w: Weather) => void;
  setLoading: (b: boolean) => void;
  setError: (e: string | null) => void;

  myPlants: UserPlant[];
  isMyPlantsLoading: boolean;
  selectedPlant: UserPlant | null;
  setMyPlants: (plants: UserPlant[]) => void;
  addMyPlant: (plant: UserPlant) => void;
  updateMyPlant: (plant: UserPlant) => void;
  removeMyPlant: (id: string) => void;
  setMyPlantsLoading: (b: boolean) => void;
  setSelectedPlant: (plant: UserPlant | null) => void;

  careLogs: CareLog[];
  addCareLog: (log: CareLog) => void;

  diaryEntries: DiaryEntry[];
  addDiaryEntry: (entry: DiaryEntry) => void;
  removeDiaryEntry: (id: string) => void;

  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChatMessages: (plantId: string) => void;

  reminders: Reminder[];
  addReminder: (reminder: Reminder) => void;
  removeReminder: (id: string) => void;
  completeReminder: (id: string) => void;
  setReminders: (reminders: Reminder[]) => void;

  notificationSettings: NotificationSettings | null;
  setNotificationSettings: (settings: NotificationSettings) => void;
  
  notificationPermission: NotificationPermission | 'default';
  setNotificationPermission: (permission: NotificationPermission) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      location: null,
      weather: null,
      isLoading: false,
      error: null,
      setLocation: (loc) => set({ location: loc }),
      setWeather: (w) => set({ weather: w }),
      setLoading: (b) => set({ isLoading: b }),
      setError: (e) => set({ error: e }),

      myPlants: [],
      isMyPlantsLoading: false,
      selectedPlant: null,
      setMyPlants: (plants) => set({ myPlants: plants }),
      addMyPlant: (plant) => set((s) => ({ 
        myPlants: [plant, ...s.myPlants],
        selectedPlant: plant,
      })),
      updateMyPlant: (plant) => set((s) => ({
        myPlants: s.myPlants.map((p) => (p.id === plant.id ? plant : p)),
        selectedPlant: s.selectedPlant?.id === plant.id ? plant : s.selectedPlant,
      })),
      removeMyPlant: (id) => set((s) => ({
        myPlants: s.myPlants.filter((p) => p.id !== id),
        selectedPlant: s.selectedPlant?.id === id ? null : s.selectedPlant,
      })),
      setMyPlantsLoading: (b) => set({ isMyPlantsLoading: b }),
      setSelectedPlant: (plant) => set({ selectedPlant: plant }),

      careLogs: [],
      addCareLog: (log) => set((s) => ({ careLogs: [log, ...s.careLogs] })),

      diaryEntries: [],
      addDiaryEntry: (entry) => set((s) => ({ diaryEntries: [entry, ...s.diaryEntries] })),
      removeDiaryEntry: (id) => set((s) => ({ diaryEntries: s.diaryEntries.filter((e) => e.id !== id) })),

      chatMessages: [],
      addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
      clearChatMessages: (plantId) => set((s) => ({ chatMessages: s.chatMessages.filter((m) => m.plant_id !== plantId) })),

      reminders: [],
      addReminder: (reminder) => set((s) => ({ reminders: [reminder, ...s.reminders] })),
      removeReminder: (id) => set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),
      completeReminder: (id) => set((s) => ({ 
        reminders: s.reminders.map((r) => 
          r.id === id ? { ...r, is_completed: true } : r
        ) 
      })),
      setReminders: (reminders) => set({ reminders }),

      notificationSettings: null,
      setNotificationSettings: (settings) => set({ notificationSettings: settings }),
      
      notificationPermission: 'default',
      setNotificationPermission: (permission) => set({ notificationPermission: permission }),
    }),
    {
      name: 'chorokbyeol-store',
      partialize: (state) => ({
        myPlants: state.myPlants,
        selectedPlant: state.selectedPlant,
        careLogs: state.careLogs,
        diaryEntries: state.diaryEntries,
        chatMessages: state.chatMessages,
        reminders: state.reminders,
        notificationSettings: state.notificationSettings,
      }),
    }
  )
);
