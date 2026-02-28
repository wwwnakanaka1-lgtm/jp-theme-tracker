// req:REQ-013
'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, ChevronRight, HelpCircle } from 'lucide-react';
import type { Stock } from '@/lib/api';
import { getMarketCapColor } from '@/lib/api';

interface StockTableProps {
  stocks: Stock[];
  period: string;
  showDescription?: boolean;
}

// 指標の説明
const METRIC_TOOLTIPS = {
  beta: {
    title: 'Beta（ベータ）',
    description: 'テーマ全体に対する感応度。テーマが1%動くと、この銘柄がどれだけ動くかを示す。',
    examples: [
      { value: '1.5', meaning: 'テーマ+1% → 銘柄+1.5%（高リスク・高リターン）' },
      { value: '1.0', meaning: 'テーマと同じ動き' },
      { value: '0.5', meaning: 'テーマ+1% → 銘柄+0.5%（安定的）' },
    ],
  },
  alpha: {
    title: 'Alpha（アルファ）',
    description: 'テーマ平均を上回る超過リターン（日次）。銘柄固有の強さを示す。',
    examples: [
      { value: '+0.1%', meaning: '毎日テーマより0.1%高い（優良銘柄）' },
      { value: '0%', meaning: 'テーマ平均並み' },
      { value: '-0.1%', meaning: '毎日テーマより0.1%低い（出遅れ）' },
    ],
  },
  r_squared: {
    title: 'R²（決定係数）',
    description: 'テーマとの連動性。1に近いほどテーマの動きで銘柄の動きを説明できる。',
    examples: [
      { value: '0.9', meaning: '90%テーマと連動（代表銘柄）' },
      { value: '0.5', meaning: '50%連動（独自要因も大きい）' },
      { value: '0.1', meaning: 'ほぼ独立した動き' },
    ],
  },
};

function Tooltip({ metric }: { metric: keyof typeof METRIC_TOOLTIPS }) {
  const info = METRIC_TOOLTIPS[metric];
  return (
    <div className="group relative inline-block ml-1">
      <HelpCircle className="w-3.5 h-3.5 text-gray-500 cursor-help inline" />
      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-700 text-white text-xs rounded-lg shadow-lg">
        <div className="font-bold mb-1">{info.title}</div>
        <div className="text-gray-300 mb-2">{info.description}</div>
        <div className="space-y-1.5 border-t border-gray-600 pt-2">
          <div className="text-gray-400 text-[10px] uppercase tracking-wide">例</div>
          {info.examples.map((ex, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="font-mono text-blue-300 whitespace-nowrap min-w-[40px]">{ex.value}</span>
              <span className="text-gray-400">{ex.meaning}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-gray-700" />
      </div>
    </div>
  );
}

export default function StockTable({ stocks, period, showDescription = false }: StockTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
              コード
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
              銘柄名
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
              騰落率
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
              <span className="inline-flex items-center justify-end">
                Beta
                <Tooltip metric="beta" />
              </span>
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
              <span className="inline-flex items-center justify-end">
                Alpha
                <Tooltip metric="alpha" />
              </span>
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
              <span className="inline-flex items-center justify-end">
                R²
                <Tooltip metric="r_squared" />
              </span>
            </th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <StockRow key={stock.code} stock={stock} period={period} showDescription={showDescription} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarketCapBadge({ category }: { category?: Stock['market_cap_category'] }) {
  if (!category || category.id === 'unknown') return null;

  const colors = getMarketCapColor(category.id);
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
      {category.label}
    </span>
  );
}

function StockRow({ stock, period, showDescription }: { stock: Stock; period: string; showDescription: boolean }) {
  const changePercent = stock.change_percent ?? 0;
  const isPositive = changePercent >= 0;

  return (
    <Link href={`/stock/${stock.code}?period=${period}`} className="contents">
      <tr className="border-b border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors group">
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-300">{stock.code}</span>
            <MarketCapBadge category={stock.market_cap_category} />
          </div>
        </td>
        <td className="py-3 px-4">
          <div>
            <span className="text-sm font-medium text-gray-200 group-hover:text-blue-400 transition-colors">
              {stock.name}
            </span>
            {showDescription && stock.description && (
              <p className="text-xs text-gray-500 mt-1 max-w-md">
                {stock.description}
              </p>
            )}
          </div>
        </td>
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span
              className={`font-semibold ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%
            </span>
          </div>
        </td>
        <td className="py-3 px-4 text-right">
          <span className="text-sm text-gray-300">
            {stock.beta != null ? stock.beta.toFixed(2) : '-'}
          </span>
        </td>
        <td className="py-3 px-4 text-right">
          <span
            className={`text-sm ${
              stock.alpha != null
                ? stock.alpha >= 0
                  ? 'text-green-400'
                  : 'text-red-400'
                : 'text-gray-300'
            }`}
          >
            {stock.alpha != null
              ? `${stock.alpha >= 0 ? '+' : ''}${stock.alpha.toFixed(2)}%`
              : '-'}
          </span>
        </td>
        <td className="py-3 px-4 text-right">
          <span className="text-sm text-gray-300">
            {stock.r_squared != null ? stock.r_squared.toFixed(2) : '-'}
          </span>
        </td>
        <td className="py-3 px-4">
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
        </td>
      </tr>
    </Link>
  );
}

export function StockTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
              コード
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">
              銘柄名
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
              騰落率
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
              Beta
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
              Alpha
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
              R²
            </th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-gray-700">
              <td className="py-3 px-4">
                <div className="skeleton h-4 w-12" />
              </td>
              <td className="py-3 px-4">
                <div className="skeleton h-4 w-24" />
              </td>
              <td className="py-3 px-4">
                <div className="skeleton h-4 w-16 ml-auto" />
              </td>
              <td className="py-3 px-4">
                <div className="skeleton h-4 w-12 ml-auto" />
              </td>
              <td className="py-3 px-4">
                <div className="skeleton h-4 w-12 ml-auto" />
              </td>
              <td className="py-3 px-4">
                <div className="skeleton h-4 w-12 ml-auto" />
              </td>
              <td className="py-3 px-4">
                <div className="skeleton h-4 w-4" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
