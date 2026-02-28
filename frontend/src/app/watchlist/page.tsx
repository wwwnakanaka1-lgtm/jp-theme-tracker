'use client';

import { useState, useEffect } from 'react';
import { useWatchlistStore, type WatchlistItem } from '@/stores/useWatchlistStore';

export default function WatchlistPage() {
  const { items, isLoaded, loadWatchlist, addItem, removeItem, updateNotes, addTag, removeTag, clearAll } = useWatchlistStore();
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const handleAdd = () => {
    const code = newCode.trim();
    const name = newName.trim() || code;
    if (!code) return;
    addItem(code, name);
    setNewCode('');
    setNewName('');
  };

  const handleSaveNotes = (code: string) => {
    updateNotes(code, notesText);
    setEditingNotes(null);
  };

  const handleAddTag = (code: string) => {
    if (newTag.trim()) {
      addTag(code, newTag.trim());
      setNewTag('');
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">ウォッチリスト</h1>
        {items.length > 0 && (
          <button onClick={clearAll} className="text-sm text-red-400 hover:text-red-300 transition-colors">
            すべて削除
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <p className="text-sm text-gray-400 mb-3">銘柄を追加</p>
        <div className="flex gap-2">
          <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="銘柄コード" className="bg-gray-700 text-white text-sm px-3 py-2 rounded border border-gray-600 w-28" />
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="銘柄名（任意）" className="flex-1 bg-gray-700 text-white text-sm px-3 py-2 rounded border border-gray-600" />
          <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
            追加
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
          <p className="text-gray-500">ウォッチリストは空です</p>
          <p className="text-gray-600 text-sm mt-1">上のフォームから銘柄を追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item: WatchlistItem) => (
            <div key={item.code} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-white font-medium">{item.name}</span>
                  <span className="text-gray-500 text-sm ml-2">({item.code})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">追加: {new Date(item.addedAt).toLocaleDateString('ja-JP')}</span>
                  <button onClick={() => removeItem(item.code)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded-full">
                    {tag}
                    <button onClick={() => removeTag(item.code, tag)} className="hover:text-red-400">&times;</button>
                  </span>
                ))}
                <div className="inline-flex items-center">
                  <input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTag(item.code)} placeholder="タグ追加" className="bg-transparent text-xs text-gray-400 w-16 focus:outline-none" />
                </div>
              </div>

              {editingNotes === item.code ? (
                <div className="flex gap-2">
                  <input value={notesText} onChange={(e) => setNotesText(e.target.value)} className="flex-1 bg-gray-700 text-sm text-white px-2 py-1 rounded border border-gray-600" />
                  <button onClick={() => handleSaveNotes(item.code)} className="text-xs text-blue-400">保存</button>
                </div>
              ) : (
                <button onClick={() => { setEditingNotes(item.code); setNotesText(item.notes || ''); }} className="text-xs text-gray-500 hover:text-gray-300">
                  {item.notes || 'メモを追加...'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600 text-center">{items.length} 銘柄を監視中</p>
    </div>
  );
}
