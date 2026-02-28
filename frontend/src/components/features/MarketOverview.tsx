interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePct: number;
}

interface MarketOverviewProps {
  indices: MarketIndex[];
  updatedAt?: string;
  className?: string;
}

function formatValue(val: number): string {
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function MarketOverview({
  indices,
  updatedAt,
  className = '',
}: MarketOverviewProps) {
  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">マーケット概況</h3>
        {updatedAt && (
          <span className="text-xs text-gray-500">
            更新: {new Date(updatedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {indices.map((index) => {
          const isPositive = index.changePct >= 0;
          return (
            <div key={index.name} className="bg-gray-900 rounded-lg p-3 border border-gray-700/50">
              <p className="text-xs text-gray-400 mb-1">{index.name}</p>
              <p className="text-lg font-bold text-white">{formatValue(index.value)}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{formatValue(index.change)}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  isPositive ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                }`}>
                  {isPositive ? '+' : ''}{index.changePct.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
