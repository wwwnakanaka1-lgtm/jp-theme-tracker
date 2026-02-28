// req:REQ-018
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';
import ThemeCard, { ThemeCardSkeleton } from '@/components/ThemeCard';
import PeriodSelector from '@/components/PeriodSelector';
import Nikkei225Card from '@/components/Nikkei225Card';
import MarketHeader from '@/components/MarketHeader';
import { useThemesWithMeta } from '@/lib/hooks';
import type { PeriodValue } from '@/lib/api';

type DisplayMode = 10 | 20 | 'all';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPeriod = (searchParams.get('period') as PeriodValue) || '1mo';

  const [period, setPeriod] = useState<PeriodValue>(urlPeriod);
  const [displayMode, setDisplayMode] = useState<DisplayMode>(10);

  // URLパラメータの変更を監視
  useEffect(() => {
    if (urlPeriod !== period) {
      setPeriod(urlPeriod);
    }
  }, [urlPeriod, period]);

  // SWR でデータ取得（キャッシュ有効）
  const { data: response, error, isLoading, mutate } = useThemesWithMeta(period);

  // ソート済みテーマ
  const themes = useMemo(() => {
    if (!response?.themes) return [];
    return [...response.themes].sort((a, b) => b.change_percent - a.change_percent);
  }, [response?.themes]);

  const handlePeriodChange = (newPeriod: PeriodValue) => {
    setPeriod(newPeriod);
    router.push(`/?period=${newPeriod}`, { scroll: false });
  };

  const handleRetry = () => {
    mutate();
  };

  // 表示するテーマを計算
  const getDisplayThemes = () => {
    if (displayMode === 'all') {
      const topThemes = themes.filter((t) => t.change_percent >= 0);
      const bottomThemes = themes.filter((t) => t.change_percent < 0).reverse();
      return { topThemes, bottomThemes };
    }

    const limit = displayMode;
    const topThemes = themes.slice(0, limit);
    const bottomThemes = themes.slice(-limit).reverse();
    return { topThemes, bottomThemes };
  };

  const { topThemes, bottomThemes } = getDisplayThemes();
  const loading = isLoading;

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <PeriodSelector selectedPeriod={period} onPeriodChange={handlePeriodChange} />

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-300">
                テーマの取得に失敗しました。バックエンドサーバーが起動しているか確認してください。
              </p>
              <button
                onClick={handleRetry}
                className="mt-2 flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300"
              >
                <RefreshCw className="w-4 h-4" />
                再試行
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-1 rounded-lg overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <ThemeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && !error && themes.length > 0 && (
        <div className="space-y-4">
          {/* Market Header */}
          <MarketHeader
            lastUpdated={response?.last_updated ?? null}
            period={period}
            onRefreshComplete={() => mutate()}
          />

          {/* Top Themes */}
          <div>
            <h2 className="section-header">
              TOP {displayMode === 'all' ? topThemes.length : displayMode}
            </h2>
            <div className="rounded-lg overflow-hidden">
              {topThemes.map((theme, index) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  period={period}
                  rank={index + 1}
                />
              ))}
            </div>
          </div>

          {/* Nikkei 225 */}
          <div className="my-4">
            <Nikkei225Card period={period} />
          </div>

          {/* Display Mode Selector */}
          <div className="flex justify-center gap-2 py-2">
            <button
              onClick={() => setDisplayMode(10)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                displayMode === 10
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              上下10テーマ
            </button>
            <button
              onClick={() => setDisplayMode(20)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                displayMode === 20
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              上下20テーマ
            </button>
            <button
              onClick={() => setDisplayMode('all')}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                displayMode === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              全テーマ表示
            </button>
          </div>

          {/* Bottom Themes */}
          <div>
            <h2 className="section-header">
              BOTTOM {displayMode === 'all' ? bottomThemes.length : displayMode}
            </h2>
            <div className="rounded-lg overflow-hidden">
              {bottomThemes.map((theme, index) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  period={period}
                  rank={themes.length - index}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && themes.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-300 mb-2">
            テーマが見つかりません
          </h3>
          <p className="text-sm text-gray-500">
            データがまだ登録されていないか、フィルター条件に一致するテーマがありません。
          </p>
        </div>
      )}
    </div>
  );
}
