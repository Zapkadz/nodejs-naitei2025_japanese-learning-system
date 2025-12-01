/**
 * Zustand Auth Store
 * Manages authentication state with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dataService } from '../services';
import type { IUser, ILoginCredentials, IRegisterData } from '../services';

interface AuthState {
  // State
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: ILoginCredentials) => Promise<void>;
  register: (data: IRegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  updateUser: (user: IUser) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login Action
      login: async (credentials: ILoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await dataService.login(credentials);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Register Action
      register: async (data: IRegisterData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await dataService.register(data);
          
          set({
            user: response.user,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      // Logout Action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await dataService.logout();
        } catch (error) {
          console.error('Logout error:', error);
          // Continue with logout even if API call fails
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Clear Error
      clearError: () => {
        set({ error: null });
      },

      // Check Auth (verify token validity)
      checkAuth: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const user = await dataService.getCurrentUser();
          set({ user, isAuthenticated: true });
        } catch (error) {
          // Token is invalid, clear state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      // Update User (after profile update, avatar upload, etc.)
      updateUser: (user: IUser) => {
        set({ user });
      },
    }),
    {
      name: 'jlpt-auth-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
