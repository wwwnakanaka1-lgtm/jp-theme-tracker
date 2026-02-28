'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface FavoriteStock {
  code: string;
  name: string;
  addedAt: string;
}

const STORAGE_KEY = 'jp-tracker-favorites';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteStock[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  const removeFavorite = (code: string) => {
    const updated = favorites.filter((f) => f.code !== code);
    setFavorites(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">お気に入り銘柄</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">お気に入り銘柄がまだありません</p>
          <p className="text-gray-600 text-sm mt-2">銘柄詳細ページからお気に入りに追加できます</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((stock) => (
            <div
              key={stock.code}
              className="flex justify-between items-center p-4 bg-gray-800 rounded-lg border border-gray-700"
            >
              <button
                onClick={() => router.push(`/stock/${stock.code}`)}
                className="text-left flex-1"
              >
                <span className="text-white font-medium">{stock.name}</span>
                <span className="text-gray-500 ml-2 text-sm">{stock.code}</span>
              </button>
              <button
                onClick={() => removeFavorite(stock.code)}
                className="text-red-400 hover:text-red-300 text-sm px-3 py-1"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
