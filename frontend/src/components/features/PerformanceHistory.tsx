interface PerformanceEntry {
  date: string;
  returnPct: number;
  label?: string;
}

interface PerformanceHistoryProps {
  entries: PerformanceEntry[];
  title?: string;
  maxEntries?: number;
  className?: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

function getBarWidth(value: number, maxAbs: number): number {
  return maxAbs === 0 ? 0 : (Math.abs(value) / maxAbs) * 100;
}

export default function PerformanceHistory({
  entries,
  title = 'パフォーマンス推移',
  maxEntries = 10,
  className = '',
}: PerformanceHistoryProps) {
  const displayEntries = entries.slice(-maxEntries);
  const maxAbs = Math.max(...displayEntries.map((e) => Math.abs(e.returnPct)), 0.01);

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-5 ${className}`}>
      <h3 className="text-white font-semibold mb-4">{title}</h3>

      {displayEntries.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">履歴データがありません</p>
      ) : (
        <div className="space-y-2">
          {displayEntries.map((entry, idx) => {
            const isPositive = entry.returnPct >= 0;
            const width = getBarWidth(entry.returnPct, maxAbs);

            return (
              <div key={`${entry.date}-${idx}`} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16 flex-shrink-0">
                  {formatDate(entry.date)}
                </span>
                <div className="flex-1 flex items-center">
                  <div className="w-1/2 flex justify-end">
                    {!isPositive && (
                      <div
                        className="bg-red-500/60 h-5 rounded-l transition-all duration-300"
                        style={{ width: `${width}%` }}
                      />
                    )}
                  </div>
                  <div className="w-px h-5 bg-gray-600 flex-shrink-0" />
                  <div className="w-1/2">
                    {isPositive && (
                      <div
                        className="bg-green-500/60 h-5 rounded-r transition-all duration-300"
                        style={{ width: `${width}%` }}
                      />
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium w-16 text-right flex-shrink-0 ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {isPositive ? '+' : ''}{entry.returnPct.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      )}

      {entries.length > maxEntries && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          直近 {maxEntries} 件を表示（全 {entries.length} 件）
        </p>
      )}
    </div>
  );
}
