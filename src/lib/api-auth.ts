// API authentication helper for Kindling
// Supports both cookie auth (browser) and API key auth (PAIA)

import { NextRequest } from 'next/server';
import crypto from 'crypto';

function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    crypto.timingSafeEqual(aBuffer, aBuffer);
    return false;
  }
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export interface AuthResult {
  authenticated: boolean;
  method: 'cookie' | 'api_key' | 'none';
  error?: string;
}

/**
 * Check if request is authenticated via cookie or API key
 *
 * API key can be provided in:
 * - Authorization: Bearer <api_key>
 * - X-API-Key: <api_key>
 *
 * Environment variables:
 * - SITE_PASSWORD: password for cookie auth
 * - KINDLING_API_KEY: API key for PAIA integration
 */
export function checkAuth(request: NextRequest): AuthResult {
  const sitePassword = process.env.SITE_PASSWORD;
  const apiKey = process.env.KINDLING_API_KEY;

  // If no auth is configured, allow all (local dev)
  if (!sitePassword && !apiKey) {
    return { authenticated: true, method: 'none' };
  }

  // Check cookie auth first
  const authCookie = request.cookies.get('kindling_auth');
  if (authCookie?.value === 'authenticated') {
    return { authenticated: true, method: 'cookie' };
  }

  // Check API key auth
  if (apiKey) {
    // Check Authorization header
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const providedKey = authHeader.slice(7);
      if (timingSafeCompare(providedKey, apiKey)) {
        return { authenticated: true, method: 'api_key' };
      }
    }

    // Check X-API-Key header
    const xApiKey = request.headers.get('X-API-Key');
    if (xApiKey && timingSafeCompare(xApiKey, apiKey)) {
      return { authenticated: true, method: 'api_key' };
    }
  }

  return {
    authenticated: false,
    method: 'none',
    error: 'Authentication required. Provide cookie auth or API key.',
  };
}

/**
 * Helper to return 401 response
 */
export function unauthorizedResponse(message?: string) {
  return Response.json(
    { error: message || 'Unauthorized' },
    { status: 401 }
  );
}
