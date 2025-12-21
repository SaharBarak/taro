import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '@sync/shared';

interface AuthState {
  user: UserProfile | null;
  isOnboarded: boolean;
  setUser: (user: UserProfile | null) => void;
  setOnboarded: (onboarded: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isOnboarded: false,
      setUser: (user) => set({ user }),
      setOnboarded: (isOnboarded) => set({ isOnboarded }),
      clearAuth: () => set({ user: null, isOnboarded: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
