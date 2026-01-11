// Simple in-memory rate limiting for API endpoints
// Note: This resets on server restart and doesn't work across multiple instances

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

// Default configs for different endpoint types
export const RATE_LIMITS = {
  // Strict for auth (already handled in auth/route.ts)
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  // Moderate for AI endpoints (expensive operations)
  ai: { windowMs: 60 * 1000, maxRequests: 20 },
  // Lenient for general API
  api: { windowMs: 60 * 1000, maxRequests: 100 },
  // Very lenient for reads
  read: { windowMs: 60 * 1000, maxRequests: 200 },
} as const;

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.api
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    cleanupExpiredEntries();
  }

  if (!entry || now > entry.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Helper to get client IP from request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}
