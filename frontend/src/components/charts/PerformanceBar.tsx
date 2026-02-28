interface PerformanceBarProps {
  value: number;
  maxAbsValue?: number;
  height?: number;
}

export default function PerformanceBar({ value, maxAbsValue = 10, height = 20 }: PerformanceBarProps) {
  const clampedValue = Math.max(-maxAbsValue, Math.min(maxAbsValue, value));
  const width = Math.abs(clampedValue / maxAbsValue) * 50;
  const isPositive = value >= 0;

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-full" style={{ height }}>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-600" />
        <div
          className={`absolute top-0 bottom-0 rounded-sm ${
            isPositive ? 'bg-green-500/60' : 'bg-red-500/60'
          }`}
          style={{
            [isPositive ? 'left' : 'right']: '50%',
            width: `${width}%`,
          }}
        />
      </div>
      <span
        className={`text-xs font-mono w-16 text-right ${
          isPositive ? 'text-green-400' : 'text-red-400'
        }`}
      >
        {value >= 0 ? '+' : ''}
        {value.toFixed(2)}%
      </span>
    </div>
  );
}
