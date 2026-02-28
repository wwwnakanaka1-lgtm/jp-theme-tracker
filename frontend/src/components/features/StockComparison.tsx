'use client';

import type { Stock } from '@/lib/api';

interface StockComparisonProps {
  stocks: Stock[];
  onRemove?: (code: string) => void;
  className?: string;
}

function formatPercent(val: number): string {
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

function formatNumber(val: number | undefined): string {
  if (val === undefined || val === null) return '-';
  if (val >= 1_000_000_000_000) return `${(val / 1_000_000_000_000).toFixed(1)}兆`;
  if (val >= 100_000_000) return `${(val / 100_000_000).toFixed(0)}億`;
  return val.toLocaleString();
}

const metricRows = [
  { label: '騰落率', key: 'change_percent', format: (v: number) => formatPercent(v) },
  { label: '株価', key: 'price', format: (v: number | undefined) => (v ? `¥${v.toLocaleString()}` : '-') },
  { label: '出来高', key: 'volume', format: (v: number | undefined) => formatNumber(v) },
  { label: '時価総額', key: 'market_cap', format: (v: number | undefined) => formatNumber(v) },
  { label: 'β値', key: 'beta', format: (v: number | undefined) => (v !== undefined ? v.toFixed(2) : '-') },
] as const;

export default function StockComparison({ stocks, onRemove, className = '' }: StockComparisonProps) {
  if (stocks.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg border border-gray-700 p-6 text-center ${className}`}>
        <p className="text-gray-400 text-sm">比較する銘柄を選択してください</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="px-4 py-3 text-left text-gray-400 font-medium">指標</th>
            {stocks.map((stock) => (
              <th key={stock.code} className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-white font-medium">{stock.name}</span>
                  {onRemove && (
                    <button onClick={() => onRemove(stock.code)} className="text-gray-500 hover:text-red-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <span className="text-xs text-gray-500">{stock.code}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricRows.map((row) => (
            <tr key={row.key} className="border-b border-gray-800">
              <td className="px-4 py-2.5 text-gray-400">{row.label}</td>
              {stocks.map((stock) => {
                const val = stock[row.key as keyof Stock];
                return (
                  <td key={stock.code} className="px-4 py-2.5 text-right text-white">
                    {row.format(val as never)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
