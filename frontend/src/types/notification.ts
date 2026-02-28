/** Notification system type definitions. */

export type NotificationType = 'price_alert' | 'system' | 'news' | 'achievement';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  read: boolean;
  dismissed: boolean;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  metadata?: Record<string, string | number>;
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

export interface NotificationCounts {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}

export interface NotificationFilter {
  types: NotificationType[];
  readStatus: 'all' | 'read' | 'unread';
  dateRange?: { from: string; to: string };
}

export const DEFAULT_NOTIFICATION_FILTER: NotificationFilter = {
  types: ['price_alert', 'system', 'news', 'achievement'],
  readStatus: 'all',
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  price_alert: '価格アラート',
  system: 'システム',
  news: 'ニュース',
  achievement: '実績',
};

export const NOTIFICATION_PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: 'text-gray-400',
  medium: 'text-blue-400',
  high: 'text-yellow-400',
  critical: 'text-red-400',
};
