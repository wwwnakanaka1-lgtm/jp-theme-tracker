'use client';

import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Area,
} from 'recharts';
import type { PriceData, ChartIndicators } from '@/lib/api';

type IndicatorMode = 'ma' | 'bollinger' | 'ichimoku';

interface StockChartProps {
  history: PriceData[];
  ma5?: number[];
  ma25?: number[];
  rsi?: number[];
  chartIndicators?: ChartIndicators;
  selectedPeriodStartIndex?: number;
}

interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Candlestick
  candleBody: [number, number];
  candleWick: [number, number];
  isUp: boolean;
  // MA
  ma20?: number | null;
  ma75?: number | null;
  ma200?: number | null;
  // Legacy MA
  ma5?: number;
  ma25?: number;
  // RSI
  rsi?: number | null;
  // Bollinger Bands
  bbMiddle?: number | null;
  bbUpper?: number | null;
  bbLower?: number | null;
  // Ichimoku
  tenkan?: number | null;
  kijun?: number | null;
  senkouA?: number | null;
  senkouB?: number | null;
  chikou?: number | null;
}

// Custom candlestick shape component
const CandlestickBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const { high, low, open, close, isUp } = payload;
  const color = isUp ? '#22c55e' : '#ef4444';

  // Calculate positions
  const bodyTop = Math.min(open, close);
  const bodyBottom = Math.max(open, close);
  const yScale = height / (bodyBottom - bodyTop || 1);

  // Wick line position (center of the bar)
  const centerX = x + width / 2;

  return (
    <g>
      {/* Wick (high-low line) */}
      <line
        x1={centerX}
        y1={y}
        x2={centerX}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body */}
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(height, 1)}
        fill={isUp ? '#22c55e' : '#ef4444'}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export default function StockChart({ history, ma5, ma25, rsi, chartIndicators, selectedPeriodStartIndex = 0 }: StockChartProps) {
  const [indicatorMode, setIndicatorMode] = useState<IndicatorMode>('ma');

  const chartData: ChartDataPoint[] = useMemo(() => {
    return history.map((item, index) => {
      const isUp = item.close >= item.open;
      return {
        ...item,
        date: formatDate(item.date),
        isUp,
        // Candlestick body (from open to close)
        candleBody: [Math.min(item.open, item.close), Math.max(item.open, item.close)] as [number, number],
        // Candlestick wick (from low to high)
        candleWick: [item.low, item.high] as [number, number],
        // Legacy MA
        ma5: ma5?.[index],
        ma25: ma25?.[index],
        // New chart indicators
        ma20: chartIndicators?.ma?.ma20?.[index],
        ma75: chartIndicators?.ma?.ma75?.[index],
        ma200: chartIndicators?.ma?.ma200?.[index],
        rsi: chartIndicators?.rsi?.[index] ?? rsi?.[index],
        // Bollinger Bands
        bbMiddle: chartIndicators?.bollinger?.middle?.[index],
        bbUpper: chartIndicators?.bollinger?.upper?.[index],
        bbLower: chartIndicators?.bollinger?.lower?.[index],
        // Ichimoku
        tenkan: chartIndicators?.ichimoku?.tenkan?.[index],
        kijun: chartIndicators?.ichimoku?.kijun?.[index],
        senkouA: chartIndicators?.ichimoku?.senkou_a?.[index],
        senkouB: chartIndicators?.ichimoku?.senkou_b?.[index],
        chikou: chartIndicators?.ichimoku?.chikou?.[index],
      };
    });
  }, [history, ma5, ma25, rsi, chartIndicators]);

  const { minPrice, maxPrice } = useMemo(() => {
    const prices = history.flatMap((h) => [h.high, h.low]);
    // Include indicator values in range calculation for better visibility
    if (indicatorMode === 'bollinger' && chartIndicators?.bollinger) {
      const bbValues = [
        ...chartIndicators.bollinger.upper.filter((v): v is number => v !== null),
        ...chartIndicators.bollinger.lower.filter((v): v is number => v !== null),
      ];
      prices.push(...bbValues);
    }
    if (indicatorMode === 'ichimoku' && chartIndicators?.ichimoku) {
      const ichValues = [
        ...chartIndicators.ichimoku.senkou_a.filter((v): v is number => v !== null),
        ...chartIndicators.ichimoku.senkou_b.filter((v): v is number => v !== null),
      ];
      prices.push(...ichValues);
    }
    return {
      minPrice: Math.min(...prices) * 0.98,
      maxPrice: Math.max(...prices) * 1.02,
    };
  }, [history, indicatorMode, chartIndicators]);

  const maxVolume = useMemo(() => {
    return Math.max(...history.map((h) => h.volume));
  }, [history]);

  const hasChartIndicators = chartIndicators !== undefined;

  // 選択期間の開始日を取得
  const selectedPeriodStartDate = useMemo(() => {
    if (selectedPeriodStartIndex > 0 && selectedPeriodStartIndex < chartData.length) {
      return chartData[selectedPeriodStartIndex]?.date;
    }
    return null;
  }, [chartData, selectedPeriodStartIndex]);

  if (history.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-gray-900 rounded-lg">
        <p className="text-gray-500">データがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Indicator Mode Selector */}
      {hasChartIndicators && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setIndicatorMode('ma')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              indicatorMode === 'ma'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            移動平均線
          </button>
          <button
            onClick={() => setIndicatorMode('bollinger')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              indicatorMode === 'bollinger'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ボリンジャーバンド
          </button>
          <button
            onClick={() => setIndicatorMode('ichimoku')}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              indicatorMode === 'ichimoku'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            一目均衡表
          </button>
        </div>
      )}

      {/* Price Chart (Candlestick) */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">株価チャート</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={{ stroke: '#374151' }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={{ stroke: '#374151' }}
              axisLine={{ stroke: '#374151' }}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<PriceTooltip indicatorMode={indicatorMode} />} />

            {/* 選択期間の開始を示す縦点線 */}
            {selectedPeriodStartDate && (
              <ReferenceLine
                x={selectedPeriodStartDate}
                stroke="#6b7280"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}

            {/* Ichimoku Cloud (rendered first so it appears behind) */}
            {indicatorMode === 'ichimoku' && hasChartIndicators && (
              <>
                <Area
                  type="monotone"
                  dataKey="senkouA"
                  stroke="none"
                  fill="#22c55e"
                  fillOpacity={0.2}
                />
                <Area
                  type="monotone"
                  dataKey="senkouB"
                  stroke="none"
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
              </>
            )}

            {/* Bollinger Bands */}
            {indicatorMode === 'bollinger' && hasChartIndicators && (
              <>
                <Line
                  type="monotone"
                  dataKey="bbUpper"
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Upper Band"
                />
                <Line
                  type="monotone"
                  dataKey="bbMiddle"
                  stroke="#9ca3af"
                  strokeWidth={1}
                  dot={false}
                  name="Middle Band"
                />
                <Line
                  type="monotone"
                  dataKey="bbLower"
                  stroke="#22c55e"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Lower Band"
                />
              </>
            )}

            {/* Candlestick - using Bar with custom rendering */}
            <Bar
              dataKey="candleBody"
              barSize={6}
              shape={(props: any) => {
                const { x, y, width, height, payload } = props;
                if (!payload) return null;
                const color = payload.isUp ? '#22c55e' : '#ef4444';
                const centerX = x + width / 2;

                // Calculate wick positions based on price scale
                const priceRange = maxPrice - minPrice;
                const chartHeight = 300 - 20; // Approximate chart area height
                const priceToY = (price: number) => {
                  return ((maxPrice - price) / priceRange) * chartHeight + 10;
                };

                const wickTop = priceToY(payload.high);
                const wickBottom = priceToY(payload.low);

                return (
                  <g>
                    {/* Wick */}
                    <line
                      x1={centerX}
                      y1={wickTop}
                      x2={centerX}
                      y2={wickBottom}
                      stroke={color}
                      strokeWidth={1}
                    />
                    {/* Body */}
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={Math.max(Math.abs(height), 1)}
                      fill={color}
                      stroke={color}
                    />
                  </g>
                );
              }}
            />

            {/* Moving Averages */}
            {indicatorMode === 'ma' && hasChartIndicators && (
              <>
                <Line
                  type="monotone"
                  dataKey="ma20"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA20"
                />
                <Line
                  type="monotone"
                  dataKey="ma75"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA75"
                />
                <Line
                  type="monotone"
                  dataKey="ma200"
                  stroke="#ec4899"
                  strokeWidth={1.5}
                  dot={false}
                  name="MA200"
                />
              </>
            )}

            {/* Legacy MA (fallback) */}
            {indicatorMode === 'ma' && !hasChartIndicators && (
              <>
                {ma5 && (
                  <Line
                    type="monotone"
                    dataKey="ma5"
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    dot={false}
                    name="MA5"
                  />
                )}
                {ma25 && (
                  <Line
                    type="monotone"
                    dataKey="ma25"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    dot={false}
                    name="MA25"
                  />
                )}
              </>
            )}

            {/* Ichimoku Lines */}
            {indicatorMode === 'ichimoku' && hasChartIndicators && (
              <>
                <Line
                  type="monotone"
                  dataKey="tenkan"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  dot={false}
                  name="転換線"
                />
                <Line
                  type="monotone"
                  dataKey="kijun"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  dot={false}
                  name="基準線"
                />
                <Line
                  type="monotone"
                  dataKey="chikou"
                  stroke="#22c55e"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  name="遅行スパン"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500" />
            <span className="text-xs text-gray-400">陽線</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500" />
            <span className="text-xs text-gray-400">陰線</span>
          </div>
          {indicatorMode === 'ma' && hasChartIndicators && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-amber-500" />
                <span className="text-xs text-gray-400">MA20</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-violet-500" />
                <span className="text-xs text-gray-400">MA75</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-pink-500" />
                <span className="text-xs text-gray-400">MA200</span>
              </div>
            </>
          )}
          {indicatorMode === 'bollinger' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500 border-dashed" />
                <span className="text-xs text-gray-400">+2σ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gray-500" />
                <span className="text-xs text-gray-400">SMA20</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500 border-dashed" />
                <span className="text-xs text-gray-400">-2σ</span>
              </div>
            </>
          )}
          {indicatorMode === 'ichimoku' && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500" />
                <span className="text-xs text-gray-400">転換線</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-blue-500" />
                <span className="text-xs text-gray-400">基準線</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-3 bg-green-500/30" />
                <span className="text-xs text-gray-400">雲</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Volume Chart */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">出来高</h3>
        <ResponsiveContainer width="100%" height={100}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={{ stroke: '#374151' }}
              axisLine={{ stroke: '#374151' }}
            />
            <YAxis
              domain={[0, maxVolume]}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              tickLine={{ stroke: '#374151' }}
              axisLine={{ stroke: '#374151' }}
              tickFormatter={(value) => formatVolume(value)}
            />
            <Tooltip content={<VolumeTooltip />} />
            <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.isUp ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* RSI Chart */}
      {chartData.some(d => d.rsi !== null && d.rsi !== undefined) && (
        <div className="bg-gray-900 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">RSI</h3>
          <ResponsiveContainer width="100%" height={100}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={{ stroke: '#374151' }}
                axisLine={{ stroke: '#374151' }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 30, 50, 70, 100]}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={{ stroke: '#374151' }}
                axisLine={{ stroke: '#374151' }}
              />
              <Tooltip content={<RSITooltip />} />
              <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" />
              <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 mt-2">
            <span className="text-xs text-gray-500">
              30以下: 売られ過ぎ | 70以上: 買われ過ぎ
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PriceTooltip({ active, payload, label, indicatorMode }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-700">
      <p className="text-sm font-semibold text-gray-100 mb-2">{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-gray-400">始値:</span>
        <span className="text-gray-100 text-right">{data.open?.toLocaleString()}</span>
        <span className="text-gray-400">高値:</span>
        <span className="text-gray-100 text-right">{data.high?.toLocaleString()}</span>
        <span className="text-gray-400">安値:</span>
        <span className="text-gray-100 text-right">{data.low?.toLocaleString()}</span>
        <span className="text-gray-400">終値:</span>
        <span className={`text-right font-semibold ${data.close >= data.open ? 'text-green-400' : 'text-red-400'}`}>
          {data.close?.toLocaleString()}
        </span>
        {indicatorMode === 'ma' && (
          <>
            {data.ma20 != null && (
              <>
                <span className="text-amber-400">MA20:</span>
                <span className="text-gray-100 text-right">{data.ma20?.toLocaleString()}</span>
              </>
            )}
            {data.ma75 != null && (
              <>
                <span className="text-violet-400">MA75:</span>
                <span className="text-gray-100 text-right">{data.ma75?.toLocaleString()}</span>
              </>
            )}
            {data.ma200 != null && (
              <>
                <span className="text-pink-400">MA200:</span>
                <span className="text-gray-100 text-right">{data.ma200?.toLocaleString()}</span>
              </>
            )}
          </>
        )}
        {indicatorMode === 'bollinger' && (
          <>
            {data.bbUpper != null && (
              <>
                <span className="text-red-400">+2σ:</span>
                <span className="text-gray-100 text-right">{data.bbUpper?.toLocaleString()}</span>
              </>
            )}
            {data.bbMiddle != null && (
              <>
                <span className="text-gray-400">SMA:</span>
                <span className="text-gray-100 text-right">{data.bbMiddle?.toLocaleString()}</span>
              </>
            )}
            {data.bbLower != null && (
              <>
                <span className="text-green-400">-2σ:</span>
                <span className="text-gray-100 text-right">{data.bbLower?.toLocaleString()}</span>
              </>
            )}
          </>
        )}
        {indicatorMode === 'ichimoku' && (
          <>
            {data.tenkan != null && (
              <>
                <span className="text-red-400">転換線:</span>
                <span className="text-gray-100 text-right">{data.tenkan?.toLocaleString()}</span>
              </>
            )}
            {data.kijun != null && (
              <>
                <span className="text-blue-400">基準線:</span>
                <span className="text-gray-100 text-right">{data.kijun?.toLocaleString()}</span>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function VolumeTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-700">
      <p className="text-sm font-semibold text-gray-100">{label}</p>
      <p className="text-xs text-gray-300">
        出来高: {payload[0]?.value?.toLocaleString()}
      </p>
    </div>
  );
}

function RSITooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const rsiValue = payload[0]?.value;
  const rsiColor = rsiValue >= 70 ? 'text-green-400' : rsiValue <= 30 ? 'text-red-400' : 'text-gray-100';

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-700">
      <p className="text-sm font-semibold text-gray-100">{label}</p>
      <p className={`text-xs font-semibold ${rsiColor}`}>
        RSI: {rsiValue?.toFixed(1)}
      </p>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatVolume(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

export function StockChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="skeleton h-4 w-24 mb-4" />
        <div className="skeleton h-72" />
      </div>
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="skeleton h-4 w-16 mb-4" />
        <div className="skeleton h-24" />
      </div>
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="skeleton h-4 w-12 mb-4" />
        <div className="skeleton h-24" />
      </div>
    </div>
  );
}
