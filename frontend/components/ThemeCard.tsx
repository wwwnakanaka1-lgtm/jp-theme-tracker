'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Theme } from '@/lib/api';
import { getThemeColor } from '@/lib/api';
import Sparkline, { SparklineSkeleton } from './Sparkline';

interface ThemeCardProps {
  theme: Theme;
  period: string;
  rank?: number;
}

export default function ThemeCard({ theme, period, rank }: ThemeCardProps) {
  const changePercent = theme.change_percent ?? 0;
  const isPositive = changePercent >= 0;
  const themeColor = getThemeColor(theme.id);

  return (
    <Link href={`/theme/${theme.id}?period=${period}`}>
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

        {/* Theme Info */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-100 group-hover:text-blue-400 transition-colors leading-tight">
            {theme.name}
          </h3>
          {theme.description && (
            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded mt-0.5 ${themeColor.bg} ${themeColor.text} border ${themeColor.border}`}>
              {theme.description}
            </span>
          )}
          {/* Top 3 Stocks - モバイルでは2つまで */}
          {theme.top_stocks && theme.top_stocks.length > 0 && (
            <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px]">
              {theme.top_stocks.slice(0, 2).map((stock) => {
                const stockChange = stock.change_percent ?? 0;
                const stockPositive = stockChange >= 0;
                return (
                  <span key={stock.code} className="text-gray-400">
                    {stock.name}
                    <span className={`ml-0.5 ${stockPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {stockPositive ? '+' : ''}{stockChange.toFixed(1)}%
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Sparkline - モバイルでは小さく表示 */}
        <div className="flex-shrink-0 hidden sm:block">
          <Sparkline
            data={theme.sparkline || { data: [], period_start_index: 0 }}
            isPositive={isPositive}
            width={80}
            height={28}
          />
        </div>
        <div className="flex-shrink-0 sm:hidden">
          <Sparkline
            data={theme.sparkline || { data: [], period_start_index: 0 }}
            isPositive={isPositive}
            width={50}
            height={20}
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
          {theme.change_percent_1d != null && (
            <div className="text-xs text-gray-400">
              1日{' '}
              <span className={theme.change_percent_1d >= 0 ? 'text-green-400' : 'text-red-400'}>
                {theme.change_percent_1d >= 0 ? '+' : ''}{theme.change_percent_1d.toFixed(1)}%
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

export function ThemeCardSkeleton() {
  return (
    <div className="theme-row">
      <div className="skeleton h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="skeleton h-5 w-32 mb-1" />
        <div className="skeleton h-4 w-24 rounded mb-1" />
        <div className="skeleton h-3 w-48" />
      </div>
      <div className="flex-shrink-0 hidden sm:block">
        <SparklineSkeleton width={80} height={28} />
      </div>
      <div className="flex-shrink-0 sm:hidden">
        <SparklineSkeleton width={50} height={20} />
      </div>
      <div className="skeleton h-6 w-14 sm:w-16 ml-1" />
      <div className="skeleton h-5 w-5 rounded" />
    </div>
  );
}
