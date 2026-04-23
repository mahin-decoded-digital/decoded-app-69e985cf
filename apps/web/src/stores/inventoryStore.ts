import { create } from 'zustand';
import { InventoryItem } from '../types';
import { apiUrl } from '@/lib/api';

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  addItem: (item: InventoryItem) => Promise<void>;
  updateItem: (item: InventoryItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  addBulkItems: (items: InventoryItem[]) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,
  fetchAll: async () => {
    if (get().loading || get().loaded) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(apiUrl('/api/inventory'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const items = await res.json();
      set({ items, loading: false, loaded: true });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    }
  },
  addItem: async (item) => {
    try {
      const res = await fetch(apiUrl('/api/inventory'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      set(s => ({ items: [...s.items, created] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add' });
    }
  },
  updateItem: async (item) => {
    try {
      const res = await fetch(apiUrl(`/api/inventory/${item.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      set(s => ({ items: s.items.map(i => i.id === updated.id ? updated : i) }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update' });
    }
  },
  removeItem: async (id) => {
    try {
      const res = await fetch(apiUrl(`/api/inventory/${id}`), { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      set(s => ({ items: s.items.filter(i => i.id !== id) }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete' });
    }
  },
  addBulkItems: async (items) => {
    try {
      const res = await fetch(apiUrl('/api/inventory/bulk'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      set(s => ({ items: [...s.items, ...created] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add bulk items' });
    }
  }
}));