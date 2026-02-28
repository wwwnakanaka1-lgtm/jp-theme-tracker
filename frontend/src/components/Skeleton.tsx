export function ThemeCardSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-gray-800 animate-pulse">
      {/* 順位 */}
      <div className="w-8 h-6 bg-gray-700 rounded" />
      {/* テーマ名・説明 */}
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-700 rounded w-2/3" />
      </div>
      {/* スパークライン */}
      <div className="w-[120px] h-[45px] bg-gray-700 rounded" />
      {/* 騰落率 */}
      <div className="w-16 h-6 bg-gray-700 rounded" />
    </div>
  );
}

export function ThemeListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <ThemeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StockCardSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-gray-800 animate-pulse">
      <div className="w-6 h-5 bg-gray-700 rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-1/4" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
      </div>
      <div className="w-[100px] h-[40px] bg-gray-700 rounded" />
      <div className="w-14 h-5 bg-gray-700 rounded" />
    </div>
  );
}

export function StockChartSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
      <div className="h-[400px] bg-gray-700 rounded" />
    </div>
  );
}

export function HeatmapSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 animate-pulse">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="h-16 bg-gray-700 rounded" />
      ))}
    </div>
  );
}

export function Nikkei225Skeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-gray-700 rounded w-24" />
        <div className="h-6 bg-gray-700 rounded w-20" />
      </div>
    </div>
  );
}
