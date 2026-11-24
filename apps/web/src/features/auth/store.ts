import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, UserRole } from './types';
import { useCartStore } from '@/features/cart/store';

interface AuthState {
  user: User | null;
  activeRole: UserRole | null;
  isAuthenticated: boolean;
  login: (user: User, role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeRole: null,
      isAuthenticated: false,
      login: (user, role) => set({ user, activeRole: role, isAuthenticated: true }),
      logout: () => {
        useCartStore.getState().resetLocalCart();
        set({ user: null, activeRole: null, isAuthenticated: false });
      },
    }),
    {
      name: 'aba_ui_auth_state',
      storage: createJSONStorage(() => localStorage),
      // We only persist non-sensitive user metadata to localStorage for instant UI updates.
      // The actual secure session token is strictly in HttpOnly cookies.
      partialize: (state) => ({ 
        user: state.user, 
        activeRole: state.activeRole,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
