'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PERIODS, type PeriodValue, triggerDataRefresh } from '@/lib/api';

interface MarketHeaderProps {
  lastUpdated: string | null;
  period: PeriodValue;
  onRefreshComplete?: () => void;
}

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '';

  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}日前`;
    } else if (diffHours > 0) {
      return `${diffHours}時間前`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}分前`;
    }
  } catch {
    return '';
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';

  try {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  } catch {
    return '';
  }
}

function getPeriodLabel(period: PeriodValue): string {
  const periodInfo = PERIODS.find(p => p.value === period);
  return periodInfo?.label || period;
}

export default function MarketHeader({ lastUpdated, period, onRefreshComplete }: MarketHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const formattedDate = formatDate(lastUpdated);
  const timeAgo = getTimeAgo(lastUpdated);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setRefreshError(null);

    try {
      await triggerDataRefresh();
      onRefreshComplete?.();
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : '更新失敗');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span>
            終値：{formattedDate} {timeAgo && `(${timeAgo})`}
          </span>
        )}

        {/* 更新ボタン */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
            isRefreshing
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title="最新データに更新（30秒〜数分）"
        >
          <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? '更新中...' : '更新'}
        </button>

        {refreshError && (
          <span className="text-red-400 text-xs">{refreshError}</span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span>1年間推移</span>
        <span className="text-green-400">{getPeriodLabel(period)}騰落率</span>
      </div>
    </div>
  );
}
