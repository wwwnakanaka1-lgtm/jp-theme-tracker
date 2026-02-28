interface TrendIndicatorProps {
  value: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

type TrendDirection = 'up' | 'down' | 'neutral';

function getTrend(value: number): TrendDirection {
  if (value > 0.1) return 'up';
  if (value < -0.1) return 'down';
  return 'neutral';
}

const sizeMap = {
  sm: { icon: 'w-3 h-3', text: 'text-xs', gap: 'gap-1' },
  md: { icon: 'w-4 h-4', text: 'text-sm', gap: 'gap-1.5' },
  lg: { icon: 'w-5 h-5', text: 'text-base', gap: 'gap-2' },
};

const trendColors: Record<TrendDirection, string> = {
  up: 'text-green-400',
  down: 'text-red-400',
  neutral: 'text-gray-400',
};

function ArrowUp({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ArrowDown({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function Minus({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14" />
    </svg>
  );
}

export default function TrendIndicator({
  value,
  label,
  showValue = true,
  size = 'md',
  className = '',
}: TrendIndicatorProps) {
  const trend = getTrend(value);
  const s = sizeMap[size];
  const color = trendColors[trend];
  const IconComponent = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const sign = value > 0 ? '+' : '';

  return (
    <span className={`inline-flex items-center ${s.gap} ${color} ${className}`}>
      <IconComponent className={s.icon} />
      {showValue && (
        <span className={`font-medium ${s.text}`}>
          {sign}{value.toFixed(2)}%
        </span>
      )}
      {label && <span className={`${s.text} opacity-70`}>{label}</span>}
    </span>
  );
}
