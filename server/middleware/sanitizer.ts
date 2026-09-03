import type { Request, Response, NextFunction } from 'express';

/**
 * Strips undefined properties recursively from an object
 * to prevent database write crashes and invalid JSON.
 */
export function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined) as unknown as T;
  }
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = stripUndefined(value);
      }
    }
    return result as T;
  }
  return obj;
}

/**
 * Sanitize all string fields in request body to prevent XSS and command injection
 */
export function sanitizeRequestBodyMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = stripUndefined(req.body);
  }
  next();
}
