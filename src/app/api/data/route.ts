// API route for full data sync
import { NextRequest, NextResponse } from 'next/server';
import { getAllData, initializeSheets, isGoogleSheetsConfigured } from '@/lib/google-sheets';

function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get('kindling_auth');
  const sitePassword = process.env.SITE_PASSWORD;

  // If no password is set, allow access (local dev)
  if (!sitePassword) return true;

  return authCookie?.value === 'authenticated';
}

// GET /api/data - Get all data (ideas, themes, learnings)
export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Check if Google Sheets is configured
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      { error: 'Google Sheets not configured', configured: false },
      { status: 503 }
    );
  }

  try {
    const data = await getAllData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch data', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/data/init - Initialize sheets (run once to set up headers)
export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initializeSheets();
    return NextResponse.json({ success: true, message: 'Sheets initialized' });
  } catch (error) {
    console.error('Failed to initialize sheets:', error);
    return NextResponse.json(
      { error: 'Failed to initialize sheets' },
      { status: 500 }
    );
  }
}
