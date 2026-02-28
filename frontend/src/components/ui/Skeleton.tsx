interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
  className?: string;
}

function resolveSize(val: string | number | undefined): string | undefined {
  if (val === undefined) return undefined;
  return typeof val === 'number' ? `${val}px` : val;
}

function SkeletonLine({
  variant = 'text',
  width,
  height,
  className = '',
}: Omit<SkeletonProps, 'lines'>) {
  const baseClass = 'bg-gray-700 animate-pulse';
  const variantClasses: Record<string, string> = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
      style={{
        width: resolveSize(width) ?? (variant === 'circular' ? '40px' : '100%'),
        height: resolveSize(height) ?? (variant === 'circular' ? '40px' : undefined),
      }}
    />
  );
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
}: SkeletonProps) {
  if (lines <= 1) {
    return <SkeletonLine variant={variant} width={width} height={height} className={className} />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          variant={variant}
          width={i === lines - 1 ? '75%' : width}
          height={height}
        />
      ))}
    </div>
  );
}
