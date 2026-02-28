interface ThemeRankEntry {
  rank: number;
  previousRank: number | null;
  themeId: string;
  themeName: string;
  changePct: number;
  stockCount: number;
}

interface ThemeRankingListProps {
  rankings: ThemeRankEntry[];
  onThemeClick?: (themeId: string) => void;
  className?: string;
}

function getRankChange(current: number, previous: number | null): { label: string; color: string } {
  if (previous === null) return { label: 'NEW', color: 'text-blue-400' };
  const diff = previous - current;
  if (diff > 0) return { label: `+${diff}`, color: 'text-green-400' };
  if (diff < 0) return { label: `${diff}`, color: 'text-red-400' };
  return { label: '-', color: 'text-gray-500' };
}

function getMedalClass(rank: number): string {
  if (rank === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-600';
  if (rank === 2) return 'bg-gray-400/20 text-gray-300 border-gray-500';
  if (rank === 3) return 'bg-amber-700/20 text-amber-400 border-amber-700';
  return 'bg-gray-800 text-gray-400 border-gray-700';
}

export default function ThemeRankingList({
  rankings,
  onThemeClick,
  className = '',
}: ThemeRankingListProps) {
  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">テーマランキング</h3>
      </div>

      {rankings.length === 0 ? (
        <div className="p-6 text-center text-gray-500 text-sm">ランキングデータがありません</div>
      ) : (
        <ul className="divide-y divide-gray-700/50">
          {rankings.map((entry) => {
            const rankChange = getRankChange(entry.rank, entry.previousRank);
            const medalClass = getMedalClass(entry.rank);
            return (
              <li key={entry.themeId}>
                <button
                  onClick={() => onThemeClick?.(entry.themeId)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-750 transition-colors"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${medalClass}`}>
                    {entry.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{entry.themeName}</p>
                    <p className="text-xs text-gray-500">{entry.stockCount}銘柄</p>
                  </div>
                  <span className={`text-xs font-medium ${rankChange.color}`}>{rankChange.label}</span>
                  <span className={`text-sm font-medium w-16 text-right ${entry.changePct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {entry.changePct >= 0 ? '+' : ''}{entry.changePct.toFixed(2)}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
