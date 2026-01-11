// One-time sync endpoint to push localStorage ideas to Google Sheets
import { NextRequest, NextResponse } from 'next/server';
import { bulkSyncIdeas, isGoogleSheetsConfigured } from '@/lib/google-sheets';
import { Idea } from '@/lib/types';

// POST /api/sync - Bulk sync ideas to Google Sheets
export async function POST(request: NextRequest) {
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      { error: 'Google Sheets not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // Expect { ideas: Idea[] }
    if (!body.ideas || !Array.isArray(body.ideas)) {
      return NextResponse.json(
        { error: 'Request body must contain an "ideas" array' },
        { status: 400 }
      );
    }

    const ideas: Idea[] = body.ideas;
    const result = await bulkSyncIdeas(ideas);

    return NextResponse.json({
      success: true,
      message: `Synced ${result.created} ideas, skipped ${result.skipped} existing`,
      ...result,
    });
  } catch (error) {
    console.error('Failed to sync ideas:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to sync ideas', details: errorMessage },
      { status: 500 }
    );
  }
}
