import { create } from 'zustand';
import { DAILY_FREE_QUOTA } from '@istyle/shared';
import { api } from './api';

interface QuotaState {
  remaining: number;
  isLoading: boolean;
  fetchQuota: () => Promise<void>;
  decrement: () => void;
}

export const useQuota = create<QuotaState>((set) => ({
  remaining: DAILY_FREE_QUOTA,
  isLoading: false,
  fetchQuota: async () => {
    set({ isLoading: true });
    try {
      const res = await api<{ user: { subscription?: { dailyRemaining: number } } }>('/api/users/me');
      set({ remaining: res.user.subscription?.dailyRemaining ?? DAILY_FREE_QUOTA, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
  decrement: () => set(state => ({ remaining: Math.max(0, state.remaining - 1) })),
}));
