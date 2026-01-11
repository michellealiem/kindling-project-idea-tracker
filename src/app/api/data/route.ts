// API route for full data sync
import { NextResponse } from 'next/server';
import { getAllData, initializeSheets } from '@/lib/google-sheets';

// GET /api/data - Get all data (ideas, themes, learnings)
export async function GET() {
  try {
    const data = await getAllData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
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
