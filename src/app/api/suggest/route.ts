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

// Input validation schema
const SuggestRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  type: z.string().max(50).optional(),
});

export async function POST(request: NextRequest) {
  // Rate limiting
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(`suggest:${clientIP}`, RATE_LIMITS.ai);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await request.json();

    // Validate input
    const parseResult = SuggestRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parseResult.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { prompt, type } = parseResult.data;

    // Call Ollama
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500,
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
      suggestion: data.response,
      model: data.model,
      type,
    });
  } catch (error) {
    console.error('API error:', error);

    // Check if it's a connection error (Ollama not running)
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

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'connected',
        host: OLLAMA_HOST,
        model: OLLAMA_MODEL,
        availableModels: data.models?.map((m: { name: string }) => m.name) || [],
      });
    }
    return NextResponse.json(
      { status: 'error', message: 'Ollama not responding' },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'disconnected',
        message: 'Cannot connect to Ollama. Make sure it is running.',
      },
      { status: 503 }
    );
  }
}
