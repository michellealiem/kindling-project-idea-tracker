// API endpoint for adding links to ideas (PAIA integration)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getIdea, updateIdea, isGoogleSheetsConfigured } from '@/lib/google-sheets';
import { checkAuth, unauthorizedResponse } from '@/lib/api-auth';
import { MemoryLink, ResourceLink, PersonLink } from '@/lib/types';

// Link schemas
const MemoryLinkSchema = z.object({
  date: z.string(),
  excerpt: z.string().max(500),
  sourceFile: z.string().optional(),
});

const ResourceLinkSchema = z.object({
  type: z.enum(['video', 'podcast', 'article', 'paper']),
  title: z.string().max(200),
  url: z.string().url().optional(),
  note: z.string().max(500).optional(),
});

const PersonLinkSchema = z.object({
  name: z.string().max(100),
  role: z.string().max(100).optional(),
  isBlocking: z.boolean().optional(),
});

const AddLinkSchema = z.discriminatedUnion('linkType', [
  z.object({
    linkType: z.literal('memory'),
    data: MemoryLinkSchema,
  }),
  z.object({
    linkType: z.literal('resource'),
    data: ResourceLinkSchema,
  }),
  z.object({
    linkType: z.literal('person'),
    data: PersonLinkSchema,
  }),
]);

// Generate a unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// POST /api/ideas/[id]/links - Add a link to an idea
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const parseResult = AddLinkSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    // Get current idea
    const idea = await getIdea(id);
    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    const { linkType, data } = parseResult.data;
    let updates: Partial<typeof idea> = {};

    switch (linkType) {
      case 'memory': {
        const newLink: MemoryLink = {
          id: generateId(),
          ...data,
        };
        updates = {
          memoryLinks: [...(idea.memoryLinks || []), newLink],
        };
        break;
      }
      case 'resource': {
        const newLink: ResourceLink = {
          id: generateId(),
          ...data,
        };
        updates = {
          resourceLinks: [...(idea.resourceLinks || []), newLink],
        };
        break;
      }
      case 'person': {
        const newLink: PersonLink = {
          id: generateId(),
          ...data,
        };
        updates = {
          personLinks: [...(idea.personLinks || []), newLink],
        };
        break;
      }
    }

    const updated = await updateIdea(id, updates);
    return NextResponse.json({ success: true, idea: updated });
  } catch (error) {
    console.error('Failed to add link:', error);
    return NextResponse.json(
      { error: 'Failed to add link' },
      { status: 500 }
    );
  }
}

// DELETE /api/ideas/[id]/links - Remove a link from an idea
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const linkType = searchParams.get('linkType');
    const linkId = searchParams.get('linkId');

    if (!linkType || !linkId) {
      return NextResponse.json(
        { error: 'Missing linkType or linkId query parameter' },
        { status: 400 }
      );
    }

    const idea = await getIdea(id);
    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    let updates: Partial<typeof idea> = {};

    switch (linkType) {
      case 'memory':
        updates = {
          memoryLinks: (idea.memoryLinks || []).filter(l => l.id !== linkId),
        };
        break;
      case 'resource':
        updates = {
          resourceLinks: (idea.resourceLinks || []).filter(l => l.id !== linkId),
        };
        break;
      case 'person':
        updates = {
          personLinks: (idea.personLinks || []).filter(l => l.id !== linkId),
        };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid linkType' },
          { status: 400 }
        );
    }

    const updated = await updateIdea(id, updates);
    return NextResponse.json({ success: true, idea: updated });
  } catch (error) {
    console.error('Failed to remove link:', error);
    return NextResponse.json(
      { error: 'Failed to remove link' },
      { status: 500 }
    );
  }
}
