import { create } from 'zustand';
import type { Vote } from '@sync/shared';
import { votesApi } from '@sync/api-client';

interface VotesState {
  votes: Vote[];
  activeVotes: Vote[];
  isLoading: boolean;
  error: string | null;
  selectedFilter: 'all' | 'active' | 'ended' | 'pending';
  searchQuery: string;

  // Actions
  fetchVotes: () => Promise<void>;
  fetchActiveVotes: () => Promise<void>;
  setFilter: (filter: 'all' | 'active' | 'ended' | 'pending') => void;
  setSearchQuery: (query: string) => void;
  getVoteById: (id: string) => Vote | undefined;
  refreshVotes: () => Promise<void>;
}

export const useVotesStore = create<VotesState>((set, get) => ({
  votes: [],
  activeVotes: [],
  isLoading: false,
  error: null,
  selectedFilter: 'all',
  searchQuery: '',

  fetchVotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const votes = await votesApi.getVotes();
      set({ votes, isLoading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'שגיאה בטעינת ההצבעות', isLoading: false });
    }
  },

  fetchActiveVotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const activeVotes = await votesApi.getActiveVotes();
      set({ activeVotes, isLoading: false });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'שגיאה בטעינת ההצבעות', isLoading: false });
    }
  },

  setFilter: (selectedFilter) => set({ selectedFilter }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  getVoteById: (id) => {
    const { votes, activeVotes } = get();
    return votes.find((v) => v.id === id) || activeVotes.find((v) => v.id === id);
  },

  refreshVotes: async () => {
    const { fetchVotes, fetchActiveVotes } = get();
    await Promise.all([fetchVotes(), fetchActiveVotes()]);
  },
}));
