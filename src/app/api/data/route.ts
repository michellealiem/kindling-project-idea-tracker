// API route for full data sync
import { NextRequest, NextResponse } from 'next/server';
import { getAllData, initializeSheets, isGoogleSheetsConfigured } from '@/lib/google-sheets';
import { checkAuth, unauthorizedResponse } from '@/lib/api-auth';

// GET /api/data - Get all data (ideas, themes, learnings)
export async function GET(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
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
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage = isDev && error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Failed to fetch data', ...(errorMessage && { details: errorMessage }) },
      { status: 500 }
    );
  }
}

// POST /api/data/init - Initialize sheets (run once to set up headers)
export async function POST(request: NextRequest) {
  const auth = checkAuth(request);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
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
