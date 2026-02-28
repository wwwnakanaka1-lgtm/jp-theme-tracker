/** Settings and configuration type definitions. */

export interface UserPreferences {
  autoRefresh: boolean;
  refreshInterval: number;
  defaultPeriod: string;
  darkMode: boolean;
  compactMode: boolean;
  showSparklines: boolean;
  language: SupportedLanguage;
  notificationsEnabled: boolean;
}

export type SupportedLanguage = 'ja' | 'en';

export interface NotificationPreferences {
  priceAlerts: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
  systemUpdates: boolean;
}

export interface DisplayPreferences {
  tableRowsPerPage: number;
  chartHeight: number;
  showVolume: boolean;
  showIndicators: boolean;
  colorScheme: 'default' | 'protanopia' | 'deuteranopia';
}

export interface ExportPreferences {
  defaultFormat: 'csv' | 'json' | 'xlsx';
  includeHeaders: boolean;
  dateFormat: 'iso' | 'jp' | 'us';
  numberFormat: 'raw' | 'formatted';
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  autoRefresh: true,
  refreshInterval: 300,
  defaultPeriod: '1d',
  darkMode: true,
  compactMode: false,
  showSparklines: true,
  language: 'ja',
  notificationsEnabled: false,
};

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  tableRowsPerPage: 20,
  chartHeight: 400,
  showVolume: true,
  showIndicators: true,
  colorScheme: 'default',
};
