'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import PeriodSelector from '@/components/PeriodSelector';
import { useSectorHeatmapData } from '@/lib/hooks';
import {
  type Sector,
  type SectorStock,
  type PeriodValue,
  getThemeColor,
  getMarketCapColor,
} from '@/lib/api';

export default function SectorHeatmapPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = (searchParams.get('period') as PeriodValue) || '1mo';

  const { data, error, isLoading, mutate } = useSectorHeatmapData(period);
  const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

  // データ取得後に全セクターを展開
  useEffect(() => {
    if (data) {
      setExpandedSectors(new Set(data.sectors.map(s => s.id)));
    }
  }, [data]);

  const handlePeriodChange = (newPeriod: PeriodValue) => {
    router.push(`/heatmap/sector?period=${newPeriod}`, { scroll: false });
  };

  const handleRetry = () => {
    mutate();
  };

  const toggleSector = (sectorId: string) => {
    setExpandedSectors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectorId)) {
        newSet.delete(sectorId);
      } else {
        newSet.add(sectorId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    if (data) {
      setExpandedSectors(new Set(data.sectors.map(s => s.id)));
    }
  };

  const collapseAll = () => {
    setExpandedSectors(new Set());
  };

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
          <h1 className="text-2xl font-bold text-gray-100">セクター別ヒートマップ</h1>
          <p className="text-sm text-gray-400 mt-1">
            テーマ（セクター）ごとの銘柄騰落率を表示
          </p>
        </div>
        <PeriodSelector selectedPeriod={period} onPeriodChange={handlePeriodChange} />
      </div>

      {/* View Controls */}
      {!isLoading && data && (
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            すべて展開
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            すべて閉じる
          </button>
          <Link
            href={`/heatmap?period=${period}`}
            className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors ml-auto"
          >
            時価総額別を見る
          </Link>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-300">セクターヒートマップデータを取得できませんでした。</p>
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
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="skeleton h-6 w-32" />
                <div className="skeleton h-6 w-16" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {Array.from({ length: 8 }).map((_, j) => (
                  <div key={j} className="skeleton h-16 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sector Heatmap Data */}
      {!isLoading && data && (
        <div className="space-y-4">
          {data.sectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              period={period}
              isExpanded={expandedSectors.has(sector.id)}
              onToggle={() => toggleSector(sector.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SectorCardProps {
  sector: Sector;
  period: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function SectorCard({ sector, period, isExpanded, onToggle }: SectorCardProps) {
  const themeColor = getThemeColor(sector.id);
  const isPositive = sector.average_change >= 0;

  return (
    <div className="card">
      {/* Sector Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-2 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${themeColor.bg} ${themeColor.text} border ${themeColor.border}`}>
            {sector.name}
          </span>
          <span className="text-sm text-gray-500">{sector.stock_count}銘柄</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{sector.average_change.toFixed(1)}%
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {sector.description && (
        <p className="text-sm text-gray-400 mb-3">{sector.description}</p>
      )}

      {/* Stocks Grid */}
      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mt-3">
          {sector.stocks.map((stock) => (
            <SectorStockCell key={stock.code} stock={stock} period={period} />
          ))}
        </div>
      )}
    </div>
  );
}

function SectorStockCell({ stock, period }: { stock: SectorStock; period: string }) {
  const isPositive = stock.change_percent >= 0;
  const marketCapColor = stock.market_cap_category ? getMarketCapColor(stock.market_cap_category.id) : null;

  // 騰落率に基づいて背景色の濃さを決定
  const intensity = Math.min(Math.abs(stock.change_percent) / 20, 1);
  const bgOpacity = 0.3 + intensity * 0.5;

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
          {marketCapColor && (
            <span className={`text-[9px] px-1 rounded ${marketCapColor.bg} ${marketCapColor.text}`}>
              {stock.market_cap_category?.label}
            </span>
          )}
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
      </div>
    </Link>
  );
}
