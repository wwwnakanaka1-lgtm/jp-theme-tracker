'use client';

import { useRef, useEffect } from 'react';

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: CandleData[];
  width?: number;
  height?: number;
  upColor?: string;
  downColor?: string;
  className?: string;
}

export default function CandlestickChart({
  data,
  width = 600,
  height = 300,
  upColor = '#22c55e',
  downColor = '#ef4444',
  className = '',
}: CandlestickChartProps) {
  const padding = { top: 16, right: 16, bottom: 24, left: 48 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-800 rounded-lg ${className}`} style={{ width, height }}>
        <span className="text-gray-500 text-sm">チャートデータがありません</span>
      </div>
    );
  }

  const allHigh = Math.max(...data.map((d) => d.high));
  const allLow = Math.min(...data.map((d) => d.low));
  const priceRange = allHigh - allLow || 1;

  const candleWidth = Math.max(chartW / data.length - 2, 1);
  const wickWidth = Math.max(candleWidth * 0.15, 1);

  const toY = (price: number) => padding.top + chartH - ((price - allLow) / priceRange) * chartH;

  const gridCount = 5;
  const gridStep = priceRange / (gridCount - 1);

  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`}>
      {Array.from({ length: gridCount }).map((_, i) => {
        const price = allLow + gridStep * i;
        const y = toY(price);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1f2937" strokeWidth={1} />
            <text x={padding.left - 4} y={y + 3} fill="#6b7280" fontSize={9} textAnchor="end">
              {price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price.toFixed(0)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const x = padding.left + (chartW / data.length) * i + (chartW / data.length - candleWidth) / 2;
        const isUp = d.close >= d.open;
        const color = isUp ? upColor : downColor;
        const bodyTop = toY(Math.max(d.open, d.close));
        const bodyBottom = toY(Math.min(d.open, d.close));
        const bodyH = Math.max(bodyBottom - bodyTop, 1);

        return (
          <g key={`${d.date}-${i}`}>
            <line
              x1={x + candleWidth / 2}
              y1={toY(d.high)}
              x2={x + candleWidth / 2}
              y2={toY(d.low)}
              stroke={color}
              strokeWidth={wickWidth}
            />
            <rect x={x} y={bodyTop} width={candleWidth} height={bodyH} fill={color} rx={0.5} />
          </g>
        );
      })}

      {data.length > 1 && (
        <>
          <text x={padding.left} y={height - 4} fill="#6b7280" fontSize={9} textAnchor="start">{data[0].date}</text>
          <text x={width - padding.right} y={height - 4} fill="#6b7280" fontSize={9} textAnchor="end">{data[data.length - 1].date}</text>
        </>
      )}
    </svg>
  );
}
