import { create } from 'zustand';
import { Household, HouseholdMember } from '../types';
import { apiUrl } from '@/lib/api';

interface HouseholdState {
  households: Record<string, Household>;
  loading: boolean;
  loaded: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  addHousehold: (household: Household) => Promise<void>;
  updateHousehold: (household: Household) => Promise<void>;
  addMember: (householdId: string, member: HouseholdMember) => Promise<void>;
  updateMember: (householdId: string, member: HouseholdMember) => Promise<void>;
  removeMember: (householdId: string, memberId: string) => Promise<void>;
}

export const useHouseholdStore = create<HouseholdState>()((set, get) => ({
  households: {},
  loading: false,
  loaded: false,
  error: null,
  fetchAll: async () => {
    if (get().loading || get().loaded) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(apiUrl('/api/households'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Household[] = await res.json();
      const households: Record<string, Household> = {};
      data.forEach(h => { households[h.id] = h; });
      set({ households, loading: false, loaded: true });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    }
  },
  addHousehold: async (household) => {
    try {
      const res = await fetch(apiUrl('/api/households'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(household)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      set(s => ({ households: { ...s.households, [created.id]: created } }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add' });
    }
  },
  updateHousehold: async (household) => {
    try {
      const res = await fetch(apiUrl(`/api/households/${household.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(household)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      set(s => ({ households: { ...s.households, [updated.id]: updated } }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update' });
    }
  },
  addMember: async (householdId, member) => {
    try {
      const res = await fetch(apiUrl(`/api/households/${householdId}/members`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      set(s => ({ households: { ...s.households, [householdId]: updated } }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add member' });
    }
  },
  updateMember: async (householdId, member) => {
    try {
      const res = await fetch(apiUrl(`/api/households/${householdId}/members/${member.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      set(s => ({ households: { ...s.households, [householdId]: updated } }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update member' });
    }
  },
  removeMember: async (householdId, memberId) => {
    try {
      const res = await fetch(apiUrl(`/api/households/${householdId}/members/${memberId}`), {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      set(s => ({ households: { ...s.households, [householdId]: updated } }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to remove member' });
    }
  }
}));