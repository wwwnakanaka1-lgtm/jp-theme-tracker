'use client';

import { useMemo } from 'react';

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

export default function DonutChart({
  segments,
  size = 200,
  thickness = 28,
  centerLabel,
  centerValue,
  className = '',
}: DonutChartProps) {
  const radius = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = useMemo(() => segments.reduce((sum, s) => sum + s.value, 0), [segments]);

  const arcs = useMemo(() => {
    let offset = 0;
    return segments.map((seg) => {
      const pct = total > 0 ? seg.value / total : 0;
      const dashLength = pct * circumference;
      const dashOffset = -offset;
      offset += dashLength;
      return { ...seg, dashLength, dashOffset, pct };
    });
  }, [segments, total, circumference]);

  if (segments.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <span className="text-gray-500 text-sm">データなし</span>
      </div>
    );
  }

  return (
    <svg width={size} height={size} className={className} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1f2937" strokeWidth={thickness} />

      {arcs.map((arc, i) => (
        <circle
          key={`${arc.label}-${i}`}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={arc.color}
          strokeWidth={thickness}
          strokeDasharray={`${arc.dashLength} ${circumference - arc.dashLength}`}
          strokeDashoffset={arc.dashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="butt"
        />
      ))}

      {(centerLabel || centerValue) && (
        <g>
          {centerValue && (
            <text x={cx} y={centerLabel ? cy - 4 : cy} fill="white" fontSize={18} fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
              {centerValue}
            </text>
          )}
          {centerLabel && (
            <text x={cx} y={centerValue ? cy + 14 : cy} fill="#9ca3af" fontSize={11} textAnchor="middle" dominantBaseline="middle">
              {centerLabel}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}
