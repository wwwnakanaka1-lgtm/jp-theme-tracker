/** Application-wide constants for JP Theme Tracker */

export const APP_NAME = 'JP Theme Tracker';
export const APP_VERSION = '2.0.0';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/** Number of themes tracked by the system */
export const TOTAL_THEMES = 20;
export const STOCKS_PER_THEME = 10;

/** Cache durations in seconds */
export const CACHE_DURATION = {
  themes: 300,
  stockDetail: 60,
  heatmap: 300,
  nikkei: 60,
} as const;

/** Default settings */
export const DEFAULT_PERIOD = '1mo';
export const DEFAULT_PAGE_SIZE = 20;
export const AUTO_REFRESH_INTERVAL = 300_000; // 5 minutes

/** Color palette for charts and UI */
export const CHART_COLORS = {
  primary: '#3b82f6',
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280',
  background: '#1f2937',
  grid: '#374151',
  text: '#9ca3af',
} as const;

/** Theme category display names (JP) */
export const THEME_CATEGORIES: Record<string, string> = {
  'gaming-entertainment': 'ゲーム・エンタメ',
  finance: '金融',
  ai: 'AI',
  semiconductor: '半導体',
  ev: 'EV',
  healthcare: 'ヘルスケア',
  'renewable-energy': '再生エネルギー',
  '5g-telecom': '5G・通信',
  dx: 'DX',
  'defense-space': '防衛・宇宙',
  'real-estate': '不動産',
  'retail-ec': '小売・EC',
  'food-beverage': '食品・飲料',
  'tourism-inbound': '観光・インバウンド',
  logistics: '物流',
  construction: '建設',
  chemicals: '化学',
  'steel-metals': '鉄鋼・金属',
  machinery: '機械',
  utilities: '公益',
};

/** Period options for the UI */
export const PERIOD_OPTIONS = [
  { value: '1d', label: '1日', shortLabel: '1D' },
  { value: '5d', label: '5日', shortLabel: '5D' },
  { value: '10d', label: '10日', shortLabel: '10D' },
  { value: '1mo', label: '1ヶ月', shortLabel: '1M' },
  { value: '3mo', label: '3ヶ月', shortLabel: '3M' },
  { value: '6mo', label: '6ヶ月', shortLabel: '6M' },
  { value: '1y', label: '1年', shortLabel: '1Y' },
  { value: '3y', label: '3年', shortLabel: '3Y' },
  { value: '5y', label: '5年', shortLabel: '5Y' },
] as const;

/** Breakpoints matching Tailwind defaults */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
