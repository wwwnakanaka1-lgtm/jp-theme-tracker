export interface Theme {
  id: string;
  name: string;
  description: string;
  return_pct: number;
  top_stocks: TopStock[];
  stock_count: number;
}

export interface TopStock {
  code: string;
  name: string;
  return_pct: number;
}

export interface Stock {
  code: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
  volume: number;
  market_cap: number;
  indicators?: StockIndicators;
}

export interface StockIndicators {
  rsi: number | null;
  ma_5: number | null;
  ma_25: number | null;
  ma_75: number | null;
  beta: number | null;
  alpha: number | null;
  volatility: number | null;
}

export interface HeatmapItem {
  code: string;
  name: string;
  return_pct: number;
  market_cap: number;
  category: string;
}

export interface MarketData {
  nikkei225: {
    price: number;
    change: number;
    change_pct: number;
  };
  updated_at: string;
}

export type Period = '1d' | '5d' | '10d' | '1mo' | '3mo' | '6mo' | '1y';
