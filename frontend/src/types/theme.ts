/** Theme-related type definitions for JP Theme Tracker. */

export interface ThemeSummary {
  id: string;
  name: string;
  description?: string;
  category: string;
  changePct: number;
  changePct1d?: number | null;
  stockCount: number;
}

export interface ThemePerformance {
  themeId: string;
  period: string;
  returnPct: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  bestStock: { code: string; name: string; returnPct: number };
  worstStock: { code: string; name: string; returnPct: number };
}

export interface ThemeCorrelation {
  themeIdA: string;
  themeIdB: string;
  correlation: number;
}

export interface ThemeRanking {
  themeId: string;
  themeName: string;
  rank: number;
  previousRank: number | null;
  changePct: number;
}

export interface ThemeHistory {
  date: string;
  returnPct: number;
  stockCount: number;
}

export type ThemeSortField = 'name' | 'changePct' | 'stockCount' | 'volatility';
export type SortDirection = 'asc' | 'desc';

export interface ThemeFilterState {
  categories: string[];
  performanceRange: [number, number];
  sortField: ThemeSortField;
  sortDirection: SortDirection;
  searchQuery: string;
}

export const DEFAULT_THEME_FILTER: ThemeFilterState = {
  categories: [],
  performanceRange: [-100, 100],
  sortField: 'changePct',
  sortDirection: 'desc',
  searchQuery: '',
};
