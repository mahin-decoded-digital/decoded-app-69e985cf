import { create } from 'zustand';
import { Message } from '../types';
import { apiUrl } from '@/lib/api';

interface MessageState {
  messages: Message[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  sendMessage: (msg: Message) => Promise<void>;
}

export const useMessageStore = create<MessageState>()((set, get) => ({
  messages: [],
  loading: false,
  loaded: false,
  error: null,
  fetchAll: async () => {
    if (get().loading || get().loaded) return;
    set({ loading: true, error: null });
    try {
      const res = await fetch(apiUrl('/api/messages'));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const messages = await res.json();
      set({ messages, loading: false, loaded: true });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Failed to load' });
    }
  },
  sendMessage: async (msg) => {
    try {
      const res = await fetch(apiUrl('/api/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const created = await res.json();
      set(s => ({ messages: [...s.messages, created] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to send' });
    }
  }
}));