// req:REQ-008
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  createChart,
  ColorType,
  IChartApi,
  CandlestickData,
  HistogramData,
  LineData,
  Time,
  LineSeries,
  CandlestickSeries,
  HistogramSeries,
} from 'lightweight-charts';
import type { PriceData, ChartIndicators } from '@/lib/api';

type IndicatorMode = 'ma' | 'bollinger' | 'ichimoku';

interface TradingChartProps {
  history: PriceData[];
  chartIndicators?: ChartIndicators;
  selectedPeriodStartIndex?: number;
  height?: number;
  period?: string;
}

export default function TradingChart({
  history,
  chartIndicators,
  // selectedPeriodStartIndex は v5 API で未対応のため未使用
  height = 400,
  period = '1mo',
}: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [indicatorMode, setIndicatorMode] = useState<IndicatorMode>('ma');

  // Convert history data to lightweight-charts format
  const { candleData, volumeData } = useMemo(() => {
    const candles: CandlestickData<Time>[] = [];
    const volumes: HistogramData<Time>[] = [];

    history.forEach((item) => {
      const time = item.date as Time;
      const isUp = item.close >= item.open;

      candles.push({
        time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      });

      volumes.push({
        time,
        value: item.volume,
        color: isUp ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)',
      });
    });

    return { candleData: candles, volumeData: volumes };
  }, [history]);

  // Prepare indicator data
  const indicatorData = useMemo(() => {
    if (!chartIndicators) return null;

    const createLineData = (values: (number | null)[]): LineData<Time>[] => {
      return values
        .map((value, index) => ({
          time: history[index]?.date as Time,
          value: value ?? undefined,
        }))
        .filter((d): d is LineData<Time> => d.value !== undefined);
    };

    return {
      ma20: createLineData(chartIndicators.ma.ma20),
      ma75: createLineData(chartIndicators.ma.ma75),
      ma200: createLineData(chartIndicators.ma.ma200),
      bbUpper: createLineData(chartIndicators.bollinger.upper),
      bbMiddle: createLineData(chartIndicators.bollinger.middle),
      bbLower: createLineData(chartIndicators.bollinger.lower),
      tenkan: createLineData(chartIndicators.ichimoku.tenkan),
      kijun: createLineData(chartIndicators.ichimoku.kijun),
      senkouA: createLineData(chartIndicators.ichimoku.senkou_a),
      senkouB: createLineData(chartIndicators.ichimoku.senkou_b),
      chikou: createLineData(chartIndicators.ichimoku.chikou),
      rsi: createLineData(chartIndicators.rsi),
    };
  }, [chartIndicators, history]);

  useEffect(() => {
    if (!chartContainerRef.current || candleData.length === 0) return;

    // Clear existing chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#111827' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      crosshair: {
        mode: 0,
        vertLine: {
          color: '#6b7280',
          width: 1,
          style: 2,
          labelBackgroundColor: '#374151',
        },
        horzLine: {
          color: '#6b7280',
          width: 1,
          style: 2,
          labelBackgroundColor: '#374151',
        },
      },
      timeScale: {
        borderColor: '#374151',
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: (time: Time) => {
          const date = new Date(time as string);
          const isLongPeriod = ['3y', '5y'].includes(period);
          const isMediumPeriod = ['1y', '6mo'].includes(period);

          if (isLongPeriod) {
            // 3Y/5Y: 年月のみ表示（例: 2024/01）
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${year}/${month}`;
          } else if (isMediumPeriod) {
            // 1Y/6M: 月/日 形式（例: 01/15）
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}/${day}`;
          } else {
            // 短期間: 月/日 形式（例: 01/15）
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}/${day}`;
          }
        },
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
    });

    // Candlestick series (v5 API)
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candlestickSeries.setData(candleData);

    // Volume series (v5 API)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
    });
    volumeSeries.setData(volumeData);

    // Add indicator lines based on mode
    if (indicatorData) {
      if (indicatorMode === 'ma') {
        // MA20
        if (indicatorData.ma20.length > 0) {
          const ma20Series = chart.addSeries(LineSeries, {
            color: '#f59e0b',
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          ma20Series.setData(indicatorData.ma20);
        }
        // MA75
        if (indicatorData.ma75.length > 0) {
          const ma75Series = chart.addSeries(LineSeries, {
            color: '#8b5cf6',
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          ma75Series.setData(indicatorData.ma75);
        }
        // MA200
        if (indicatorData.ma200.length > 0) {
          const ma200Series = chart.addSeries(LineSeries, {
            color: '#ec4899',
            lineWidth: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          ma200Series.setData(indicatorData.ma200);
        }
      } else if (indicatorMode === 'bollinger') {
        // Bollinger Bands
        if (indicatorData.bbUpper.length > 0) {
          const bbUpperSeries = chart.addSeries(LineSeries, {
            color: '#ef4444',
            lineWidth: 1,
            lineStyle: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          bbUpperSeries.setData(indicatorData.bbUpper);
        }
        if (indicatorData.bbMiddle.length > 0) {
          const bbMiddleSeries = chart.addSeries(LineSeries, {
            color: '#9ca3af',
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          bbMiddleSeries.setData(indicatorData.bbMiddle);
        }
        if (indicatorData.bbLower.length > 0) {
          const bbLowerSeries = chart.addSeries(LineSeries, {
            color: '#22c55e',
            lineWidth: 1,
            lineStyle: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          bbLowerSeries.setData(indicatorData.bbLower);
        }
      } else if (indicatorMode === 'ichimoku') {
        // Ichimoku
        if (indicatorData.tenkan.length > 0) {
          const tenkanSeries = chart.addSeries(LineSeries, {
            color: '#ef4444',
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          tenkanSeries.setData(indicatorData.tenkan);
        }
        if (indicatorData.kijun.length > 0) {
          const kijunSeries = chart.addSeries(LineSeries, {
            color: '#3b82f6',
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          kijunSeries.setData(indicatorData.kijun);
        }
        if (indicatorData.chikou.length > 0) {
          const chikouSeries = chart.addSeries(LineSeries, {
            color: '#22c55e',
            lineWidth: 1,
            lineStyle: 2,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          chikouSeries.setData(indicatorData.chikou);
        }
        // Kumo (cloud)
        if (indicatorData.senkouA.length > 0) {
          const senkouASeries = chart.addSeries(LineSeries, {
            color: 'rgba(34, 197, 94, 0.3)',
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          senkouASeries.setData(indicatorData.senkouA);
        }
        if (indicatorData.senkouB.length > 0) {
          const senkouBSeries = chart.addSeries(LineSeries, {
            color: 'rgba(239, 68, 68, 0.3)',
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
          });
          senkouBSeries.setData(indicatorData.senkouB);
        }
      }
    }

    chart.timeScale().fitContent();
    chartRef.current = chart;

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [candleData, volumeData, indicatorData, indicatorMode, height, period]);

  const hasChartIndicators = chartIndicators !== undefined;

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
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => setIndicatorMode('ma')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              indicatorMode === 'ma'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            移動平均
          </button>
          <button
            onClick={() => setIndicatorMode('bollinger')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              indicatorMode === 'bollinger'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ボリンジャー
          </button>
          <button
            onClick={() => setIndicatorMode('ichimoku')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              indicatorMode === 'ichimoku'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            一目均衡表
          </button>
        </div>
      )}

      {/* Main Chart */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div ref={chartContainerRef} />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap px-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500" />
          <span className="text-gray-400">陽線</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500" />
          <span className="text-gray-400">陰線</span>
        </div>
        {indicatorMode === 'ma' && hasChartIndicators && (
          <>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-amber-500" />
              <span className="text-gray-400">MA20</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-violet-500" />
              <span className="text-gray-400">MA75</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-pink-500" />
              <span className="text-gray-400">MA200</span>
            </div>
          </>
        )}
        {indicatorMode === 'bollinger' && (
          <>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-red-500" />
              <span className="text-gray-400">+2σ</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-gray-500" />
              <span className="text-gray-400">SMA</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500" />
              <span className="text-gray-400">-2σ</span>
            </div>
          </>
        )}
        {indicatorMode === 'ichimoku' && (
          <>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-red-500" />
              <span className="text-gray-400">転換</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-500" />
              <span className="text-gray-400">基準</span>
            </div>
          </>
        )}
      </div>

      {/* RSI Chart (if available) */}
      {indicatorData && indicatorData.rsi.length > 0 && (
        <RSIChart data={indicatorData.rsi} />
      )}
    </div>
  );
}

// Separate RSI Chart component
function RSIChart({ data }: { data: LineData<Time>[] }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#111827' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#1f2937' },
        horzLines: { color: '#1f2937' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 100,
      timeScale: {
        borderColor: '#374151',
        visible: false,
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
    });

    // v5 API
    const rsiSeries = chart.addSeries(LineSeries, {
      color: '#6366f1',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    rsiSeries.setData(data);

    // RSI reference lines at 30 and 70
    rsiSeries.createPriceLine({
      price: 70,
      color: '#22c55e',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
    });
    rsiSeries.createPriceLine({
      price: 30,
      color: '#ef4444',
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: true,
    });

    chart.priceScale('right').applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.1,
      },
    });

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div className="bg-gray-900 rounded-lg p-3">
      <h3 className="text-xs font-semibold text-gray-400 mb-2">RSI</h3>
      <div ref={chartContainerRef} />
      <div className="flex items-center justify-center mt-1">
        <span className="text-[10px] text-gray-500">
          30以下: 売られ過ぎ | 70以上: 買われ過ぎ
        </span>
      </div>
    </div>
  );
}

export function TradingChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="skeleton h-[400px]" />
      </div>
      <div className="bg-gray-900 rounded-lg p-4">
        <div className="skeleton h-4 w-12 mb-4" />
        <div className="skeleton h-[100px]" />
      </div>
    </div>
  );
}
