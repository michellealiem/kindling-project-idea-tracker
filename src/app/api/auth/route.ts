import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const sitePassword = process.env.SITE_PASSWORD;

  // If no password is set, allow access (for local dev)
  if (!sitePassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('kindling_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  if (password === sitePassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('kindling_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

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
