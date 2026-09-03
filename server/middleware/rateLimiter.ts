import type { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export let totalRateLimitsTriggered = 0;

/**
 * In-memory sliding window rate limiter middleware
 * @param windowMs Time window in milliseconds (e.g. 60,000 for 1 minute)
 * @param maxRequests Maximum allowed requests in the window
 * @param operationName Name of the protected operation for logging
 */
export function createRateLimiter(windowMs: number, maxRequests: number, operationName = 'API Operation') {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const authHeader = req.headers.authorization || '';
    const identifier = `${operationName}:${clientIp}:${authHeader.slice(-10)}`;

    const now = Date.now();
    let record = rateLimitStore.get(identifier);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      rateLimitStore.set(identifier, record);
      return next();
    }

    if (record.count >= maxRequests) {
      totalRateLimitsTriggered++;
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded for ${operationName}. Please wait ${retryAfterSec}s before retrying.`,
        operation: operationName,
        retryAfterSec,
      });
    }

    record.count++;
    return next();
  };
}
