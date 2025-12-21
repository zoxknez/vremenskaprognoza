/**
 * City Ranking Cache
 * Implements caching strategy for city rankings to improve performance
 * and reduce API calls
 */

import { CityRankingData } from './air-quality-stats';

interface CacheEntry {
  data: CityRankingData[];
  timestamp: number;
  expiresAt: number;
}

class CityRankingCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached rankings
   */
  get(key: string): CityRankingData[] | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Set rankings in cache
   */
  set(key: string, data: CityRankingData[], ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const cityRankingCache = new CityRankingCache();

// Clear expired entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    cityRankingCache.clearExpired();
  }, 60 * 1000);
}
