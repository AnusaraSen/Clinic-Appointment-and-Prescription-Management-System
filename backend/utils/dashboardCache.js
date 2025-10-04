/**
 * Dashboard Cache Service - Smart caching for optimized performance! ⚡
 * 
 * This service provides intelligent caching mechanisms for dashboard statistics
 * with features like automatic cache invalidation, memory management,
 * and performance monitoring.
 */

class DashboardCache {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 50; // Maximum number of cache entries
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
    this.statistics = {
      hits: 0,
      misses: 0,
      invalidations: 0,
      memoryUsage: 0
    };
    
    // Auto-cleanup old entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
    
    console.log('🗄️ Dashboard cache service initialized');
  }

  /**
   * Get cached data
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.statistics.misses++;
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.statistics.misses++;
      this.statistics.invalidations++;
      return null;
    }
    
    // Update access time for LRU tracking
    entry.lastAccessed = Date.now();
    this.statistics.hits++;
    
    console.log(`🎯 Cache hit for key: ${key}`);
    return entry.data;
  }

  /**
   * Set cached data with TTL
   */
  set(key, data, ttl = this.defaultTTL) {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }
    
    const entry = {
      data,
      createdAt: Date.now(),
      lastAccessed: Date.now(),
      expiresAt: Date.now() + ttl
    };
    
    this.cache.set(key, entry);
    this.updateMemoryStats();
    
    console.log(`💾 Cached data for key: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.statistics.invalidations++;
      this.updateMemoryStats();
      console.log(`🗑️ Cache invalidated for key: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    this.statistics.invalidations += size;
    this.updateMemoryStats();
    console.log(`🧹 Cache cleared - removed ${size} entries`);
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.statistics.hits + this.statistics.misses > 0 
      ? (this.statistics.hits / (this.statistics.hits + this.statistics.misses) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.statistics,
      hitRate: `${hitRate}%`,
      size: this.cache.size,
      maxSize: this.maxCacheSize
    };
  }

  /**
   * Evict oldest entry (LRU)
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`♻️ Evicted oldest cache entry: ${oldestKey}`);
    }
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.statistics.invalidations += cleaned;
      this.updateMemoryStats();
      console.log(`🧽 Cleanup: removed ${cleaned} expired cache entries`);
    }
  }

  /**
   * Update memory usage statistics
   */
  updateMemoryStats() {
    const memUsage = process.memoryUsage();
    this.statistics.memoryUsage = (memUsage.heapUsed / 1024 / 1024).toFixed(2); // MB
  }
}

// Create singleton instance
const dashboardCache = new DashboardCache();

/**
 * Rate limiting storage for API requests
 */
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = 15 * 60 * 1000; // 15 minutes
    this.maxRequests = 100; // Max requests per window
    
    // Cleanup old entries every 10 minutes
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
    
    console.log('🚦 Rate limiter initialized');
  }

  /**
   * Check if request is allowed
   */
  isAllowed(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(clientId)) {
      this.requests.set(clientId, []);
    }
    
    const clientRequests = this.requests.get(clientId);
    
    // Remove old requests outside the window
    const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(clientId, validRequests);
    
    // Check if under limit
    if (validRequests.length < this.maxRequests) {
      validRequests.push(now);
      return true;
    }
    
    return false;
  }

  /**
   * Get rate limit info for client
   */
  getInfo(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const clientRequests = this.requests.get(clientId) || [];
    const validRequests = clientRequests.filter(timestamp => timestamp > windowStart);
    
    return {
      limit: this.maxRequests,
      current: validRequests.length,
      remaining: Math.max(0, this.maxRequests - validRequests.length),
      resetTime: new Date(now + this.windowMs)
    };
  }

  /**
   * Cleanup old entries
   */
  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    let cleaned = 0;
    
    for (const [clientId, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      
      if (validRequests.length === 0) {
        this.requests.delete(clientId);
        cleaned++;
      } else {
        this.requests.set(clientId, validRequests);
      }
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Rate limiter cleanup: removed ${cleaned} inactive clients`);
    }
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

module.exports = {
  dashboardCache,
  rateLimiter
};