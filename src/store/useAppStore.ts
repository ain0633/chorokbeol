import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPlant, Weather, Location, CareLog, CareActivityType } from '@/types/database';

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
    }),
    {
      name: 'chorokbyeol-store',
      partialize: (state) => ({
        myPlants: state.myPlants,
        selectedPlant: state.selectedPlant,
        careLogs: state.careLogs,
      }),
    }
  )
);
