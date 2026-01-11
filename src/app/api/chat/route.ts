import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

// SSRF protection: validate Ollama host URL
function getValidatedOllamaHost(): string {
  const host = process.env.OLLAMA_HOST || 'http://localhost:11434';

  try {
    const url = new URL(host);
    const hostname = url.hostname.toLowerCase();

    // Only allow localhost connections for Ollama (SSRF protection)
    const allowedHosts = ['localhost', '127.0.0.1', '::1'];
    if (!allowedHosts.includes(hostname)) {
      console.warn(`SSRF protection: Blocked non-localhost Ollama host: ${hostname}`);
      return 'http://localhost:11434';
    }

    return host;
  } catch {
    return 'http://localhost:11434';
  }
}

const OLLAMA_HOST = getValidatedOllamaHost();

// Input validation schemas
const IdeaContextSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  stage: z.string(),
  type: z.string(),
  tags: z.array(z.string()),
  notes: z.string(),
});

const ChatContextSchema = z.object({
  ideas: z.array(IdeaContextSchema).max(500),
  themes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
  })).max(100),
  learnings: z.array(z.object({
    id: z.string(),
    title: z.string(),
    context: z.string(),
    discovery: z.string(),
  })).max(100),
}).optional();

const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
  context: ChatContextSchema,
});

interface ChatContext {
  ideas: Array<{
    id: string;
    title: string;
    description: string;
    stage: string;
    type: string;
    tags: string[];
    notes: string;
  }>;
  themes: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  learnings: Array<{
    id: string;
    title: string;
    context: string;
    discovery: string;
  }>;
}

function buildSystemPrompt(context: ChatContext): string {
  const ideaByStage: Record<string, string[]> = {};
  for (const idea of context.ideas) {
    if (!ideaByStage[idea.stage]) {
      ideaByStage[idea.stage] = [];
    }
    ideaByStage[idea.stage].push(
      '- ' + idea.title + (idea.tags.length ? ' [' + idea.tags.join(', ') + ']' : '')
    );
  }

  const ideaSummary = Object.entries(ideaByStage)
    .map(([stage, ideas]) => stage.toUpperCase() + ':\n' + ideas.join('\n'))
    .join('\n\n');

  const themeSummary = context.themes.length > 0
    ? context.themes.map((t) => '- ' + t.title + ': ' + t.description.slice(0, 100) + '...').join('\n')
    : '(No themes imported yet)';

  const learningSummary = context.learnings.length > 0
    ? context.learnings.map((l) => '- ' + l.title + ': ' + l.discovery.slice(0, 100) + '...').join('\n')
    : '(No learnings imported yet)';

  return 'You are Kindling Companion, a helpful AI assistant for Michelle\'s idea tracker app called Kindling.\n\n' +
    'Michelle is a builder who is great at starting things but sometimes struggles with sustaining them. ' +
    'She prefers "permasolutions" - things you build once that run forever without ongoing maintenance.\n\n' +
    'You have access to her current project data:\n\n' +
    'IDEAS BY STAGE:\n' + (ideaSummary || '(No ideas yet)') + '\n\n' +
    'RECURRING THEMES:\n' + themeSummary + '\n\n' +
    'KEY LEARNINGS:\n' + learningSummary + '\n\n' +
    'Your job is to:\n' +
    '1. Help Michelle explore patterns and connections in her ideas\n' +
    '2. Answer questions about her projects, themes, and learnings\n' +
    '3. Suggest which sparks might be worth pursuing\n' +
    '4. Identify if any projects might be "sustainer traps" (require ongoing maintenance)\n' +
    '5. Be direct, practical, and encouraging - no fluff\n\n' +
    'When searching for ideas, match against titles, descriptions, tags, and notes.\n' +
    'Keep responses concise (2-3 paragraphs max) unless asked for detail.\n' +
    'Use the fire/flame metaphors naturally (sparks, kindling, blazing, beacons) since that\'s the app\'s theme.';
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`chat:${clientIP}`, RATE_LIMITS.ai);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const parseResult = ChatRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { message, context } = parseResult.data;
    const systemPrompt = buildSystemPrompt(context || { ideas: [], themes: [], learnings: [] });
    const fullPrompt = systemPrompt + '\n\nUser: ' + message + '\n\nAssistant:';

    const response = await fetch(OLLAMA_HOST + '/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 800,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama error:', errorText);
      return NextResponse.json(
        { error: 'Ollama request failed', details: errorText },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      response: data.response,
      model: data.model,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          error: 'Cannot connect to Ollama',
          details: 'Make sure Ollama is running on your Mac (ollama serve)',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
