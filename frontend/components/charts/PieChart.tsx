interface Segment {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  segments: Segment[];
  size?: number;
}

export default function PieChart({ segments, size = 120 }: PieChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;

  const center = size / 2;
  const radius = center - 4;
  let currentAngle = -90;

  const paths = segments.map((segment) => {
    const angle = (segment.value / total) * 360;
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + angle) * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);
    const largeArc = angle > 180 ? 1 : 0;

    const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    currentAngle += angle;

    return { ...segment, path };
  });

  return (
    <div className="inline-block">
      <svg width={size} height={size}>
        {paths.map((p) => (
          <path key={p.label} d={p.path} fill={p.color} opacity={0.8} />
        ))}
      </svg>
      <div className="mt-2 space-y-1">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
            <span className="text-gray-400">
              {s.label}: {((s.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
