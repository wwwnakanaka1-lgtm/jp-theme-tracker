/**
 * Gamification system for theme tracker engagement.
 * Awards points and badges based on user activity patterns.
 */

export interface UserLevel {
  level: number;
  title: string;
  currentXP: number;
  requiredXP: number;
  progress: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

const LEVEL_TITLES = [
  'Beginner Investor',
  'Market Observer',
  'Theme Analyst',
  'Stock Researcher',
  'Portfolio Builder',
  'Market Strategist',
  'Investment Advisor',
  'Fund Manager',
  'Market Expert',
  'Wall Street Legend',
];

const XP_PER_LEVEL = 100;

export function calculateLevel(totalXP: number): UserLevel {
  const level = Math.min(Math.floor(totalXP / XP_PER_LEVEL) + 1, LEVEL_TITLES.length);
  const currentLevelXP = totalXP % XP_PER_LEVEL;
  const title = LEVEL_TITLES[level - 1] || LEVEL_TITLES[LEVEL_TITLES.length - 1];

  return {
    level,
    title,
    currentXP: currentLevelXP,
    requiredXP: XP_PER_LEVEL,
    progress: currentLevelXP / XP_PER_LEVEL,
  };
}

const BADGES: Badge[] = [
  {
    id: 'first_view',
    name: 'First Look',
    description: 'Viewed your first theme',
    icon: 'eye',
    earned: false,
  },
  {
    id: 'theme_explorer',
    name: 'Theme Explorer',
    description: 'Viewed all 20 themes',
    icon: 'compass',
    earned: false,
  },
  {
    id: 'stock_analyzer',
    name: 'Stock Analyzer',
    description: 'Analyzed 10 individual stocks',
    icon: 'bar-chart',
    earned: false,
  },
  {
    id: 'heatmap_master',
    name: 'Heatmap Master',
    description: 'Used all heatmap views',
    icon: 'grid',
    earned: false,
  },
  {
    id: 'daily_tracker',
    name: 'Daily Tracker',
    description: 'Checked themes 7 days in a row',
    icon: 'calendar',
    earned: false,
  },
];

export function getAvailableBadges(): Badge[] {
  return [...BADGES];
}

export function checkBadgeEligibility(
  badgeId: string,
  stats: Record<string, number>,
): boolean {
  switch (badgeId) {
    case 'first_view':
      return (stats.themesViewed || 0) >= 1;
    case 'theme_explorer':
      return (stats.themesViewed || 0) >= 20;
    case 'stock_analyzer':
      return (stats.stocksAnalyzed || 0) >= 10;
    case 'heatmap_master':
      return (stats.heatmapViews || 0) >= 2;
    case 'daily_tracker':
      return (stats.consecutiveDays || 0) >= 7;
    default:
      return false;
  }
}

export function calculateXPReward(action: string): number {
  const rewards: Record<string, number> = {
    view_theme: 5,
    view_stock: 10,
    view_heatmap: 8,
    compare_periods: 15,
    daily_login: 20,
    badge_earned: 50,
  };

  return rewards[action] || 0;
}
