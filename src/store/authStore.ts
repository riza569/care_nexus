import { create } from 'zustand';
import { User } from 'firebase/auth';

export type UserRole = 'caretaker' | 'admin' | 'manager';

interface AuthState {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  loading: true,
  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, role: null }),
}));
