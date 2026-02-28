'use client';

import { useState, useEffect } from 'react';

interface Settings {
  autoRefresh: boolean;
  refreshInterval: number;
  defaultPeriod: string;
  darkMode: boolean;
}

const STORAGE_KEY = 'jp-tracker-settings';

const DEFAULT_SETTINGS: Settings = {
  autoRefresh: true,
  refreshInterval: 300,
  defaultPeriod: '1d',
  darkMode: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      } catch {
        // use defaults
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">設定</h1>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white font-medium">自動更新</p>
            <p className="text-gray-400 text-sm">データを定期的に自動更新します</p>
          </div>
          <button
            onClick={() => setSettings((s) => ({ ...s, autoRefresh: !s.autoRefresh }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                settings.autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="text-white font-medium block mb-2">更新間隔</label>
          <select
            value={settings.refreshInterval}
            onChange={(e) => setSettings((s) => ({ ...s, refreshInterval: Number(e.target.value) }))}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
          >
            <option value={60}>1分</option>
            <option value={300}>5分</option>
            <option value={600}>10分</option>
            <option value={1800}>30分</option>
          </select>
        </div>

        <div>
          <label className="text-white font-medium block mb-2">デフォルト期間</label>
          <select
            value={settings.defaultPeriod}
            onChange={(e) => setSettings((s) => ({ ...s, defaultPeriod: e.target.value }))}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600"
          >
            <option value="1d">1日</option>
            <option value="5d">5日</option>
            <option value="1mo">1ヶ月</option>
            <option value="3mo">3ヶ月</option>
            <option value="1y">1年</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {saved ? '保存しました' : '設定を保存'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-lg font-semibold text-white mb-4">アプリ情報</h2>
        <div className="space-y-2 text-sm">
          <p className="text-gray-400">バージョン: 2.0.0</p>
          <p className="text-gray-400">テーマ数: 20</p>
          <p className="text-gray-400">トラッキング銘柄: 200</p>
        </div>
      </div>
    </div>
  );
}
