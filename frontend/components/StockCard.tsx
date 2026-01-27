'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { mutate } from 'swr';
import type { Stock } from '@/lib/api';
import { getMarketCapColor, getThemeColor, fetchStockDetail } from '@/lib/api';
import Sparkline, { SparklineSkeleton } from './Sparkline';

interface StockCardProps {
  stock: Stock;
  period: string;
  rank?: number;
  themeId?: string;
  themeName?: string;
}

export default function StockCard({ stock, period, rank, themeId, themeName }: StockCardProps) {
  const changePercent = stock.change_percent ?? 0;
  const isPositive = changePercent >= 0;
  const marketCapColors = stock.market_cap_category ? getMarketCapColor(stock.market_cap_category.id) : null;
  const themeColor = themeId ? getThemeColor(themeId) : null;

  // ホバー時に銘柄詳細をプリフェッチ
  const handleMouseEnter = () => {
    mutate(
      ['stock', stock.code, period],
      fetchStockDetail(stock.code, period),
      { revalidate: false }
    );
  };

  return (
    <Link href={`/stock/${stock.code}?period=${period}`} onMouseEnter={handleMouseEnter}>
      <div className="theme-row group">
        {/* Rank */}
        {rank !== undefined && (
          <div
            className={`rank-badge ${
              isPositive ? 'rank-badge-positive' : 'rank-badge-negative'
            }`}
          >
            {rank}
          </div>
        )}

        {/* Stock Info */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono text-gray-400">{stock.code.replace('.T', '')}</span>
            {stock.market_cap_category && marketCapColors && (
              <span className={`inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium ${marketCapColors.bg} ${marketCapColors.text} border ${marketCapColors.border}`}>
                {stock.market_cap_category.label}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-100 group-hover:text-blue-400 transition-colors leading-tight">
            {stock.name}
          </h3>
          {stock.description && (
            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">
              {stock.description}
            </p>
          )}
        </div>

        {/* Sparkline - サイズを大きく、ラベル表示 */}
        <div className="flex-shrink-0 hidden sm:block">
          <Sparkline
            data={stock.sparkline || { data: [], period_start_index: 0 }}
            isPositive={isPositive}
            width={120}
            height={45}
            showMinMax={true}
          />
        </div>
        <div className="flex-shrink-0 sm:hidden">
          <Sparkline
            data={stock.sparkline || { data: [], period_start_index: 0 }}
            isPositive={isPositive}
            width={100}
            height={40}
            showMinMax={true}
          />
        </div>

        {/* Change Percent */}
        <div className="text-right min-w-[60px] sm:min-w-[80px] flex-shrink-0 ml-1">
          <div
            className={`text-lg font-bold ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {changePercent.toFixed(1)}%
          </div>
          {stock.change_percent_1d != null && (
            <div className="text-xs text-gray-400">
              1日{' '}
              <span className={stock.change_percent_1d >= 0 ? 'text-green-400' : 'text-red-400'}>
                {stock.change_percent_1d >= 0 ? '+' : ''}{stock.change_percent_1d.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Arrow - デスクトップのみ */}
        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 hidden sm:block" />
      </div>
    </Link>
  );
}

export function StockCardSkeleton() {
  return (
    <div className="theme-row">
      <div className="skeleton h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="skeleton h-4 w-16" />
          <div className="skeleton h-4 w-12 rounded" />
        </div>
        <div className="skeleton h-5 w-32 mb-1" />
        <div className="skeleton h-3 w-48" />
      </div>
      <div className="flex-shrink-0 hidden sm:block">
        <SparklineSkeleton width={120} height={45} />
      </div>
      <div className="flex-shrink-0 sm:hidden">
        <SparklineSkeleton width={100} height={40} />
      </div>
      <div className="skeleton h-6 w-14 sm:w-16 ml-1" />
      <div className="skeleton h-5 w-5 rounded" />
    </div>
  );
}
