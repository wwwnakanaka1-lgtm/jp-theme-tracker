'use client';

import { useState, useMemo } from 'react';

interface ThemeFilterProps {
  categories: string[];
  selectedCategories: string[];
  performanceRange: [number, number];
  onCategoryChange: (categories: string[]) => void;
  onPerformanceChange: (range: [number, number]) => void;
  className?: string;
}

const PERFORMANCE_PRESETS = [
  { label: 'すべて', range: [-100, 100] as [number, number] },
  { label: '好調 (+5%以上)', range: [5, 100] as [number, number] },
  { label: 'やや好調 (0〜5%)', range: [0, 5] as [number, number] },
  { label: '不調 (0%未満)', range: [-100, 0] as [number, number] },
];

export default function ThemeFilter({
  categories,
  selectedCategories,
  performanceRange,
  onCategoryChange,
  onPerformanceChange,
  className = '',
}: ThemeFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activePreset = useMemo(() => {
    return PERFORMANCE_PRESETS.find(
      (p) => p.range[0] === performanceRange[0] && p.range[1] === performanceRange[1],
    );
  }, [performanceRange]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      onCategoryChange(selectedCategories.filter((c) => c !== cat));
    } else {
      onCategoryChange([...selectedCategories, cat]);
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 p-4 ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-white font-medium text-sm">フィルター</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">パフォーマンス</p>
            <div className="flex flex-wrap gap-2">
              {PERFORMANCE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => onPerformanceChange(preset.range)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    activePreset?.label === preset.label
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">カテゴリー</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
