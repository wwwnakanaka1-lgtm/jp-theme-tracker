'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SearchResult {
  code: string;
  name: string;
  theme_id: string;
  theme_name: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stocks?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.stocks || []);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">銘柄検索</h1>
      <div className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="銘柄名またはコードを入力..."
          className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '検索中...' : '検索'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">{results.length}件の結果</p>
          {results.map((stock) => (
            <button
              key={stock.code}
              onClick={() => router.push(`/stock/${stock.code}`)}
              className="w-full text-left p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors border border-gray-700"
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-white font-medium">{stock.name}</span>
                  <span className="text-gray-500 ml-2 text-sm">{stock.code}</span>
                </div>
                <span className="text-gray-400 text-sm">{stock.theme_name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {results.length === 0 && query && !loading && (
        <p className="text-gray-500 text-center py-8">該当する銘柄が見つかりませんでした</p>
      )}
    </div>
  );
}
