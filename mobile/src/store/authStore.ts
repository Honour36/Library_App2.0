import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { useStudentStore } from './studentStore';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'lecturer' | 'admin';
  department?: string;
  student_id?: string;
  avatar_uri?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => Promise<void>;
  updateProfile: (payload: Pick<User, 'full_name' | 'avatar_uri'>) => Promise<void>;
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
  updateProfile: async (payload) => {
    const userStr = await SecureStore.getItemAsync('user');
    if (!userStr) return;

    const currentUser = JSON.parse(userStr) as User;
    const nextUser = { ...currentUser, ...payload };
    await SecureStore.setItemAsync('user', JSON.stringify(nextUser));
    set({ user: nextUser });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('user');
    await SecureStore.deleteItemAsync('token');
    await useStudentStore.getState().resetStudentProfile();
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
