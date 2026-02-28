import { create } from 'zustand';

export interface WatchlistItem {
  code: string;
  name: string;
  addedAt: string;
  notes?: string;
  tags: string[];
}

interface WatchlistState {
  items: WatchlistItem[];
  isLoaded: boolean;
  loadWatchlist: () => void;
  addItem: (code: string, name: string) => void;
  removeItem: (code: string) => void;
  updateNotes: (code: string, notes: string) => void;
  addTag: (code: string, tag: string) => void;
  removeTag: (code: string, tag: string) => void;
  hasItem: (code: string) => boolean;
  clearAll: () => void;
}

const STORAGE_KEY = 'jp-tracker-watchlist';

function loadFromStorage(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: WatchlistItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silently fail
  }
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: [],
  isLoaded: false,

  loadWatchlist: () => {
    const items = loadFromStorage();
    set({ items, isLoaded: true });
  },

  addItem: (code: string, name: string) => {
    const { items } = get();
    if (items.some((item) => item.code === code)) return;

    const newItem: WatchlistItem = {
      code,
      name,
      addedAt: new Date().toISOString(),
      tags: [],
    };
    const updated = [...items, newItem];
    saveToStorage(updated);
    set({ items: updated });
  },

  removeItem: (code: string) => {
    const updated = get().items.filter((item) => item.code !== code);
    saveToStorage(updated);
    set({ items: updated });
  },

  updateNotes: (code: string, notes: string) => {
    const updated = get().items.map((item) =>
      item.code === code ? { ...item, notes } : item,
    );
    saveToStorage(updated);
    set({ items: updated });
  },

  addTag: (code: string, tag: string) => {
    const updated = get().items.map((item) => {
      if (item.code !== code) return item;
      if (item.tags.includes(tag)) return item;
      return { ...item, tags: [...item.tags, tag] };
    });
    saveToStorage(updated);
    set({ items: updated });
  },

  removeTag: (code: string, tag: string) => {
    const updated = get().items.map((item) => {
      if (item.code !== code) return item;
      return { ...item, tags: item.tags.filter((t) => t !== tag) };
    });
    saveToStorage(updated);
    set({ items: updated });
  },

  hasItem: (code: string) => {
    return get().items.some((item) => item.code === code);
  },

  clearAll: () => {
    saveToStorage([]);
    set({ items: [] });
  },
}));
