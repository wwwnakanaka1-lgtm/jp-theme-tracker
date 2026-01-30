const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SparklineData {
  data: number[];
  period_start_index: number;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  change_percent: number;
  change_percent_1d?: number | null;
  stock_count: number;
  top_stocks?: Stock[];
  sparkline?: SparklineData | number[];
}

export interface MarketCapCategory {
  id: 'mega' | 'large' | 'mid' | 'small' | 'micro' | 'unknown';
  label: string;
  color: string;
}

export interface Stock {
  code: string;
  name: string;
  description?: string;
  change_percent: number;
  change_percent_1d?: number | null;
  beta?: number;
  alpha?: number;
  r_squared?: number;
  price?: number;
  volume?: number;
  market_cap?: number;
  market_cap_category?: MarketCapCategory;
  sparkline?: SparklineData | number[];
}

// 時価総額カテゴリの色定義
export const MARKET_CAP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  mega: { bg: 'bg-purple-900/60', text: 'text-purple-300', border: 'border-purple-600' },
  large: { bg: 'bg-blue-900/60', text: 'text-blue-300', border: 'border-blue-600' },
  mid: { bg: 'bg-green-900/60', text: 'text-green-300', border: 'border-green-600' },
  small: { bg: 'bg-yellow-900/60', text: 'text-yellow-300', border: 'border-yellow-600' },
  micro: { bg: 'bg-red-900/60', text: 'text-red-300', border: 'border-red-600' },
  unknown: { bg: 'bg-gray-800/60', text: 'text-gray-400', border: 'border-gray-600' },
};

export function getMarketCapColor(categoryId: string) {
  return MARKET_CAP_COLORS[categoryId] || MARKET_CAP_COLORS.unknown;
}

export interface BollingerBands {
  middle: (number | null)[];
  upper: (number | null)[];
  lower: (number | null)[];
}

export interface IchimokuCloud {
  tenkan: (number | null)[];
  kijun: (number | null)[];
  senkou_a: (number | null)[];
  senkou_b: (number | null)[];
  chikou: (number | null)[];
}

export interface ChartIndicators {
  ma: {
    ma20: (number | null)[];
    ma75: (number | null)[];
    ma200: (number | null)[];
  };
  rsi: (number | null)[];
  bollinger: BollingerBands;
  ichimoku: IchimokuCloud;
}

export interface StockDetail extends Stock {
  description?: string;
  theme_id: string;
  theme_name: string;
  history: PriceData[];
  ma_5?: number[];
  ma_25?: number[];
  rsi?: number[];
  chart_indicators?: ChartIndicators;
  selected_period_start_index?: number;
}

export interface PriceData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ThemeDetail extends Theme {
  stocks: Stock[];
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface Nikkei225Data {
  name: string;
  ticker: string;
  period: string;
  price: number | null;
  change_percent: number;
  change_percent_1d?: number | null;
  sparkline: SparklineData | number[];
  error?: string;
}

export interface ThemesResponse {
  themes: Theme[];
  period: string;
  total: number;
  last_updated: string | null;
}

export async function fetchThemes(period: string = '1mo'): Promise<Theme[]> {
  try {
    const res = await fetch(`${API_BASE}/api/themes?period=${period}`, {
      next: { revalidate: 300 },  // 5分間キャッシュ
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    const themes = data.themes || data;
    // APIが return または change_percent を返す可能性があるため両方対応
    return themes.map((theme: Theme & { return?: number }) => ({
      ...theme,
      change_percent: theme.change_percent ?? theme.return ?? 0,
      top_stocks: theme.top_stocks?.map((stock: Stock & { return?: number }) => ({
        ...stock,
        change_percent: stock.change_percent ?? stock.return ?? 0,
      })),
    }));
  } catch (error) {
    console.error('Failed to fetch themes:', error);
    throw error;
  }
}

export async function fetchThemesWithMeta(period: string = '1mo'): Promise<ThemesResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/themes?period=${period}`, {
      next: { revalidate: 300 },  // 5分間キャッシュ
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    const themes = (data.themes || data).map((theme: Theme & { return?: number }) => ({
      ...theme,
      change_percent: theme.change_percent ?? theme.return ?? 0,
      top_stocks: theme.top_stocks?.map((stock: Stock & { return?: number }) => ({
        ...stock,
        change_percent: stock.change_percent ?? stock.return ?? 0,
      })),
    }));
    return {
      themes,
      period: data.period || period,
      total: data.total || themes.length,
      last_updated: data.last_updated || null,
    };
  } catch (error) {
    console.error('Failed to fetch themes:', error);
    throw error;
  }
}

export async function fetchThemeDetail(id: string, period: string = '1mo'): Promise<ThemeDetail> {
  try {
    const res = await fetch(`${API_BASE}/api/themes/${id}?period=${period}`, {
      next: { revalidate: 60 },  // 1分間キャッシュ
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    // APIが return または change_percent を返す可能性があるため両方対応
    return {
      ...data,
      change_percent: data.change_percent ?? data.return ?? 0,
      stocks: data.stocks?.map((stock: Stock & { return?: number }) => ({
        ...stock,
        change_percent: stock.change_percent ?? stock.return ?? 0,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch theme detail:', error);
    throw error;
  }
}

export async function fetchStockDetail(code: string, period: string = '1mo'): Promise<StockDetail> {
  try {
    const res = await fetch(`${API_BASE}/api/stocks/${code}?period=${period}`, {
      next: { revalidate: 60 },  // 1分間キャッシュ
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    // APIレスポンスをStockDetail形式にマッピング
    return {
      code: data.ticker,
      name: data.name,
      description: data.description,
      change_percent: data.indicators?.period_return ?? 0,
      beta: data.indicators?.beta,
      alpha: data.indicators?.alpha,
      r_squared: data.indicators?.r_squared,
      price: data.indicators?.latest_price,
      theme_id: data.theme?.id ?? '',
      theme_name: data.theme?.name ?? '',
      history: data.price_history ?? [],
      chart_indicators: data.chart_indicators,
      selected_period_start_index: data.selected_period_start_index ?? 0,
    };
  } catch (error) {
    console.error('Failed to fetch stock detail:', error);
    throw error;
  }
}

export async function fetchNikkei225(period: string = '1mo'): Promise<Nikkei225Data> {
  try {
    const res = await fetch(`${API_BASE}/api/nikkei225?period=${period}`, {
      next: { revalidate: 60 },  // 1分間キャッシュ
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch Nikkei 225:', error);
    throw error;
  }
}

export const PERIODS = [
  { value: '1d', label: '1D' },
  { value: '5d', label: '5D' },
  { value: '10d', label: '10D' },
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '6mo', label: '6M' },
  { value: '1y', label: '1Y' },
  { value: '3y', label: '3Y' },
  { value: '5y', label: '5Y' },
] as const;

export type PeriodValue = typeof PERIODS[number]['value'];

// テーマカテゴリの色定義
export const THEME_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'gaming-entertainment': { bg: 'bg-emerald-900/40', text: 'text-emerald-400', border: 'border-emerald-700' },
  'finance': { bg: 'bg-amber-900/40', text: 'text-amber-400', border: 'border-amber-700' },
  'ai': { bg: 'bg-purple-900/40', text: 'text-purple-400', border: 'border-purple-700' },
  'semiconductor': { bg: 'bg-blue-900/40', text: 'text-blue-400', border: 'border-blue-700' },
  'ev': { bg: 'bg-cyan-900/40', text: 'text-cyan-400', border: 'border-cyan-700' },
  'healthcare': { bg: 'bg-pink-900/40', text: 'text-pink-400', border: 'border-pink-700' },
  'renewable-energy': { bg: 'bg-lime-900/40', text: 'text-lime-400', border: 'border-lime-700' },
  '5g-telecom': { bg: 'bg-indigo-900/40', text: 'text-indigo-400', border: 'border-indigo-700' },
  'dx': { bg: 'bg-violet-900/40', text: 'text-violet-400', border: 'border-violet-700' },
  'defense-space': { bg: 'bg-slate-700/40', text: 'text-slate-300', border: 'border-slate-600' },
  'real-estate': { bg: 'bg-orange-900/40', text: 'text-orange-400', border: 'border-orange-700' },
  'retail-ec': { bg: 'bg-rose-900/40', text: 'text-rose-400', border: 'border-rose-700' },
  'food-beverage': { bg: 'bg-yellow-900/40', text: 'text-yellow-400', border: 'border-yellow-700' },
  'tourism-inbound': { bg: 'bg-sky-900/40', text: 'text-sky-400', border: 'border-sky-700' },
  'logistics': { bg: 'bg-teal-900/40', text: 'text-teal-400', border: 'border-teal-700' },
  'construction': { bg: 'bg-stone-700/40', text: 'text-stone-300', border: 'border-stone-600' },
  'chemicals': { bg: 'bg-fuchsia-900/40', text: 'text-fuchsia-400', border: 'border-fuchsia-700' },
  'steel-metals': { bg: 'bg-zinc-700/40', text: 'text-zinc-300', border: 'border-zinc-600' },
  'machinery': { bg: 'bg-neutral-700/40', text: 'text-neutral-300', border: 'border-neutral-600' },
  'utilities': { bg: 'bg-amber-800/40', text: 'text-amber-300', border: 'border-amber-600' },
};

export function getThemeColor(themeId: string) {
  return THEME_COLORS[themeId] || { bg: 'bg-gray-800/40', text: 'text-gray-400', border: 'border-gray-700' };
}

// ヒートマップデータ型
export interface HeatmapStock {
  code: string;
  name: string;
  theme_id: string;
  theme_name: string;
  change_percent: number;
  market_cap: number;
  market_cap_category: MarketCapCategory;
}

export interface HeatmapCategory {
  id: string;
  label: string;
  threshold: string;
  stocks: HeatmapStock[];
  count: number;
}

export interface HeatmapResponse {
  period: string;
  categories: {
    mega: HeatmapCategory;
    large: HeatmapCategory;
    mid: HeatmapCategory;
    small: HeatmapCategory;
    micro: HeatmapCategory;
  };
  last_updated: string | null;
}

export async function fetchHeatmapData(period: string = '1mo'): Promise<HeatmapResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/heatmap?period=${period}`, {
      next: { revalidate: 300 },  // 5分間キャッシュ
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch heatmap data:', error);
    throw error;
  }
}

// セクター別ヒートマップデータ型
export interface SectorStock {
  code: string;
  name: string;
  change_percent: number;
  market_cap: number;
  market_cap_category: MarketCapCategory;
}

export interface Sector {
  id: string;
  name: string;
  description: string;
  average_change: number;
  stocks: SectorStock[];
  stock_count: number;
}

export interface SectorHeatmapResponse {
  period: string;
  sectors: Sector[];
  total_sectors: number;
  last_updated: string | null;
}

export async function fetchSectorHeatmapData(period: string = '1mo'): Promise<SectorHeatmapResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/heatmap/sector?period=${period}`, {
      next: { revalidate: 300 },  // 5分間キャッシュ
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch sector heatmap data:', error);
    throw error;
  }
}

// データ更新API
export interface RefreshResponse {
  status: string;
  message: string;
  elapsed_seconds: number;
  timestamp: string;
}

export async function triggerDataRefresh(): Promise<RefreshResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: '不明なエラー' }));
      throw new Error(error.detail || `HTTP error: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Failed to trigger data refresh:', error);
    throw error;
  }
}
