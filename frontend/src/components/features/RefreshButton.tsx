'use client';

import { useState } from 'react';

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  lastUpdated?: string | null;
  className?: string;
}

export default function RefreshButton({
  onRefresh,
  lastUpdated,
  className = '',
}: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors
          ${isRefreshing
            ? 'bg-gray-700 text-gray-400 cursor-wait'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
          }`}
        title="データを更新"
      >
        <svg
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {isRefreshing ? '更新中...' : '更新'}
      </button>

      {lastUpdated && !error && (
        <span className="text-xs text-gray-500">
          最終更新: {formatTime(lastUpdated)}
        </span>
      )}

      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
    </div>
  );
}
