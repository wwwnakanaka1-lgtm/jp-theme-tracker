'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchNikkei225, type Nikkei225Data } from '@/lib/api';
import Sparkline, { SparklineSkeleton } from './Sparkline';

interface Nikkei225CardProps {
  period: string;
}

export default function Nikkei225Card({ period }: Nikkei225CardProps) {
  const [data, setData] = useState<Nikkei225Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchNikkei225(period);
        setData(result);
      } catch (err) {
        setError('日経225の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [period]);

  if (loading) {
    return <Nikkei225CardSkeleton />;
  }

  if (error || !data) {
    return null;
  }

  const changePercent = data.change_percent ?? 0;
  const isPositive = changePercent >= 0;

  return (
    <div className="theme-row">
      {/* N225 Badge */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
        {isPositive ? (
          <TrendingUp className="w-5 h-5 text-white" />
        ) : (
          <TrendingDown className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Index Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-100">
            日経225
          </h3>
        </div>
        {data.price && (
          <p className="text-sm text-gray-400 mt-0.5">
            {data.price.toLocaleString('ja-JP', { maximumFractionDigits: 2 })} 円
          </p>
        )}
      </div>

      {/* Sparkline */}
      <div className="hidden md:block flex-shrink-0">
        <Sparkline
          data={data.sparkline || { data: [], period_start_index: 0 }}
          isPositive={isPositive}
          width={100}
          height={36}
        />
      </div>

      {/* Change Percent */}
      <div className="text-right min-w-[80px] flex-shrink-0">
        <div
          className={`text-lg font-bold ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isPositive ? '+' : ''}
          {changePercent.toFixed(1)}%
        </div>
        {data.change_percent_1d != null && (
          <div className="text-xs text-gray-400">
            1日{' '}
            <span className={data.change_percent_1d >= 0 ? 'text-green-400' : 'text-red-400'}>
              {data.change_percent_1d >= 0 ? '+' : ''}{data.change_percent_1d.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Spacer for alignment with ThemeCard's arrow */}
      <div className="w-5 flex-shrink-0" />
    </div>
  );
}

export function Nikkei225CardSkeleton() {
  return (
    <div className="theme-row">
      <div className="skeleton h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="skeleton h-5 w-20 mb-1" />
        <div className="skeleton h-4 w-24" />
      </div>
      <div className="hidden md:block">
        <SparklineSkeleton width={100} height={36} />
      </div>
      <div className="skeleton h-6 w-16" />
      <div className="w-5 flex-shrink-0" />
    </div>
  );
}
