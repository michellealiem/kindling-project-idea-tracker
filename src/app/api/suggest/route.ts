import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1:8b';

export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

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
