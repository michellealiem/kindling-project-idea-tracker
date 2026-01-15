// One-time sync endpoint to push localStorage ideas to Google Sheets
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { bulkSyncIdeas, isGoogleSheetsConfigured } from '@/lib/google-sheets';

// Zod schema for bulk sync validation
const StageSchema = z.enum(['spark', 'exploring', 'building', 'waiting', 'simmering', 'shipped', 'paused']);
const EffortSchema = z.enum(['trivial', 'small', 'medium', 'large', 'epic']);

const IdeaSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  stage: StageSchema,
  tags: z.array(z.string().max(50)).max(20),
  effort: EffortSchema,
  notes: z.string().max(10000),
  createdAt: z.string(),
  updatedAt: z.string(),
  startedAt: z.string().optional(),
  stageHistory: z.array(z.object({
    stage: StageSchema,
    date: z.string(),
  })),
  aiSuggestions: z.array(z.string()).optional(),
});

const BulkSyncSchema = z.object({
  ideas: z.array(IdeaSchema).max(1000, 'Too many ideas (max 1000)'),
});

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

    // Validate input
    const parseResult = BulkSyncSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') },
        { status: 400 }
      );
    }

    const result = await bulkSyncIdeas(parseResult.data.ideas);

    return NextResponse.json({
      success: true,
      message: `Synced ${result.created} ideas, skipped ${result.skipped} existing`,
      ...result,
    });
  } catch (error) {
    console.error('Failed to sync ideas:', error);
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage = isDev && error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Failed to sync ideas', ...(errorMessage && { details: errorMessage }) },
      { status: 500 }
    );
  }
}
