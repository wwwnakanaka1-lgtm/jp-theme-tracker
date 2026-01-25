'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, AlertCircle } from 'lucide-react';
import PeriodSelector from '@/components/PeriodSelector';
import {
  fetchHeatmapData,
  type HeatmapResponse,
  type HeatmapStock,
  type PeriodValue,
  getMarketCapColor,
  getThemeColor,
} from '@/lib/api';

export default function HeatmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPeriod = (searchParams.get('period') as PeriodValue) || '1mo';

  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [period, setPeriod] = useState<PeriodValue>(initialPeriod);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchHeatmapData(period);
        setData(result);
      } catch (err) {
        setError('ヒートマップデータを取得できませんでした。');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  const handlePeriodChange = (newPeriod: PeriodValue) => {
    setPeriod(newPeriod);
    router.push(`/heatmap?period=${newPeriod}`, { scroll: false });
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchHeatmapData(period)
      .then(setData)
      .catch((err) => {
        setError('ヒートマップデータを取得できませんでした。');
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  const categories = data ? [
    { key: 'mega', ...data.categories.mega },
    { key: 'large', ...data.categories.large },
    { key: 'mid', ...data.categories.mid },
    { key: 'small', ...data.categories.small },
    { key: 'micro', ...data.categories.micro },
  ] : [];

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">時価総額別ヒートマップ</h1>
          <p className="text-sm text-gray-400 mt-1">
            時価総額分類別の銘柄騰落率を表示
          </p>
        </div>
        <PeriodSelector selectedPeriod={period} onPeriodChange={handlePeriodChange} />
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-2">
        <Link
          href={`/heatmap/sector?period=${period}`}
          className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
        >
          セクター別を見る
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-300">{error}</p>
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
        <div className="space-y-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton h-6 w-32 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className="skeleton h-16 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Heatmap Data */}
      {!loading && data && (
        <div className="space-y-6">
          {categories.map((category) => {
            const colors = getMarketCapColor(category.key);
            return (
              <div key={category.key} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {category.label}
                    </span>
                    <span className="text-sm text-gray-400">{category.threshold}</span>
                  </div>
                  <span className="text-sm text-gray-500">{category.count}銘柄</span>
                </div>

                {category.stocks.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">該当銘柄なし</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {category.stocks.map((stock) => (
                      <HeatmapCell key={stock.code} stock={stock} period={period} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function HeatmapCell({ stock, period }: { stock: HeatmapStock; period: string }) {
  const isPositive = stock.change_percent >= 0;
  const themeColor = getThemeColor(stock.theme_id);

  // 騰落率に基づいて背景色の濃さを決定
  const intensity = Math.min(Math.abs(stock.change_percent) / 20, 1);
  const bgOpacity = 0.3 + intensity * 0.5;

  const bgClass = isPositive
    ? `bg-green-500/${Math.round(bgOpacity * 100)}`
    : `bg-red-500/${Math.round(bgOpacity * 100)}`;

  return (
    <Link href={`/stock/${stock.code}?period=${period}`}>
      <div
        className={`p-2 rounded-lg border transition-all hover:scale-105 cursor-pointer ${
          isPositive ? 'border-green-700 hover:border-green-500' : 'border-red-700 hover:border-red-500'
        }`}
        style={{
          backgroundColor: isPositive
            ? `rgba(34, 197, 94, ${bgOpacity})`
            : `rgba(239, 68, 68, ${bgOpacity})`,
        }}
      >
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs font-mono text-gray-300 truncate">{stock.code.replace('.T', '')}</span>
        </div>
        <div className="text-xs text-gray-200 truncate mb-1" title={stock.name}>
          {stock.name}
        </div>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-3 h-3 text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span
            className={`text-sm font-bold ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {stock.change_percent.toFixed(1)}%
          </span>
        </div>
        <div className={`text-[10px] mt-1 px-1 py-0.5 rounded ${themeColor.bg} ${themeColor.text} truncate`}>
          {stock.theme_name}
        </div>
      </div>
    </Link>
  );
}
