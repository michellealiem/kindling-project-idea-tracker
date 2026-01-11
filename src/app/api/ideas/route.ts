// API routes for Ideas CRUD operations
import { NextRequest, NextResponse } from 'next/server';
import { getAllIdeas, createIdea as createIdeaInSheet, isGoogleSheetsConfigured } from '@/lib/google-sheets';
import { Idea, Stage, IdeaType, Effort } from '@/lib/types';

// GET /api/ideas - Get all ideas
export async function GET() {
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      { error: 'Google Sheets not configured' },
      { status: 503 }
    );
  }

  try {
    const ideas = await getAllIdeas();
    return NextResponse.json(ideas);
  } catch (error) {
    console.error('Failed to fetch ideas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    );
  }
}

// POST /api/ideas - Create a new idea
export async function POST(request: NextRequest) {
  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      { error: 'Google Sheets not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const now = new Date().toISOString();
    const newIdea: Idea = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: body.title,
      description: body.description || '',
      stage: body.stage as Stage || 'spark',
      type: body.type as IdeaType || 'experiment',
      tags: body.tags || [],
      effort: body.effort as Effort || 'medium',
      notes: body.notes || '',
      createdAt: now,
      updatedAt: now,
      stageHistory: [{ stage: body.stage || 'spark', date: now }],
    };

    const created = await createIdeaInSheet(newIdea);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Failed to create idea:', error);
    const isDev = process.env.NODE_ENV === 'development';
    const errorMessage = isDev && error instanceof Error ? error.message : undefined;
    return NextResponse.json(
      { error: 'Failed to create idea', ...(errorMessage && { details: errorMessage }) },
      { status: 500 }
    );
  }
}
