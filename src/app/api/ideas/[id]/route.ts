// API routes for single Idea operations
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getIdea, updateIdea as updateIdeaInSheet, deleteIdea as deleteIdeaFromSheet, isGoogleSheetsConfigured } from '@/lib/google-sheets';

// Zod schema for update validation (all fields optional)
const StageSchema = z.enum(['spark', 'exploring', 'building', 'waiting', 'simmering', 'shipped', 'paused']);
const IdeaTypeSchema = z.enum(['permasolution', 'project', 'experiment', 'learning']);
const EffortSchema = z.enum(['trivial', 'small', 'medium', 'large', 'epic']);

const UpdateIdeaSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  stage: StageSchema.optional(),
  type: IdeaTypeSchema.optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  effort: EffortSchema.optional(),
  notes: z.string().max(10000).optional(),
  startedAt: z.string().optional(),
  stageHistory: z.array(z.object({
    stage: StageSchema,
    date: z.string(),
  })).optional(),
}).strict();

// GET /api/ideas/[id] - Get a single idea
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      { error: 'Google Sheets not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const idea = await getIdea(id);

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Failed to fetch idea:', error);
    return NextResponse.json(
      { error: 'Failed to fetch idea' },
      { status: 500 }
    );
  }
}

// PATCH /api/ideas/[id] - Update an idea
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      { error: 'Google Sheets not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const parseResult = UpdateIdeaSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const updated = await updateIdeaInSheet(id, parseResult.data);

    if (!updated) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update idea:', error);
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage = isDev && error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Failed to update idea', ...(errorMessage && { details: errorMessage }) },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas/[id] - Delete an idea
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      { error: 'Google Sheets not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const deleted = await deleteIdeaFromSheet(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete idea:', error);
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
}
