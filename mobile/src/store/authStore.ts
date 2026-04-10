import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'lecturer' | 'admin';
  department?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    await SecureStore.setItemAsync('token', token);
    set({ user, token });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
    set({ user: null, token: null });
  },
  loadAuth: async () => {
    const userStr = await SecureStore.getItemAsync('user');
    const token = await SecureStore.getItemAsync('token');
    if (userStr && token) {
      set({ user: JSON.parse(userStr), token });
    }
  }
}));
