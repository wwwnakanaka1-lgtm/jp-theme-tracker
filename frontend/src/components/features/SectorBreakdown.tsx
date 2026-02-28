interface SectorData {
  name: string;
  weight: number;
  returnPct: number;
  stockCount: number;
}

interface SectorBreakdownProps {
  sectors: SectorData[];
  title?: string;
  className?: string;
}

const BAR_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-lime-500',
  'bg-orange-500',
  'bg-teal-500',
];

export default function SectorBreakdown({
  sectors,
  title = 'セクター構成',
  className = '',
}: SectorBreakdownProps) {
  const sorted = [...sectors].sort((a, b) => b.weight - a.weight);
  const maxWeight = Math.max(...sorted.map((s) => s.weight), 1);

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-5 ${className}`}>
      <h3 className="text-white font-semibold mb-4">{title}</h3>

      <div className="space-y-3">
        {sorted.map((sector, idx) => (
          <div key={sector.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-white">{sector.name}</span>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${sector.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sector.returnPct >= 0 ? '+' : ''}{sector.returnPct.toFixed(2)}%
                </span>
                <span className="text-xs text-gray-500 w-12 text-right">{sector.weight.toFixed(1)}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`${BAR_COLORS[idx % BAR_COLORS.length]} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${(sector.weight / maxWeight) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{sector.stockCount}銘柄</p>
          </div>
        ))}
      </div>

      {sectors.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">セクターデータがありません</p>
      )}
    </div>
  );
}
