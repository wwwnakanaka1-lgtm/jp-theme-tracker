/** Stock-related type definitions for JP Theme Tracker. */

export interface StockSummary {
  code: string;
  name: string;
  price: number;
  changePct: number;
  changePct1d?: number | null;
  volume: number;
  marketCap: number;
}

export interface StockPosition {
  code: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
  weight: number;
}

export interface StockFinancials {
  code: string;
  eps: number | null;
  per: number | null;
  pbr: number | null;
  dividendYield: number | null;
  roe: number | null;
  operatingMargin: number | null;
}

export interface StockTechnicals {
  rsi: number | null;
  macd: number | null;
  macdSignal: number | null;
  ma5: number | null;
  ma25: number | null;
  ma75: number | null;
  ma200: number | null;
  beta: number | null;
  volatility: number | null;
}

export interface StockAlert {
  id: string;
  stockCode: string;
  stockName: string;
  type: 'price_above' | 'price_below' | 'change_above' | 'change_below';
  threshold: number;
  enabled: boolean;
  createdAt: string;
  triggeredAt?: string;
}

export interface WatchlistEntry {
  code: string;
  name: string;
  addedAt: string;
  notes?: string;
  tags: string[];
}

export type MarketCapCategory = 'mega' | 'large' | 'mid' | 'small' | 'micro' | 'unknown';

export const MARKET_CAP_LABELS: Record<MarketCapCategory, string> = {
  mega: 'メガ',
  large: '大型',
  mid: '中型',
  small: '小型',
  micro: 'マイクロ',
  unknown: '不明',
};
