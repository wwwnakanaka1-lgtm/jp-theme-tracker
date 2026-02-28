/** Chart configuration types for the various chart components. */

export interface ChartDimensions {
  width: number;
  height: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ChartColorScheme {
  primary: string;
  secondary: string;
  positive: string;
  negative: string;
  neutral: string;
  grid: string;
  text: string;
  background: string;
}

export const DEFAULT_CHART_COLORS: ChartColorScheme = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  positive: '#22c55e',
  negative: '#ef4444',
  neutral: '#6b7280',
  grid: '#374151',
  text: '#9ca3af',
  background: '#1f2937',
};

export interface CandlestickConfig {
  upColor: string;
  downColor: string;
  wickWidth: number;
  bodyWidth: number;
  showVolume: boolean;
  volumeHeight: number;
}

export const DEFAULT_CANDLESTICK_CONFIG: CandlestickConfig = {
  upColor: '#22c55e',
  downColor: '#ef4444',
  wickWidth: 1,
  bodyWidth: 6,
  showVolume: true,
  volumeHeight: 60,
};

export interface AreaChartConfig {
  lineColor: string;
  fillOpacity: number;
  lineWidth: number;
  showDots: boolean;
  dotRadius: number;
  showGrid: boolean;
  gridCount: number;
  animate: boolean;
}

export interface BarChartConfig {
  barColor: string;
  negativeColor: string;
  barRadius: number;
  gap: number;
  showLabels: boolean;
  showValues: boolean;
  horizontal: boolean;
}

export interface RadarChartConfig {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  levels: number;
  showLabels: boolean;
  showValues: boolean;
}

export interface ChartTooltip {
  visible: boolean;
  x: number;
  y: number;
  content: {
    label: string;
    value: string;
    color?: string;
  }[];
}

export interface ChartLegendItem {
  label: string;
  color: string;
  visible: boolean;
}

export type ChartPeriod = '1d' | '5d' | '10d' | '1mo' | '3mo' | '6mo' | '1y' | '3y' | '5y';

export interface TimeSeriesPoint {
  timestamp: number;
  date: string;
  value: number;
}
