'use client';

import { PERIODS, type PeriodValue } from '@/lib/api';

interface MarketHeaderProps {
  lastUpdated: string | null;
  period: PeriodValue;
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

export default function MarketHeader({ lastUpdated, period }: MarketHeaderProps) {
  const formattedDate = formatDate(lastUpdated);
  const timeAgo = getTimeAgo(lastUpdated);

  return (
    <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
      <div className="flex items-center gap-4">
        {lastUpdated && (
          <span>
            終値：{formattedDate} {timeAgo && `(${timeAgo})`}
          </span>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span>1年間推移</span>
        <span className="text-green-400">{getPeriodLabel(period)}騰落率</span>
      </div>
    </div>
  );
}
