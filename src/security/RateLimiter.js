/**
 * Implements rate limiting with performance optimization
 */
export class RateLimiter {
  /**
   * Creates a new rate limiter
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} timeWindow - Time window in milliseconds
   */
  constructor(maxRequests = 100, timeWindow = 60000) {
    this.requests = new Map();
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this._lastCleanup = Date.now();
    this._violations = new Map();
  }

  /**
   * Checks if an operation is allowed
   * @param {string} key - Operation identifier
   * @returns {boolean} True if operation is allowed
   */
  isAllowed(key) {
    this._cleanup();
    const now = Date.now();
    const requestLog = this.requests.get(key) || [];
    
    // Use TypedArray for better performance
    const validRequests = new Float64Array(
      requestLog.filter(time => now - time < this.timeWindow)
    );
    
    if (validRequests.length >= this.maxRequests) {
      this._logViolation(key);
      return false;
    }
    
    this.requests.set(key, Array.from(validRequests).concat(now));
    return true;
  }

  _cleanup() {
    const now = Date.now();
    if (now - this._lastCleanup > this.timeWindow) {
      for (const [key, times] of this.requests) {
        if (times.length === 0) this.requests.delete(key);
      }
      this._lastCleanup = now;
    }
  }

  _logViolation(key) {
    const violations = (this._violations.get(key) || 0) + 1;
    this._violations.set(key, violations);
    
    console.warn(`Rate limit exceeded for key: ${key} (Violation #${violations})`);
    if (violations > 10) {
      console.error(`Critical: Multiple rate limit violations for ${key}`);
    }
  }
}
