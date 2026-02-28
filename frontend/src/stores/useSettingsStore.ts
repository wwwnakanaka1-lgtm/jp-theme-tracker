import { create } from 'zustand';

interface UserSettings {
  autoRefresh: boolean;
  refreshInterval: number;
  defaultPeriod: string;
  darkMode: boolean;
  compactMode: boolean;
  showSparklines: boolean;
  language: 'ja' | 'en';
  notificationsEnabled: boolean;
}

interface SettingsState extends UserSettings {
  isLoaded: boolean;
  loadSettings: () => void;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  resetSettings: () => void;
}

const STORAGE_KEY = 'jp-tracker-settings';

const DEFAULT_SETTINGS: UserSettings = {
  autoRefresh: true,
  refreshInterval: 300,
  defaultPeriod: '1d',
  darkMode: true,
  compactMode: false,
  showSparklines: true,
  language: 'ja',
  notificationsEnabled: false,
};

function loadFromStorage(): Partial<UserSettings> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveToStorage(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // silently fail
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: () => {
    const stored = loadFromStorage();
    const merged = { ...DEFAULT_SETTINGS, ...stored };
    set({ ...merged, isLoaded: true });
  },

  updateSetting: (key, value) => {
    set((state) => {
      const updated = { ...state, [key]: value };
      const settings: UserSettings = {
        autoRefresh: updated.autoRefresh,
        refreshInterval: updated.refreshInterval,
        defaultPeriod: updated.defaultPeriod,
        darkMode: updated.darkMode,
        compactMode: updated.compactMode,
        showSparklines: updated.showSparklines,
        language: updated.language,
        notificationsEnabled: updated.notificationsEnabled,
      };
      saveToStorage(settings);
      return { [key]: value };
    });
  },

  resetSettings: () => {
    saveToStorage(DEFAULT_SETTINGS);
    set({ ...DEFAULT_SETTINGS });
  },
}));
