'use client';

import { useState, useMemo } from 'react';

interface StockSearchResult {
  code: string;
  name: string;
  themeId: string;
  themeName: string;
  changePct: number;
}

interface StockSearchProps {
  stocks: StockSearchResult[];
  onSelect: (code: string) => void;
  placeholder?: string;
  className?: string;
}

export default function StockSearch({
  stocks,
  onSelect,
  placeholder = '銘柄コードまたは名前で検索',
  className = '',
}: StockSearchProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return stocks
      .filter((s) => s.code.includes(q) || s.name.toLowerCase().includes(q))
      .slice(0, 10);
  }, [stocks, query]);

  const showResults = isFocused && filtered.length > 0;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="w-full bg-gray-700 text-white text-sm pl-10 pr-4 py-2 rounded-lg border border-gray-600 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showResults && (
        <ul className="absolute z-50 mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {filtered.map((stock) => (
            <li key={stock.code}>
              <button
                onMouseDown={() => { onSelect(stock.code); setQuery(''); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-sm text-white font-medium">{stock.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{stock.code}</span>
                  <span className="text-xs text-gray-600 ml-2">{stock.themeName}</span>
                </div>
                <span className={`text-xs font-medium ${stock.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stock.changePct >= 0 ? '+' : ''}{stock.changePct.toFixed(2)}%
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
