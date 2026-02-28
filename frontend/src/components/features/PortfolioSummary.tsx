interface PortfolioStock {
  code: string;
  name: string;
  weight: number;
  returnPct: number;
}

interface PortfolioSummaryProps {
  stocks: PortfolioStock[];
  totalReturn: number;
  totalValue?: number;
  period: string;
  className?: string;
}

function formatReturn(val: number): string {
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

export default function PortfolioSummary({
  stocks,
  totalReturn,
  totalValue,
  period,
  className = '',
}: PortfolioSummaryProps) {
  const sortedStocks = [...stocks].sort((a, b) => b.weight - a.weight);
  const topContributors = sortedStocks.slice(0, 5);
  const returnColor = totalReturn >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">ポートフォリオサマリー</h3>
        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">{period}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs text-gray-400 mb-1">トータルリターン</p>
          <p className={`text-2xl font-bold ${returnColor}`}>{formatReturn(totalReturn)}</p>
        </div>
        {totalValue !== undefined && (
          <div>
            <p className="text-xs text-gray-400 mb-1">評価額</p>
            <p className="text-2xl font-bold text-white">¥{totalValue.toLocaleString()}</p>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-gray-400 mb-2">上位保有銘柄</p>
        <div className="space-y-2">
          {topContributors.map((stock) => (
            <div key={stock.code} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs text-gray-500 w-8 text-right">{stock.weight.toFixed(1)}%</span>
                <span className="text-sm text-white truncate">{stock.name}</span>
              </div>
              <span className={`text-sm font-medium ${stock.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatReturn(stock.returnPct)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {stocks.length > 5 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          他 {stocks.length - 5} 銘柄
        </p>
      )}
    </div>
  );
}
