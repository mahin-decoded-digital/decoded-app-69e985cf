import { create } from 'zustand';
import { Recipe } from '../types';
import { apiUrl } from '@/lib/api';

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
}

export const useRecipeStore = create<RecipeState>()((set, get) => ({
  recipes: [],
  loading: false,
  loaded: false,
  error: null,
  fetchAll: async () => {
    if (get().loading || get().loaded) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(apiUrl('/api/recipes'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const recipes = await res.json();
      set({ recipes, loading: false, loaded: true });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    }
  }
}));