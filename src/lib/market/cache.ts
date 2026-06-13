interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

class TTLCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): { data: T; cachedAt: number } | null {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return { data: entry.data, cachedAt: entry.cachedAt };
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
    });
  }
}

export const marketCache = new TTLCache();

export const TTL = {
  QUOTE: 60_000,       // 60 seconds
  SEARCH: 5 * 60_000,  // 5 minutes
  HISTORY: 60 * 60_000 // 1 hour
} as const;
