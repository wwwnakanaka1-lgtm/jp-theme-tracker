'use client';

import { useMemo } from 'react';

interface VolumeDataPoint {
  date: string;
  volume: number;
  isUp: boolean;
}

interface VolumeChartProps {
  data: VolumeDataPoint[];
  width?: number;
  height?: number;
  upColor?: string;
  downColor?: string;
  className?: string;
}

export default function VolumeChart({
  data,
  width = 400,
  height = 80,
  upColor = '#22c55e',
  downColor = '#ef4444',
  className = '',
}: VolumeChartProps) {
  const padding = { left: 4, right: 4, top: 4, bottom: 4 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVol = useMemo(() => Math.max(...data.map((d) => d.volume), 1), [data]);

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-gray-500 text-xs">出来高データなし</span>
      </div>
    );
  }

  const barW = Math.max(chartW / data.length - 1, 1);

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      {data.map((d, i) => {
        const barH = (d.volume / maxVol) * chartH;
        const x = padding.left + (chartW / data.length) * i + (chartW / data.length - barW) / 2;
        const y = height - padding.bottom - barH;

        return (
          <rect
            key={`${d.date}-${i}`}
            x={x}
            y={y}
            width={barW}
            height={Math.max(barH, 0.5)}
            fill={d.isUp ? upColor : downColor}
            opacity={0.6}
            rx={0.5}
          />
        );
      })}
    </svg>
  );
}
