import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api, setToken } from './api';
import type { UserProfile } from '@istyle/shared';

const TOKEN_KEY = 'auth_token';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  restore: () => Promise<void>;
}

interface RegisterInput {
  email: string;
  password: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  weightKg: number;
  preferredStyles: Array<'casual' | 'formal' | 'sport'>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  login: async (email, password) => {
    const res = await api<{ token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    await SecureStore.setItemAsync(TOKEN_KEY, res.token);
    set({ user: res.user, token: res.token });
  },

  register: async (data) => {
    const res = await api<{ user: UserProfile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    set({ user: res.user });
  },

  logout: () => {
    setToken(null);
    SecureStore.deleteItemAsync(TOKEN_KEY);
    set({ user: null, token: null });
  },

  restore: async () => {
    try {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!stored) return set({ isLoading: false });
      setToken(stored);
      const res = await api<{ user: UserProfile }>('/api/users/me');
      set({ user: res.user, token: stored, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
