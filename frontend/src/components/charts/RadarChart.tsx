'use client';

import { useMemo } from 'react';

interface RadarDimension {
  label: string;
  value: number;
  maxValue?: number;
}

interface RadarChartProps {
  dimensions: RadarDimension[];
  size?: number;
  color?: string;
  fillOpacity?: number;
  showLabels?: boolean;
  levels?: number;
  className?: string;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function RadarChart({
  dimensions,
  size = 280,
  color = '#3b82f6',
  fillOpacity = 0.2,
  showLabels = true,
  levels = 4,
  className = '',
}: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 40;
  const n = dimensions.length;

  const { gridPaths, dataPath, labelPositions } = useMemo(() => {
    if (n < 3) return { gridPaths: [], dataPath: '', labelPositions: [] };

    const angleStep = 360 / n;

    const grids = Array.from({ length: levels }).map((_, lvl) => {
      const r = (radius / levels) * (lvl + 1);
      const pts = Array.from({ length: n }).map((_, i) => polarToCartesian(cx, cy, r, i * angleStep));
      return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    });

    const dataPts = dimensions.map((dim, i) => {
      const maxVal = dim.maxValue ?? 100;
      const ratio = Math.min(dim.value / maxVal, 1);
      return polarToCartesian(cx, cy, radius * ratio, i * angleStep);
    });
    const dp = dataPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    const lp = dimensions.map((dim, i) => {
      const pos = polarToCartesian(cx, cy, radius + 18, i * angleStep);
      return { ...pos, label: dim.label };
    });

    return { gridPaths: grids, dataPath: dp, labelPositions: lp };
  }, [dimensions, n, cx, cy, radius, levels]);

  if (n < 3) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <span className="text-gray-500 text-sm">3次元以上必要です</span>
      </div>
    );
  }

  const angleStep = 360 / n;

  return (
    <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
      {gridPaths.map((path, i) => (
        <path key={i} d={path} fill="none" stroke="#374151" strokeWidth={1} opacity={0.5 + i * 0.15} />
      ))}

      {Array.from({ length: n }).map((_, i) => {
        const end = polarToCartesian(cx, cy, radius, i * angleStep);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#374151" strokeWidth={1} />;
      })}

      <path d={dataPath} fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth={2} />

      {showLabels &&
        labelPositions.map((lp, i) => (
          <text key={i} x={lp.x} y={lp.y} fill="#9ca3af" fontSize={10} textAnchor="middle" dominantBaseline="middle">
            {lp.label}
          </text>
        ))}
    </svg>
  );
}
