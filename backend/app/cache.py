"""Redis cache wrapper for distributed caching.

Provides a thin abstraction over the redis client with
automatic serialization, TTL management, and graceful
fallback when Redis is unavailable.
"""

import json
import logging
from typing import Any, Optional

import redis

logger = logging.getLogger(__name__)


class RedisCache:
    """Thread-safe Redis cache wrapper with JSON serialization."""

    def __init__(
        self,
        url: Optional[str] = None,
        default_ttl: int = 300,
    ) -> None:
        self._default_ttl = default_ttl
        self._client: Optional[redis.Redis] = None

        if url:
            try:
                self._client = redis.from_url(
                    url,
                    decode_responses=True,
                    socket_connect_timeout=3,
                )
                self._client.ping()
                logger.info("Redis connection established")
            except redis.ConnectionError:
                logger.warning("Redis unavailable, cache disabled")
                self._client = None

    @property
    def is_connected(self) -> bool:
        """Check whether the Redis client is connected."""
        if self._client is None:
            return False
        try:
            self._client.ping()
            return True
        except redis.ConnectionError:
            return False

    def get(self, key: str) -> Optional[Any]:
        """Retrieve a value by key, deserializing from JSON."""
        if not self._client:
            return None
        try:
            raw = self._client.get(key)
            if raw is not None:
                return json.loads(raw)
        except (redis.RedisError, json.JSONDecodeError) as exc:
            logger.warning(f"Redis GET failed for {key}: {exc}")
        return None

    def set(
        self,
        key: str,
        value: Any,
        ttl: Optional[int] = None,
    ) -> bool:
        """Store a value with optional TTL (seconds)."""
        if not self._client:
            return False
        try:
            serialized = json.dumps(value, ensure_ascii=False)
            self._client.setex(
                key,
                ttl or self._default_ttl,
                serialized,
            )
            return True
        except (redis.RedisError, TypeError) as exc:
            logger.warning(f"Redis SET failed for {key}: {exc}")
            return False

    def delete(self, key: str) -> bool:
        """Remove a key from the cache."""
        if not self._client:
            return False
        try:
            return bool(self._client.delete(key))
        except redis.RedisError as exc:
            logger.warning(f"Redis DELETE failed for {key}: {exc}")
            return False

    def flush(self) -> bool:
        """Clear all keys in the current database."""
        if not self._client:
            return False
        try:
            self._client.flushdb()
            return True
        except redis.RedisError as exc:
            logger.warning(f"Redis FLUSHDB failed: {exc}")
            return False
