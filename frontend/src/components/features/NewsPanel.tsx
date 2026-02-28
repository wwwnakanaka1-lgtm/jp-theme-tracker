'use client';

import { useState } from 'react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  category?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface NewsPanelProps {
  news: NewsItem[];
  title?: string;
  maxItems?: number;
  className?: string;
}

const sentimentColors: Record<string, string> = {
  positive: 'bg-green-900/40 text-green-400',
  negative: 'bg-red-900/40 text-red-400',
  neutral: 'bg-gray-700 text-gray-400',
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMin = Math.floor((now - then) / 60000);
  if (diffMin < 1) return '今';
  if (diffMin < 60) return `${diffMin}分前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}時間前`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}日前`;
}

export default function NewsPanel({
  news,
  title = 'マーケットニュース',
  maxItems = 8,
  className = '',
}: NewsPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const displayNews = showAll ? news : news.slice(0, maxItems);

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${className}`}>
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">{title}</h3>
      </div>

      {displayNews.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 text-sm">ニュースはありません</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-700/50">
          {displayNews.map((item) => (
            <li key={item.id} className="px-4 py-3 hover:bg-gray-750 transition-colors">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                <p className="text-sm text-white leading-snug hover:text-blue-400 transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-gray-500">{item.source}</span>
                  <span className="text-xs text-gray-600">|</span>
                  <span className="text-xs text-gray-500">{timeAgo(item.publishedAt)}</span>
                  {item.sentiment && (
                    <span className={`text-xs px-1.5 py-0.5 rounded ${sentimentColors[item.sentiment]}`}>
                      {item.sentiment === 'positive' ? '好材料' : item.sentiment === 'negative' ? '悪材料' : '中立'}
                    </span>
                  )}
                  {item.category && (
                    <span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">{item.category}</span>
                  )}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {news.length > maxItems && (
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showAll ? '折りたたむ' : `すべて表示 (${news.length}件)`}
          </button>
        </div>
      )}
    </div>
  );
}
