'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import StockCard, { StockCardSkeleton } from '@/components/StockCard';
import PeriodSelector from '@/components/PeriodSelector';
import { useThemeDetail } from '@/lib/hooks';
import { type PeriodValue, PERIODS } from '@/lib/api';

export default function ThemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeId = params.id as string;
  const initialPeriod = (searchParams.get('period') as PeriodValue) || '1mo';

  const [period, setPeriod] = useState<PeriodValue>(initialPeriod);

  // SWR でデータ取得（キャッシュ有効）
  const { data: theme, error, isLoading, mutate } = useThemeDetail(themeId, period);

  const handlePeriodChange = (newPeriod: PeriodValue) => {
    setPeriod(newPeriod);
    router.push(`/theme/${themeId}?period=${newPeriod}`, { scroll: false });
  };

  const handleRetry = () => {
    mutate();
  };

  const changePercent = theme?.change_percent ?? 0;
  const isPositive = changePercent >= 0;
  const loading = isLoading;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href={`/?period=${period}`}
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        テーマ一覧に戻る
      </Link>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-300">テーマの詳細を取得できませんでした。</p>
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

      {/* Loading State - Header */}
      {loading && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="skeleton h-8 w-48 mb-2" />
              <div className="skeleton h-4 w-64" />
            </div>
            <div className="skeleton h-16 w-32 rounded-lg" />
          </div>
        </div>
      )}

      {/* Theme Header */}
      {!loading && theme && (
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-100">{theme.name}</h2>
              {theme.description && (
                <p className="text-gray-400 mt-2">{theme.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Layers className="w-4 h-4" />
                  <span>{theme.stock_count}銘柄</span>
                </div>
                <span className="text-sm text-gray-500">
                  {PERIODS.find((p) => p.value === period)?.label}間
                </span>
              </div>
            </div>
            <div
              className={`flex flex-col items-center justify-center px-6 py-4 rounded-xl ${
                isPositive ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'
              }`}
            >
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="w-6 h-6 text-green-400" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-400" />
                )}
                <span
                  className={`text-3xl font-bold ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {changePercent.toFixed(2)}%
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-1">平均騰落率</span>
            </div>
          </div>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex justify-end">
        <PeriodSelector selectedPeriod={period} onPeriodChange={handlePeriodChange} />
      </div>

      {/* Stock Cards */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">構成銘柄</h3>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <StockCardSkeleton key={i} />
            ))}
          </div>
        ) : theme && theme.stocks && theme.stocks.length > 0 ? (
          <div className="space-y-2">
            {theme.stocks.map((stock, index) => (
              <StockCard
                key={stock.code}
                stock={stock}
                period={period}
                rank={index + 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">銘柄データがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
