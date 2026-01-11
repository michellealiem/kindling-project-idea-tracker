// API route for full data sync
import { NextResponse } from 'next/server';
import { getAllData, initializeSheets, isGoogleSheetsConfigured } from '@/lib/google-sheets';

// GET /api/data - Get all data (ideas, themes, learnings)
export async function GET() {
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
export async function POST() {
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
