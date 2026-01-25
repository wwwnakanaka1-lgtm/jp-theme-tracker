'use client';

import { LineChart, Line, ResponsiveContainer, YAxis, ReferenceLine } from 'recharts';

interface SparklineData {
  data: number[];
  period_start_index: number;
}

interface SparklineProps {
  data: number[] | SparklineData;
  isPositive: boolean;
  width?: number;
  height?: number;
  showMinMax?: boolean;
}

export default function Sparkline({
  data,
  isPositive,
  width = 120,
  height = 40,
  showMinMax = true,
}: SparklineProps) {
  // データ形式の判定（配列 or オブジェクト）
  const sparklineData: SparklineData = Array.isArray(data)
    ? { data: data, period_start_index: 0 }
    : data;

  const { data: values, period_start_index } = sparklineData;

  if (!values || values.length === 0) {
    return (
      <div
        className="bg-gray-800 rounded flex items-center justify-center"
        style={{ width, height }}
      >
        <span className="text-gray-500 text-xs">No data</span>
      </div>
    );
  }

  // データをチャート用に変換（期間前と期間内を区別）
  const chartData = values.map((value, index) => ({
    value,
    index,
    // 期間前のデータ（グレー表示）
    prePeriod: index < period_start_index ? value : null,
    // 期間内のデータ（緑/赤表示）- 境界点も含める
    inPeriod: index >= period_start_index ? value : (index === period_start_index - 1 ? value : null),
  }));

  // 境界点を接続するため、期間前の最後のポイントに期間内の値も設定
  if (period_start_index > 0 && period_start_index < values.length) {
    chartData[period_start_index - 1].inPeriod = values[period_start_index - 1];
  }

  const color = isPositive ? '#22c55e' : '#ef4444';
  const grayColor = '#6b7280';
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // 最大・最小の表示用テキスト
  const maxText = maxValue >= 0 ? `+${maxValue.toFixed(0)}%` : `${maxValue.toFixed(0)}%`;
  const minText = minValue >= 0 ? `+${minValue.toFixed(0)}%` : `${minValue.toFixed(0)}%`;

  return (
    <div className="relative" style={{ width, height: showMinMax ? height + 20 : height }}>
      {/* Max label */}
      {showMinMax && (
        <div
          className="absolute left-0 text-[10px] text-green-400 font-medium"
          style={{ top: 0 }}
        >
          {maxText}
        </div>
      )}

      {/* Chart */}
      <div style={{ width, height, marginTop: showMinMax ? 10 : 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <YAxis domain={[minValue, maxValue]} hide />
            <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="2 2" />
            {/* 期間前のライン（グレー） */}
            <Line
              type="monotone"
              dataKey="prePeriod"
              stroke={grayColor}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
            {/* 選択期間のライン（緑/赤） */}
            <Line
              type="monotone"
              dataKey="inPeriod"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Min label */}
      {showMinMax && (
        <div
          className="absolute left-0 text-[10px] text-red-400 font-medium"
          style={{ bottom: 0 }}
        >
          {minText}
        </div>
      )}
    </div>
  );
}

export function SparklineSkeleton({ width = 120, height = 40 }: { width?: number; height?: number }) {
  return (
    <div
      className="skeleton rounded"
      style={{ width, height }}
    />
  );
}
