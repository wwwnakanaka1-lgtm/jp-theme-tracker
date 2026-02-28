'use client';

import { useState } from 'react';

type ExportFormat = 'csv' | 'json';
type ExportTarget = 'themes' | 'stocks' | 'watchlist';

interface ExportOption {
  id: ExportTarget;
  label: string;
  description: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  { id: 'themes', label: 'テーマ一覧', description: '全テーマの騰落率・構成銘柄数' },
  { id: 'stocks', label: '銘柄データ', description: 'テーマ別の銘柄情報' },
  { id: 'watchlist', label: 'ウォッチリスト', description: '登録済みのウォッチリスト' },
];

const FORMAT_OPTIONS: { id: ExportFormat; label: string }[] = [
  { id: 'csv', label: 'CSV' },
  { id: 'json', label: 'JSON' },
];

export default function ExportPage() {
  const [target, setTarget] = useState<ExportTarget>('themes');
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [period, setPeriod] = useState('1mo');
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams({ format, type: target, period });
      const res = await fetch(`${apiBase}/api/export?${params}`);

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jp-tracker-${target}-${period}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExport(new Date().toLocaleString('ja-JP'));
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">データエクスポート</h1>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 space-y-6">
        <div>
          <p className="text-sm font-medium text-gray-300 mb-3">エクスポート対象</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {EXPORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTarget(opt.id)}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  target === opt.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                }`}
              >
                <p className="text-sm font-medium text-white">{opt.label}</p>
                <p className="text-xs text-gray-400 mt-1">{opt.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-300 mb-3">ファイル形式</p>
          <div className="flex gap-3">
            {FORMAT_OPTIONS.map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setFormat(fmt.id)}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  format === fmt.id
                    ? 'border-blue-500 bg-blue-900/20 text-white'
                    : 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-300 mb-3">期間</p>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 text-sm"
          >
            <option value="1d">1日</option>
            <option value="5d">5日</option>
            <option value="1mo">1ヶ月</option>
            <option value="3mo">3ヶ月</option>
            <option value="1y">1年</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${
            isExporting ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isExporting ? 'エクスポート中...' : 'エクスポート実行'}
        </button>

        {lastExport && (
          <p className="text-xs text-gray-500 text-center">
            最終エクスポート: {lastExport}
          </p>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-300 mb-2">エクスポートについて</h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>CSV形式はExcelやGoogleスプレッドシートで開けます</li>
          <li>JSON形式はプログラムでの処理に適しています</li>
          <li>データは選択した期間の最新情報が含まれます</li>
        </ul>
      </div>
    </div>
  );
}
