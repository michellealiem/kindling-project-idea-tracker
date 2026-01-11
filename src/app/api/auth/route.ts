import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple in-memory rate limiting (resets on server restart)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return ip;
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(ip);

  if (!attempts) return false;
  if (now > attempts.resetAt) {
    loginAttempts.delete(ip);
    return false;
  }

  return attempts.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string, success: boolean): void {
  const now = Date.now();

  if (success) {
    loginAttempts.delete(ip);
    return;
  }

  const attempts = loginAttempts.get(ip);
  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOCKOUT_DURATION });
  } else {
    attempts.count++;
  }
}

function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    // Compare against itself to maintain constant time
    crypto.timingSafeEqual(aBuffer, aBuffer);
    return false;
  }
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);

  // Check rate limiting
  if (isRateLimited(clientIP)) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    );
  }

  let password: string;
  try {
    const body = await request.json();
    password = typeof body.password === 'string' ? body.password.slice(0, 256) : '';
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  const sitePassword = process.env.SITE_PASSWORD;

  // If no password is set, allow access (for local dev)
  if (!sitePassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('kindling_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  if (timingSafeCompare(password, sitePassword)) {
    recordAttempt(clientIP, true);
    const response = NextResponse.json({ success: true });
    response.cookies.set('kindling_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  recordAttempt(clientIP, false);
  return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('kindling_auth');
  const sitePassword = process.env.SITE_PASSWORD;

  // If no password is set, always authenticated (local dev)
  if (!sitePassword) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json({ authenticated: authCookie?.value === 'authenticated' });
}
