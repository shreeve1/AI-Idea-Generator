import { create } from 'zustand';
import apiService from '../services/api';

const useIdeasStore = create((set, get) => ({
    // State
    ideas: [],
    categories: [],
    isLoading: false,
    isGenerating: false,
    error: null,
    aiConfig: null,

    // Actions
    generateIdeas: async (prompt, categoryIds = [], options = {}) => {
        set({ isGenerating: true, error: null });
        try {
            const response = await apiService.generateIdeas(prompt, categoryIds, options);
            
            // Add generated ideas to the store
            const currentIdeas = get().ideas;
            const newIdeas = response.ideas || [];
            
            set({
                ideas: [...currentIdeas, ...newIdeas],
                isGenerating: false,
                error: null,
            });
            
            return response;
        } catch (error) {
            set({
                isGenerating: false,
                error: error.message,
            });
            throw error;
        }
    },

    addIdea: (idea) => {
        const currentIdeas = get().ideas;
        set({
            ideas: [...currentIdeas, { ...idea, id: Date.now(), createdAt: new Date().toISOString() }],
        });
    },

    removeIdea: (ideaId) => {
        const currentIdeas = get().ideas;
        set({
            ideas: currentIdeas.filter(idea => idea.id !== ideaId),
        });
    },

    updateIdea: (ideaId, updates) => {
        const currentIdeas = get().ideas;
        set({
            ideas: currentIdeas.map(idea => 
                idea.id === ideaId ? { ...idea, ...updates, updatedAt: new Date().toISOString() } : idea
            ),
        });
    },

    clearIdeas: () => {
        set({ ideas: [] });
    },

    setCategories: (categories) => {
        set({ categories });
    },

    testAIConnection: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.testAIConnection();
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

    getAIConfig: async () => {
        set({ isLoading: true, error: null });
        try {
            const config = await apiService.getAIConfig();
            set({
                aiConfig: config,
                isLoading: false,
                error: null,
            });
            return config;
        } catch (error) {
            set({
                isLoading: false,
                error: error.message,
            });
            throw error;
        }
    },

    constructPrompt: async (prompt, categoryIds = [], options = {}) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.constructPrompt(prompt, categoryIds, options);
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

    // Filter ideas by category
    getIdeasByCategory: (categoryId) => {
        const ideas = get().ideas;
        if (!categoryId) return ideas;
        return ideas.filter(idea => idea.categoryId === categoryId);
    },

    // Get ideas by search term
    searchIdeas: (searchTerm) => {
        const ideas = get().ideas;
        if (!searchTerm) return ideas;
        
        const term = searchTerm.toLowerCase();
        return ideas.filter(idea => 
            idea.title?.toLowerCase().includes(term) ||
            idea.description?.toLowerCase().includes(term) ||
            idea.tags?.some(tag => tag.toLowerCase().includes(term))
        );
    },
}));

export default useIdeasStore; 