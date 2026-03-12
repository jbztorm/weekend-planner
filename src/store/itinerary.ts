import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserPreferences, Itinerary, ChildAge, Preference, DateType } from '../lib/types';

interface ItineraryStore {
  // 用户偏好
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  
  // 当前行程
  currentItinerary: Itinerary | null;
  setCurrentItinerary: (itinerary: Itinerary | null) => void;
  
  // 历史行程
  savedItineraries: Itinerary[];
  addSavedItinerary: (itinerary: Itinerary) => void;
  removeItinerary: (id: string) => void;
  
  // 加载状态
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  
  // 用户位置
  userLocation: { lat: number; lng: number } | null;
  setUserLocation: (location: { lat: number; lng: number } | null) => void;
}

const defaultPreferences: UserPreferences = {
  childAge: '1-3',
  maxDistance: 10,
  preference: 'any',
  date: 'weekend',
};

export const useItineraryStore = create<ItineraryStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),
      
      currentItinerary: null,
      setCurrentItinerary: (itinerary) => set({ currentItinerary: itinerary }),
      
      savedItineraries: [],
      addSavedItinerary: (itinerary) =>
        set((state) => ({
          savedItineraries: [itinerary, ...state.savedItineraries],
        })),
      removeItinerary: (id) =>
        set((state) => ({
          savedItineraries: state.savedItineraries.filter((i) => i.id !== id),
        })),
      
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      
      userLocation: null,
      setUserLocation: (location) => set({ userLocation: location }),
    }),
    {
      name: 'weekend-planner-storage',
    }
  )
);
