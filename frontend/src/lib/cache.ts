/**
 * Client-side in-memory cache with TTL (time-to-live) support.
 * Suitable for caching API responses or computed values.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/** Default TTL in milliseconds (5 minutes). */
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/** Set a value in the cache with an optional TTL. */
export function cacheSet<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

/** Get a value from the cache. Returns undefined if expired or missing. */
export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }

  return entry.value as T;
}

/** Check if a non-expired entry exists. */
export function cacheHas(key: string): boolean {
  return cacheGet(key) !== undefined;
}

/** Remove a specific key from the cache. */
export function cacheDelete(key: string): boolean {
  return store.delete(key);
}

/** Clear all entries from the cache. */
export function cacheClear(): void {
  store.clear();
}

/** Remove all expired entries (garbage collection). */
export function cacheCleanup(): number {
  const now = Date.now();
  let removed = 0;

  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) {
      store.delete(key);
      removed++;
    }
  }

  return removed;
}

/** Get the number of entries currently in the cache. */
export function cacheSize(): number {
  return store.size;
}

/**
 * Get or compute: if cached, return; otherwise run the factory,
 * cache the result, and return it.
 */
export async function cacheGetOrSet<T>(
  key: string,
  factory: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached !== undefined) return cached;

  const value = await factory();
  cacheSet(key, value, ttlMs);
  return value;
}

/**
 * Build a cache key from a base and parameters.
 * Example: buildCacheKey('themes', { period: '1mo' }) -> 'themes:period=1mo'
 */
export function buildCacheKey(base: string, params: Record<string, string | number>): string {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return sorted ? `${base}:${sorted}` : base;
}
