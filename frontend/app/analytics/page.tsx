'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ThemePerformance {
  id: string;
  name: string;
  change_percent: number;
}

export default function AnalyticsPage() {
  const [themes1d, setThemes1d] = useState<ThemePerformance[]>([]);
  const [themes1mo, setThemes1mo] = useState<ThemePerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [res1d, res1mo] = await Promise.all([
          fetch(`${API_BASE}/api/themes?period=1d`),
          fetch(`${API_BASE}/api/themes?period=1mo`),
        ]);
        if (res1d.ok) {
          const data = await res1d.json();
          setThemes1d((data.themes || []).slice(0, 10));
        }
        if (res1mo.ok) {
          const data = await res1mo.json();
          setThemes1mo((data.themes || []).slice(0, 10));
        }
      } catch {
        // silently handle fetch errors
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatPct = (val: number) => {
    const sign = val >= 0 ? '+' : '';
    return `${sign}${val.toFixed(2)}%`;
  };

  const colorClass = (val: number) =>
    val >= 0 ? 'text-green-400' : 'text-red-400';

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">アナリティクス</h1>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">アナリティクス</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">本日のテーマランキング</h2>
          <div className="space-y-3">
            {themes1d.map((theme, idx) => (
              <div key={theme.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 w-6 text-right">{idx + 1}</span>
                  <span className="text-white text-sm">{theme.name}</span>
                </div>
                <span className={`text-sm font-mono ${colorClass(theme.change_percent)}`}>
                  {formatPct(theme.change_percent)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">月間テーマランキング</h2>
          <div className="space-y-3">
            {themes1mo.map((theme, idx) => (
              <div key={theme.id} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 w-6 text-right">{idx + 1}</span>
                  <span className="text-white text-sm">{theme.name}</span>
                </div>
                <span className={`text-sm font-mono ${colorClass(theme.change_percent)}`}>
                  {formatPct(theme.change_percent)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">概要統計</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">20</p>
            <p className="text-gray-400 text-sm">トラッキングテーマ</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">200</p>
            <p className="text-gray-400 text-sm">銘柄数</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">7</p>
            <p className="text-gray-400 text-sm">分析期間</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-400">5分</p>
            <p className="text-gray-400 text-sm">更新間隔</p>
          </div>
        </div>
      </div>
    </div>
  );
}
