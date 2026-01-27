import useSWR from 'swr';
import {
  fetchThemes,
  fetchThemesWithMeta,
  fetchThemeDetail,
  fetchStockDetail,
  fetchNikkei225,
  fetchHeatmapData,
  fetchSectorHeatmapData,
} from './api';
import type {
  Theme,
  ThemesResponse,
  ThemeDetail,
  StockDetail,
  Nikkei225Data,
  HeatmapResponse,
  SectorHeatmapResponse,
  PeriodValue,
} from './api';

const SWR_OPTIONS = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 300000, // 5分間は同じリクエストを重複させない
  revalidateIfStale: false, // 古くても再取得しない
};

export function useThemes(period: PeriodValue) {
  return useSWR<Theme[]>(['themes', period], () => fetchThemes(period), SWR_OPTIONS);
}

export function useThemesWithMeta(period: PeriodValue) {
  return useSWR<ThemesResponse>(
    ['themes-meta', period],
    () => fetchThemesWithMeta(period),
    SWR_OPTIONS
  );
}

export function useThemeDetail(id: string | null, period: PeriodValue) {
  return useSWR<ThemeDetail>(
    id ? ['theme', id, period] : null,
    () => fetchThemeDetail(id!, period),
    SWR_OPTIONS
  );
}

export function useStockDetail(code: string | null, period: PeriodValue) {
  return useSWR<StockDetail>(
    code ? ['stock', code, period] : null,
    () => fetchStockDetail(code!, period),
    SWR_OPTIONS
  );
}

export function useNikkei225(period: PeriodValue) {
  return useSWR<Nikkei225Data>(
    ['nikkei225', period],
    () => fetchNikkei225(period),
    SWR_OPTIONS
  );
}

export function useHeatmapData(period: PeriodValue) {
  return useSWR<HeatmapResponse>(
    ['heatmap', period],
    () => fetchHeatmapData(period),
    SWR_OPTIONS
  );
}

export function useSectorHeatmapData(period: PeriodValue) {
  return useSWR<SectorHeatmapResponse>(
    ['sector-heatmap', period],
    () => fetchSectorHeatmapData(period),
    SWR_OPTIONS
  );
}
