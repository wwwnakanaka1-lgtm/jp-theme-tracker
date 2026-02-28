/**
 * Number, date, and currency formatting utilities for the JP market context.
 */

/** Format a number as Japanese Yen with no decimal places. */
export function formatYen(value: number): string {
  return `¥${value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
}

/** Format a number with comma separators. */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('ja-JP', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a percentage with sign prefix (e.g., "+1.23%" or "-0.45%"). */
export function formatPercent(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/** Format large numbers in Japanese units (万, 億, 兆). */
export function formatJPUnit(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 1_000_000_000_000) {
    return `${sign}${(abs / 1_000_000_000_000).toFixed(1)}兆`;
  }
  if (abs >= 100_000_000) {
    return `${sign}${(abs / 100_000_000).toFixed(1)}億`;
  }
  if (abs >= 10_000) {
    return `${sign}${(abs / 10_000).toFixed(1)}万`;
  }
  return `${sign}${abs.toLocaleString()}`;
}

/** Format a market cap value as Yen with Japanese units. */
export function formatMarketCap(value: number): string {
  return `¥${formatJPUnit(value)}`;
}

/** Format a volume number (e.g., 1,234,567 -> "1.23M shares"). */
export function formatVolume(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M株`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K株`;
  }
  return `${value}株`;
}

/** Format ISO date string to Japanese locale date. */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ja-JP', options ?? { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Format ISO date string to time only. */
export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

/** Relative time (e.g., "3分前", "2時間前", "1日前"). */
export function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return '今';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}分前`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}時間前`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 86400)}日前`;
  return formatDate(dateStr);
}

/** Format a stock code to standard 4-digit display (e.g., "7203"). */
export function formatStockCode(code: string): string {
  return code.replace(/\.T$/, '');
}
