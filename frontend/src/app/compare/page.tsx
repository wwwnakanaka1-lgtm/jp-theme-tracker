'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ThemeData {
  id: string;
  name: string;
  change_percent: number;
}

const PERIODS = ['1d', '5d', '1mo', '3mo', '1y'];
const PERIOD_LABELS: Record<string, string> = {
  '1d': '1日',
  '5d': '5日',
  '1mo': '1ヶ月',
  '3mo': '3ヶ月',
  '1y': '1年',
};

export default function ComparePage() {
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [allThemes, setAllThemes] = useState<ThemeData[]>([]);
  const [compareData, setCompareData] = useState<Record<string, ThemeData[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/themes?period=1d`)
      .then((r) => r.json())
      .then((data) => setAllThemes(data.themes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedThemes.length === 0) return;
    const fetchAll = async () => {
      const results: Record<string, ThemeData[]> = {};
      for (const period of PERIODS) {
        try {
          const res = await fetch(`${API_BASE}/api/themes?period=${period}`);
          const data = await res.json();
          results[period] = (data.themes || []).filter((t: ThemeData) =>
            selectedThemes.includes(t.id),
          );
        } catch {
          results[period] = [];
        }
      }
      setCompareData(results);
    };
    fetchAll();
  }, [selectedThemes]);

  const toggleTheme = (id: string) => {
    setSelectedThemes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : prev.length < 5 ? [...prev, id] : prev,
    );
  };

  const formatPct = (val: number) => `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
  const colorClass = (val: number) => (val >= 0 ? 'text-green-400' : 'text-red-400');

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">テーマ比較</h1>
        <div className="animate-pulse h-40 bg-gray-800 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">テーマ比較</h1>
      <p className="text-gray-400 text-sm">最大5つのテーマを選択して比較できます</p>

      <div className="flex flex-wrap gap-2">
        {allThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => toggleTheme(theme.id)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedThemes.includes(theme.id)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {theme.name}
          </button>
        ))}
      </div>

      {selectedThemes.length > 0 && Object.keys(compareData).length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400 font-medium">テーマ</th>
                {PERIODS.map((p) => (
                  <th key={p} className="text-right py-3 text-gray-400 font-medium">
                    {PERIOD_LABELS[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedThemes.map((themeId) => {
                const themeName = allThemes.find((t) => t.id === themeId)?.name || themeId;
                return (
                  <tr key={themeId} className="border-b border-gray-800">
                    <td className="py-3 text-white">{themeName}</td>
                    {PERIODS.map((period) => {
                      const theme = compareData[period]?.find((t) => t.id === themeId);
                      const val = theme?.change_percent ?? 0;
                      return (
                        <td key={period} className={`py-3 text-right font-mono ${colorClass(val)}`}>
                          {formatPct(val)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
