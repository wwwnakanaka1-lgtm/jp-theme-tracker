'use client';

import { useState, useEffect } from 'react';
import { calculateLevel, getAvailableBadges, type Badge } from '@/lib/gamification';

interface UserProfile {
  displayName: string;
  email: string;
  memberSince: string;
  totalXP: number;
  themesViewed: number;
  stocksAnalyzed: number;
}

const PROFILE_KEY = 'jp-tracker-profile';

const DEFAULT_PROFILE: UserProfile = {
  displayName: 'ゲスト',
  email: '',
  memberSince: new Date().toISOString(),
  totalXP: 0,
  themesViewed: 0,
  stocksAnalyzed: 0,
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      try {
        setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(stored) });
      } catch { /* use defaults */ }
    }
  }, []);

  const level = calculateLevel(profile.totalXP);
  const badges = getAvailableBadges();

  const handleSaveName = () => {
    if (!editName.trim()) return;
    const updated = { ...profile, displayName: editName.trim() };
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">プロフィール</h1>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
            {profile.displayName.charAt(0)}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 text-sm" autoFocus />
                <button onClick={handleSaveName} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded">保存</button>
                <button onClick={() => setEditing(false)} className="px-3 py-1.5 text-gray-400 text-sm">取消</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{profile.displayName}</h2>
                <button onClick={() => { setEditName(profile.displayName); setEditing(true); }} className="text-gray-500 hover:text-gray-300">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>
            )}
            <p className="text-sm text-gray-400">Lv.{level.level} {level.title}</p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">経験値</span>
            <span className="text-gray-300">{level.currentXP} / {level.requiredXP} XP</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${level.progress * 100}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{profile.themesViewed}</p>
            <p className="text-xs text-gray-400">テーマ閲覧数</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{profile.stocksAnalyzed}</p>
            <p className="text-xs text-gray-400">銘柄分析数</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-white">{profile.totalXP}</p>
            <p className="text-xs text-gray-400">合計XP</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">バッジコレクション</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {badges.map((badge: Badge) => (
            <div key={badge.id} className={`p-3 rounded-lg border text-center ${badge.earned ? 'border-yellow-600 bg-yellow-900/20' : 'border-gray-700 bg-gray-900 opacity-50'}`}>
              <p className="text-sm font-medium text-white">{badge.name}</p>
              <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
