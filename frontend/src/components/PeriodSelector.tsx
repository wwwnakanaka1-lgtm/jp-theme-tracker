'use client';

import { PERIODS, type PeriodValue } from '@/lib/api';

interface PeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: PeriodValue) => void;
}

export default function PeriodSelector({
  selectedPeriod,
  onPeriodChange,
}: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {PERIODS.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            selectedPeriod === period.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}
