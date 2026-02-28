'use client';

import { useMemo } from 'react';

interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartDataPoint[];
  width?: number;
  height?: number;
  barColor?: string;
  negativeColor?: string;
  showLabels?: boolean;
  showValues?: boolean;
  className?: string;
}

export default function BarChart({
  data,
  width = 400,
  height = 200,
  barColor = '#3b82f6',
  negativeColor = '#ef4444',
  showLabels = true,
  showValues = false,
  className = '',
}: BarChartProps) {
  const padding = { top: 16, right: 16, bottom: showLabels ? 32 : 16, left: 16 };

  const { maxAbs, chartWidth, chartHeight, barWidth } = useMemo(() => {
    const cw = width - padding.left - padding.right;
    const ch = height - padding.top - padding.bottom;
    const ma = Math.max(...data.map((d) => Math.abs(d.value)), 0.01);
    const bw = Math.max(cw / data.length - 4, 2);
    return { maxAbs: ma, chartWidth: cw, chartHeight: ch, barWidth: bw };
  }, [data, width, height, showLabels]);

  const hasNegative = data.some((d) => d.value < 0);
  const baseline = hasNegative ? padding.top + chartHeight / 2 : padding.top + chartHeight;

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <span className="text-gray-500 text-sm">データなし</span>
      </div>
    );
  }

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      <line x1={padding.left} y1={baseline} x2={width - padding.right} y2={baseline} stroke="#4b5563" strokeWidth={1} />
      {data.map((d, i) => {
        const x = padding.left + (chartWidth / data.length) * i + (chartWidth / data.length - barWidth) / 2;
        const barHeight = (Math.abs(d.value) / maxAbs) * (hasNegative ? chartHeight / 2 : chartHeight);
        const y = d.value >= 0 ? baseline - barHeight : baseline;
        const fill = d.color || (d.value >= 0 ? barColor : negativeColor);

        return (
          <g key={`${d.label}-${i}`}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barHeight, 1)} rx={2} fill={fill} opacity={0.85} />
            {showValues && (
              <text
                x={x + barWidth / 2}
                y={d.value >= 0 ? y - 4 : y + barHeight + 12}
                fill="#9ca3af"
                fontSize={9}
                textAnchor="middle"
              >
                {d.value.toFixed(1)}
              </text>
            )}
            {showLabels && (
              <text
                x={x + barWidth / 2}
                y={height - 6}
                fill="#6b7280"
                fontSize={9}
                textAnchor="middle"
              >
                {d.label.length > 5 ? `${d.label.slice(0, 5)}..` : d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
