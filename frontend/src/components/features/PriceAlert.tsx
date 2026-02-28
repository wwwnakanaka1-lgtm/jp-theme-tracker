'use client';

import { useState } from 'react';

interface PriceAlertRule {
  id: string;
  stockCode: string;
  stockName: string;
  condition: 'above' | 'below';
  targetPrice: number;
  enabled: boolean;
}

interface PriceAlertProps {
  alerts: PriceAlertRule[];
  onAdd: (alert: Omit<PriceAlertRule, 'id' | 'enabled'>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export default function PriceAlert({
  alerts,
  onAdd,
  onToggle,
  onDelete,
  className = '',
}: PriceAlertProps) {
  const [showForm, setShowForm] = useState(false);
  const [stockCode, setStockCode] = useState('');
  const [stockName, setStockName] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetPrice, setTargetPrice] = useState('');

  const handleSubmit = () => {
    if (!stockCode || !targetPrice) return;
    onAdd({
      stockCode,
      stockName: stockName || stockCode,
      condition,
      targetPrice: parseFloat(targetPrice),
    });
    setStockCode('');
    setStockName('');
    setTargetPrice('');
    setShowForm(false);
  };

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">価格アラート</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showForm ? 'キャンセル' : '+ 追加'}
        </button>
      </div>

      {showForm && (
        <div className="mb-4 p-3 bg-gray-900 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input value={stockCode} onChange={(e) => setStockCode(e.target.value)} placeholder="銘柄コード" className="bg-gray-700 text-white text-sm px-3 py-2 rounded border border-gray-600" />
            <input value={stockName} onChange={(e) => setStockName(e.target.value)} placeholder="銘柄名" className="bg-gray-700 text-white text-sm px-3 py-2 rounded border border-gray-600" />
          </div>
          <div className="flex gap-2">
            <select value={condition} onChange={(e) => setCondition(e.target.value as 'above' | 'below')} className="bg-gray-700 text-white text-sm px-3 py-2 rounded border border-gray-600">
              <option value="above">以上</option>
              <option value="below">以下</option>
            </select>
            <input value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} type="number" placeholder="目標価格" className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded border border-gray-600" />
          </div>
          <button onClick={handleSubmit} className="w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
            アラート設定
          </button>
        </div>
      )}

      {alerts.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">アラートは設定されていません</p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg border ${alert.enabled ? 'border-gray-700 bg-gray-900' : 'border-gray-800 bg-gray-900/50 opacity-60'}`}>
              <div>
                <p className="text-white text-sm font-medium">{alert.stockName} <span className="text-gray-500">({alert.stockCode})</span></p>
                <p className="text-xs text-gray-400">¥{alert.targetPrice.toLocaleString()} {alert.condition === 'above' ? '以上' : '以下'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onToggle(alert.id)} className={`w-8 h-4 rounded-full ${alert.enabled ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <div className={`w-3.5 h-3.5 bg-white rounded-full transform transition-transform ${alert.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <button onClick={() => onDelete(alert.id)} className="text-gray-500 hover:text-red-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
