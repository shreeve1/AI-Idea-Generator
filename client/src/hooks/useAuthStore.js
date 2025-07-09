import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import apiService from '../services/api';

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiService.login(credentials);
                    set({
                        user: response.user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    return response;
                } catch (error) {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.message,
                    });
                    throw error;
                }
            },

            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiService.register(userData);
                    set({
                        isLoading: false,
                        error: null,
                    });
                    return response;
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message,
                    });
                    throw error;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await apiService.logout();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                } catch (error) {
                    // Even if logout fails on server, clear local state
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },

            getCurrentUser: async () => {
                const token = apiService.getToken();
                if (!token) {
                    set({ isAuthenticated: false, user: null });
                    return;
                }

                set({ isLoading: true, error: null });
                try {
                    const user = await apiService.getCurrentUser();
                    set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    return user;
                } catch (error) {
                    // Token might be invalid, clear auth state
                    apiService.setToken(null);
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: error.message,
                    });
                    throw error;
                }
            },

            verifyEmail: async (token) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await apiService.verifyEmail(token);
                    set({
                        isLoading: false,
                        error: null,
                    });
                    return response;
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message,
                    });
                    throw error;
                }
            },

            clearError: () => set({ error: null }),

            // Initialize auth state on app start
            initialize: async () => {
                const token = apiService.getToken();
                if (token) {
                    try {
                        await get().getCurrentUser();
                    } catch (error) {
                        console.error('Failed to initialize auth:', error);
                    }
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore; 