// API routes for Ideas CRUD operations
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllIdeas, createIdea as createIdeaInSheet, isGoogleSheetsConfigured } from '@/lib/google-sheets';
import { checkAuth, unauthorizedResponse } from '@/lib/api-auth';
import { Idea } from '@/lib/types';

// Zod schemas for input validation
const StageSchema = z.enum(['spark', 'exploring', 'building', 'waiting', 'simmering', 'shipped', 'paused']);
const EffortSchema = z.enum(['trivial', 'small', 'medium', 'large', 'epic']);

const CreateIdeaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(5000, 'Description too long').optional().default(''),
  stage: StageSchema.optional().default('spark'),
  tags: z.array(z.string().max(50)).max(20, 'Too many tags').optional().default([]),
  effort: EffortSchema.optional().default('medium'),
  notes: z.string().max(10000, 'Notes too long').optional().default(''),
  startedAt: z.string().optional(),
  statusNote: z.string().max(500, 'Status note too long').optional(),
});

// GET /api/ideas - Get all ideas
export async function GET(request: NextRequest) {
  // Check auth
  const auth = checkAuth(request);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

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
  // Check auth
  const auth = checkAuth(request);
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  if (!isGoogleSheetsConfigured()) {
    return NextResponse.json(
      { error: 'Google Sheets not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const parseResult = CreateIdeaSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const validated = parseResult.data;
    const now = new Date().toISOString();
    const newIdea: Idea = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: validated.title,
      description: validated.description,
      stage: validated.stage,
      tags: validated.tags,
      effort: validated.effort,
      notes: validated.notes,
      createdAt: now,
      updatedAt: now,
      startedAt: validated.startedAt,
      stageHistory: [{ stage: validated.stage, date: now }],
      statusNote: validated.statusNote,
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
