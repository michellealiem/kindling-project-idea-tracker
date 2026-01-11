// Ollama integration for AI suggestions

const OLLAMA_HOST = process.env.NEXT_PUBLIC_OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'llama3.1:8b';

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function generateSuggestion(prompt: string): Promise<string | null> {
  try {
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
      console.error('Ollama request failed:', response.status);
      return null;
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama error:', error);
    return null;
  }
}

// Pre-built prompts for different suggestion types

export function buildSparkDevelopmentPrompt(title: string, description: string): string {
  return `You are helping a builder develop a project idea. The user has captured this spark:

Title: ${title}
Description: ${description || '(no description yet)'}

Provide a brief, practical response (2-3 paragraphs) that:
1. Identifies the core problem or opportunity
2. Suggests 2-3 concrete next steps to explore this idea
3. Notes if this could be a "permasolution" (build once, runs forever) or needs ongoing maintenance

Keep it actionable and encouraging. No fluff.`;
}

export function buildProgressCheckPrompt(
  title: string,
  stage: string,
  daysSinceUpdate: number,
  type: string
): string {
  return `You are helping a builder reflect on a project they're working on.

Project: ${title}
Current stage: ${stage}
Days since last update: ${daysSinceUpdate}
Type: ${type}

The builder has a pattern of being great at starting things but sometimes getting stuck in the "sustaining" phase. They prefer "permasolutions" that don't need ongoing maintenance.

Provide a brief, supportive check-in (1-2 paragraphs) that:
1. Acknowledges their progress
2. Gently asks a clarifying question if the project seems stalled
3. If it's been building for a while, asks if it might be slipping into "sustainer trap" territory

Be direct but kind. No fluff.`;
}

export function buildNewIdeaSuggestionsPrompt(
  existingIdeas: { title: string; type: string; stage: string }[],
  themes: { title: string; description: string }[]
): string {
  const ideaSummary = existingIdeas
    .slice(0, 10)
    .map((i) => `- ${i.title} (${i.type}, ${i.stage})`)
    .join('\n');

  const themeSummary = themes
    .slice(0, 5)
    .map((t) => `- ${t.title}`)
    .join('\n');

  return `You are helping a builder discover new project ideas based on their patterns.

Current projects:
${ideaSummary || '(no projects yet)'}

Recurring themes in their work:
${themeSummary || '(no themes imported)'}

Based on these patterns, suggest 2-3 new project ideas that:
1. Align with their interests and themes
2. Are "permasolutions" (build once, runs forever) when possible
3. Are specific and actionable, not vague

Format each idea as:
**[Title]**: Brief description and why it fits their pattern.

Be creative but practical.`;
}

export function buildThemeConnectionPrompt(
  ideaTitle: string,
  ideaDescription: string,
  themes: { title: string; description: string }[]
): string {
  const themeSummary = themes
    .map((t) => `- ${t.title}: ${t.description.substring(0, 100)}...`)
    .join('\n');

  return `You are helping a builder see connections between a project and their recurring themes.

Project:
Title: ${ideaTitle}
Description: ${ideaDescription || '(no description)'}

Their recurring themes:
${themeSummary || '(no themes imported)'}

In 1-2 sentences, identify which theme(s) this project relates to and why. Be specific about the connection.`;
}
