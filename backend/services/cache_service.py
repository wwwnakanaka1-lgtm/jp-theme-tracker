"""Cache service layer providing unified access to Redis and memory caches.

Abstracts the caching strategy so callers do not need to know
whether data is stored in Redis, in-memory, or both. Falls back
gracefully when Redis is unavailable.
"""

import json
import logging
from typing import Any, Optional

import redis

from utils.cache import cache as memory_cache

logger = logging.getLogger(__name__)


class CacheService:
    """Dual-layer cache: Redis (L1) + in-memory (L2).

    Attempts Redis first for distributed consistency,
    then falls back to the process-local memory cache.
    """

    def __init__(self, redis_url: Optional[str] = None) -> None:
        self._redis: Optional[redis.Redis] = None
        if redis_url:
            try:
                self._redis = redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_connect_timeout=3,
                )
                self._redis.ping()
                logger.info("CacheService: Redis connected")
            except redis.ConnectionError:
                logger.warning("CacheService: Redis unavailable, memory only")
                self._redis = None

    def get(self, key: str) -> Optional[Any]:
        """Retrieve a cached value, checking Redis then memory."""
        if self._redis:
            try:
                raw = self._redis.get(key)
                if raw is not None:
                    return json.loads(raw)
            except (redis.RedisError, json.JSONDecodeError):
                pass

        return memory_cache.get(key)

    def set(
        self,
        key: str,
        value: Any,
        ttl_seconds: int = 300,
    ) -> None:
        """Store a value in both Redis and memory cache."""
        memory_cache.set(key, value, ttl_seconds=ttl_seconds)

        if self._redis:
            try:
                serialized = json.dumps(value, ensure_ascii=False)
                self._redis.setex(key, ttl_seconds, serialized)
            except (redis.RedisError, TypeError) as exc:
                logger.warning(f"CacheService Redis SET failed: {exc}")

    def delete(self, key: str) -> None:
        """Remove a key from both cache layers."""
        memory_cache.delete(key)
        if self._redis:
            try:
                self._redis.delete(key)
            except redis.RedisError:
                pass

    def clear_all(self) -> None:
        """Flush both cache layers entirely."""
        memory_cache.clear()
        if self._redis:
            try:
                self._redis.flushdb()
            except redis.RedisError:
                pass

    def stats(self) -> dict:
        """Return cache health and size information."""
        redis_ok = False
        redis_keys = 0
        if self._redis:
            try:
                self._redis.ping()
                redis_ok = True
                redis_keys = self._redis.dbsize()
            except redis.RedisError:
                pass

        return {
            "redis_connected": redis_ok,
            "redis_key_count": redis_keys,
            "memory_cache_size": memory_cache.size(),
        }
