import { create } from 'zustand';
import { MealPlanEntry } from '../types';
import { apiUrl } from '@/lib/api';

interface MealPlanState {
  entries: MealPlanEntry[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  addEntry: (entry: MealPlanEntry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
}

export const useMealPlanStore = create<MealPlanState>()((set, get) => ({
  entries: [],
  loading: false,
  loaded: false,
  error: null,
  fetchAll: async () => {
    if (get().loading || get().loaded) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(apiUrl('/api/meal-plans'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const entries = await res.json();
      set({ entries, loading: false, loaded: true });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    }
  },
  addEntry: async (entry) => {
    try {
      const res = await fetch(apiUrl('/api/meal-plans'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      set(s => ({ entries: [...s.entries, created] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add' });
    }
  },
  removeEntry: async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/meal-plans/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      set(s => ({ entries: s.entries.filter(e => e.id !== id) }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete' });
    }
  }
}));