'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import TradingChart, { TradingChartSkeleton } from '@/components/TradingChart';
import PeriodSelector from '@/components/PeriodSelector';
import { useStockDetail } from '@/lib/hooks';
import { type PeriodValue, PERIODS } from '@/lib/api';

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stockCode = params.code as string;
  const initialPeriod = (searchParams.get('period') as PeriodValue) || '1mo';

  const [period, setPeriod] = useState<PeriodValue>(initialPeriod);

  // SWR でデータ取得（キャッシュ有効）
  const { data: stock, error, isLoading, isValidating, mutate } = useStockDetail(stockCode, period);

  const handlePeriodChange = (newPeriod: PeriodValue) => {
    setPeriod(newPeriod);
    router.push(`/stock/${stockCode}?period=${newPeriod}`, { scroll: false });
  };

  const handleRetry = () => {
    mutate();
  };

  const isPositive = stock ? (stock.change_percent ?? 0) >= 0 : true;
  const loading = isLoading;
  const chartLoading = isValidating && !isLoading;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {stock?.theme_id ? (
        <Link
          href={`/theme/${stock.theme_id}?period=${period}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {stock.theme_name || 'テーマ詳細'}に戻る
        </Link>
      ) : (
        <Link
          href={`/?period=${period}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          テーマ一覧に戻る
        </Link>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-300">銘柄の詳細を取得できませんでした。</p>
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
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="skeleton h-6 w-24 mb-2" />
              <div className="skeleton h-8 w-48" />
            </div>
            <div className="skeleton h-16 w-32 rounded-lg" />
          </div>
        </div>
      )}

      {/* Stock Header */}
      {!loading && stock && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono bg-gray-700 px-2 py-1 rounded text-gray-300">
                  {stock.code}
                </span>
                {stock.theme_name && (
                  <span className="text-sm text-blue-400">
                    {stock.theme_name}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-100">{stock.name}</h2>
              {stock.description && (
                <p className="text-sm text-gray-300 mt-1">{stock.description}</p>
              )}
              {stock.price && (
                <div className="mt-3">
                  <span className="text-3xl font-bold text-gray-100">
                    {stock.price.toLocaleString()}
                  </span>
                  <span className="text-gray-400 ml-1">円</span>
                </div>
              )}
            </div>
            <div
              className={`flex flex-col items-center justify-center px-6 py-4 rounded-xl ${
                isPositive ? 'bg-green-900/30' : 'bg-red-900/30'
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
                  {(stock.change_percent ?? 0).toFixed(2)}%
                </span>
              </div>
              <span className="text-xs text-gray-400 mt-1">
                {PERIODS.find((p) => p.value === period)?.label}間
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex justify-end">
        <PeriodSelector selectedPeriod={period} onPeriodChange={handlePeriodChange} />
      </div>

      {/* Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          チャート
          {chartLoading && <span className="ml-2 text-sm text-gray-400">更新中...</span>}
        </h3>
        {loading || chartLoading ? (
          <TradingChartSkeleton />
        ) : stock && stock.history && stock.history.length > 0 ? (
          <TradingChart
            history={stock.history}
            chartIndicators={stock.chart_indicators}
            selectedPeriodStartIndex={stock.selected_period_start_index}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">チャートデータがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
