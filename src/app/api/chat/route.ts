import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

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
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

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
