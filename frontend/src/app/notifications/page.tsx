'use client';

import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'price_alert' | 'system' | 'news' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const NOTIFICATIONS_KEY = 'jp-tracker-notifications';

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'system',
    title: 'データ更新完了',
    message: '全テーマの株価データが最新に更新されました。',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'achievement',
    title: 'バッジ獲得！',
    message: '「First Look」バッジを獲得しました。',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const typeIcons: Record<string, { icon: string; color: string }> = {
  price_alert: { icon: '📈', color: 'bg-yellow-900/40 border-yellow-700' },
  system: { icon: '⚙️', color: 'bg-blue-900/40 border-blue-700' },
  news: { icon: '📰', color: 'bg-purple-900/40 border-purple-700' },
  achievement: { icon: '🏆', color: 'bg-green-900/40 border-green-700' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        setNotifications(SAMPLE_NOTIFICATIONS);
      }
    } else {
      setNotifications(SAMPLE_NOTIFICATIONS);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  };

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `${min}分前`;
    const hours = Math.floor(min / 60);
    if (hours < 24) return `${hours}時間前`;
    return `${Math.floor(hours / 24)}日前`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">通知</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            すべて既読にする
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <p className="text-gray-500">通知はありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const { icon, color } = typeIcons[notif.type] || typeIcons.system;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${color} ${!notif.read ? 'opacity-100' : 'opacity-60'}`}
              >
                <span className="text-lg flex-shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{notif.title}</p>
                  <p className="text-sm text-gray-300 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTime(notif.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notif.read && (
                    <button onClick={() => markAsRead(notif.id)} className="text-xs text-blue-400 hover:text-blue-300">
                      既読
                    </button>
                  )}
                  <button onClick={() => deleteNotification(notif.id)} className="text-gray-500 hover:text-red-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
