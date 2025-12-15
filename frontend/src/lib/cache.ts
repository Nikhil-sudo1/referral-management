/**
 * Simple cache utility for API responses
 * Caches data in sessionStorage with TTL
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class ApiCache {
  private prefix = 'api_cache_';
  
  /**
   * Set cache entry
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      sessionStorage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }
  
  /**
   * Get cache entry
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this.prefix + key);
      if (!item) return null;
      
      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();
      
      // Check if expired
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
        return null;
      }
      
      return entry.data;
    } catch (error) {
      console.warn('Failed to get cached data:', error);
      return null;
    }
  }
  
  /**
   * Delete cache entry
   * @param key Cache key
   */
  delete(key: string): void {
    try {
      sessionStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Failed to delete cache:', error);
    }
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }
  
  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(sessionStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const item = sessionStorage.getItem(key);
            if (item) {
              const entry = JSON.parse(item);
              if (now - entry.timestamp > entry.ttl) {
                sessionStorage.removeItem(key);
              }
            }
          } catch (e) {
            // Invalid entry, remove it
            sessionStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }
}

export const apiCache = new ApiCache();

// Clear expired entries on load
if (typeof window !== 'undefined') {
  apiCache.clearExpired();
}

