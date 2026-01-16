import { create } from 'zustand';
import type { TokenBalance } from '@sync/shared';
import { usersApi } from '@sync/api-client';

interface UserState {
  tokenBalance: TokenBalance | null;
  votingHistory: { voteId: string; optionId: string; createdAt: Date }[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTokenBalance: () => Promise<void>;
  fetchVotingHistory: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  tokenBalance: null,
  votingHistory: [],
  isLoading: false,
  error: null,

  fetchTokenBalance: async () => {
    set({ isLoading: true });
    try {
      const tokenBalance = await usersApi.getTokenBalance();
      set({ tokenBalance, isLoading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'שגיאה בטעינת הנתונים', isLoading: false });
    }
  },

  fetchVotingHistory: async () => {
    set({ isLoading: true });
    try {
      const votingHistory = await usersApi.getVotingHistory();
      set({ votingHistory, isLoading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'שגיאה בטעינת הנתונים', isLoading: false });
    }
  },

  refreshUserData: async () => {
    const { fetchTokenBalance, fetchVotingHistory } = get();
    await Promise.all([fetchTokenBalance(), fetchVotingHistory()]);
  },
}));
