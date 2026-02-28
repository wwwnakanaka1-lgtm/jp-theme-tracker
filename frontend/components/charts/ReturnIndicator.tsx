interface ReturnIndicatorProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  showSign?: boolean;
}

const sizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg font-semibold',
};

export default function ReturnIndicator({ value, size = 'md', showSign = true }: ReturnIndicatorProps) {
  const colorClass = value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400';
  const sign = showSign && value > 0 ? '+' : '';

  return (
    <span className={`font-mono ${colorClass} ${sizeClasses[size]}`}>
      {sign}
      {value.toFixed(2)}%
    </span>
  );
}
