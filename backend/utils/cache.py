"""シンプルなメモリキャッシュユーティリティ"""

import threading
from datetime import datetime, timedelta
from typing import Any, Optional


class MemoryCache:
    """スレッドセーフなメモリキャッシュ"""

    def __init__(self):
        self._cache: dict[str, Any] = {}
        self._ttl: dict[str, datetime] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        """キャッシュから取得。期限切れならNone"""
        with self._lock:
            if key in self._cache and key in self._ttl:
                if datetime.now() < self._ttl[key]:
                    return self._cache[key]
                else:
                    # 期限切れなら削除
                    del self._cache[key]
                    del self._ttl[key]
            return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        """キャッシュに保存（デフォルト5分）"""
        with self._lock:
            self._cache[key] = value
            self._ttl[key] = datetime.now() + timedelta(seconds=ttl_seconds)

    def delete(self, key: str) -> bool:
        """指定キーを削除"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                if key in self._ttl:
                    del self._ttl[key]
                return True
            return False

    def clear(self):
        """キャッシュをクリア"""
        with self._lock:
            self._cache.clear()
            self._ttl.clear()

    def cleanup_expired(self):
        """期限切れエントリを削除"""
        with self._lock:
            now = datetime.now()
            expired_keys = [
                key for key, expiry in self._ttl.items() if expiry <= now
            ]
            for key in expired_keys:
                del self._cache[key]
                del self._ttl[key]

    def size(self) -> int:
        """キャッシュ内のエントリ数を取得"""
        with self._lock:
            return len(self._cache)


# グローバルインスタンス
cache = MemoryCache()
