'use client';

import { useState } from 'react';

interface WatchlistItem {
  code: string;
  name: string;
  price: number;
  changePct: number;
  addedAt: string;
}

interface WatchlistPanelProps {
  items: WatchlistItem[];
  onRemove: (code: string) => void;
  onSelect: (code: string) => void;
  onAddCode?: (code: string) => void;
  className?: string;
}

export default function WatchlistPanel({
  items,
  onRemove,
  onSelect,
  onAddCode,
  className = '',
}: WatchlistPanelProps) {
  const [newCode, setNewCode] = useState('');

  const handleAdd = () => {
    const trimmed = newCode.trim();
    if (trimmed && onAddCode) {
      onAddCode(trimmed);
      setNewCode('');
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold mb-3">ウォッチリスト</h3>
        {onAddCode && (
          <div className="flex gap-2">
            <input
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="銘柄コードを入力"
              className="flex-1 bg-gray-700 text-white text-sm px-3 py-1.5 rounded border border-gray-600 placeholder:text-gray-500"
            />
            <button
              onClick={handleAdd}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              追加
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 text-sm">ウォッチリストは空です</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-700/50">
          {items.map((item) => (
            <li key={item.code} className="flex items-center justify-between px-4 py-3 hover:bg-gray-750 transition-colors">
              <button onClick={() => onSelect(item.code)} className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.code}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm text-white">¥{item.price.toLocaleString()}</p>
                    <p className={`text-xs font-medium ${item.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(item.code); }}
                className="ml-2 text-gray-500 hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
