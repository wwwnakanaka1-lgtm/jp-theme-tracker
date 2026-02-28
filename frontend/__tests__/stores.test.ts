import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage for store tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('useAppStore', () => {
  it('should have default selectedPeriod', async () => {
    const { useAppStore } = await import('@/stores/useAppStore');
    const state = useAppStore.getState();
    expect(state.selectedPeriod).toBe('1d');
  });

  it('should set selected period', async () => {
    const { useAppStore } = await import('@/stores/useAppStore');
    useAppStore.getState().setSelectedPeriod('3mo');
    expect(useAppStore.getState().selectedPeriod).toBe('3mo');
  });

  it('should toggle menu', async () => {
    const { useAppStore } = await import('@/stores/useAppStore');
    useAppStore.setState({ isMenuOpen: false });
    useAppStore.getState().toggleMenu();
    expect(useAppStore.getState().isMenuOpen).toBe(true);
    useAppStore.getState().toggleMenu();
    expect(useAppStore.getState().isMenuOpen).toBe(false);
  });

  it('should close menu', async () => {
    const { useAppStore } = await import('@/stores/useAppStore');
    useAppStore.setState({ isMenuOpen: true });
    useAppStore.getState().closeMenu();
    expect(useAppStore.getState().isMenuOpen).toBe(false);
  });
});

describe('useSettingsStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should have default settings', async () => {
    const { useSettingsStore } = await import('@/stores/useSettingsStore');
    const state = useSettingsStore.getState();
    expect(state.autoRefresh).toBe(true);
    expect(state.darkMode).toBe(true);
    expect(state.defaultPeriod).toBe('1d');
  });

  it('should update a setting', async () => {
    const { useSettingsStore } = await import('@/stores/useSettingsStore');
    useSettingsStore.getState().updateSetting('compactMode', true);
    expect(useSettingsStore.getState().compactMode).toBe(true);
  });

  it('should persist settings to localStorage', async () => {
    const { useSettingsStore } = await import('@/stores/useSettingsStore');
    useSettingsStore.getState().updateSetting('language', 'en');
    const stored = localStorageMock.getItem('jp-tracker-settings');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!).language).toBe('en');
  });

  it('should reset settings to defaults', async () => {
    const { useSettingsStore } = await import('@/stores/useSettingsStore');
    useSettingsStore.getState().updateSetting('autoRefresh', false);
    useSettingsStore.getState().resetSettings();
    expect(useSettingsStore.getState().autoRefresh).toBe(true);
  });
});

describe('useWatchlistStore', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should start with empty watchlist', async () => {
    const { useWatchlistStore } = await import('@/stores/useWatchlistStore');
    useWatchlistStore.setState({ items: [], isLoaded: false });
    expect(useWatchlistStore.getState().items).toHaveLength(0);
  });

  it('should add an item', async () => {
    const { useWatchlistStore } = await import('@/stores/useWatchlistStore');
    useWatchlistStore.setState({ items: [] });
    useWatchlistStore.getState().addItem('7203', 'Toyota');
    const items = useWatchlistStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].code).toBe('7203');
    expect(items[0].name).toBe('Toyota');
  });

  it('should not add duplicate items', async () => {
    const { useWatchlistStore } = await import('@/stores/useWatchlistStore');
    useWatchlistStore.setState({ items: [] });
    useWatchlistStore.getState().addItem('7203', 'Toyota');
    useWatchlistStore.getState().addItem('7203', 'Toyota');
    expect(useWatchlistStore.getState().items).toHaveLength(1);
  });

  it('should remove an item', async () => {
    const { useWatchlistStore } = await import('@/stores/useWatchlistStore');
    useWatchlistStore.setState({ items: [] });
    useWatchlistStore.getState().addItem('7203', 'Toyota');
    useWatchlistStore.getState().removeItem('7203');
    expect(useWatchlistStore.getState().items).toHaveLength(0);
  });

  it('should check if item exists', async () => {
    const { useWatchlistStore } = await import('@/stores/useWatchlistStore');
    useWatchlistStore.setState({ items: [] });
    useWatchlistStore.getState().addItem('6758', 'Sony');
    expect(useWatchlistStore.getState().hasItem('6758')).toBe(true);
    expect(useWatchlistStore.getState().hasItem('9999')).toBe(false);
  });

  it('should clear all items', async () => {
    const { useWatchlistStore } = await import('@/stores/useWatchlistStore');
    useWatchlistStore.setState({ items: [] });
    useWatchlistStore.getState().addItem('7203', 'Toyota');
    useWatchlistStore.getState().addItem('6758', 'Sony');
    useWatchlistStore.getState().clearAll();
    expect(useWatchlistStore.getState().items).toHaveLength(0);
  });
});
