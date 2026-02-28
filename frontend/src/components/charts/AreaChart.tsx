'use client';

import { useRef, useEffect, useMemo } from 'react';

interface AreaChartProps {
  data: number[];
  labels?: string[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  showGrid?: boolean;
  className?: string;
}

function buildPath(data: number[], w: number, h: number, padding: number): { line: string; area: string } {
  if (data.length < 2) return { line: '', area: '' };
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (w - padding * 2) / (data.length - 1);

  const points = data.map((val, i) => ({
    x: padding + i * stepX,
    y: h - padding - ((val - min) / range) * (h - padding * 2),
  }));

  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${lineD} L ${points[points.length - 1].x} ${h - padding} L ${points[0].x} ${h - padding} Z`;

  return { line: lineD, area: areaD };
}

export default function AreaChart({
  data,
  labels,
  width = 400,
  height = 200,
  color = '#3b82f6',
  fillOpacity = 0.15,
  showGrid = true,
  className = '',
}: AreaChartProps) {
  const padding = 24;
  const { line, area } = useMemo(() => buildPath(data, width, height, padding), [data, width, height]);

  if (data.length < 2) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-gray-500 text-sm">データ不足</span>
      </div>
    );
  }

  const gridLines = 4;

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      {showGrid &&
        Array.from({ length: gridLines }).map((_, i) => {
          const y = padding + ((height - padding * 2) / (gridLines - 1)) * i;
          return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#374151" strokeWidth={1} />;
        })}
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {labels && labels.length > 0 && (
        <>
          <text x={padding} y={height - 4} fill="#6b7280" fontSize={10} textAnchor="start">{labels[0]}</text>
          <text x={width - padding} y={height - 4} fill="#6b7280" fontSize={10} textAnchor="end">{labels[labels.length - 1]}</text>
        </>
      )}
    </svg>
  );
}
