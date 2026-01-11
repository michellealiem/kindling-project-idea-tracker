// Parser for PAIA markdown files (recurring_themes.md, learnings.md)

import { Theme, Learning } from './types';

/**
 * Parse recurring_themes.md format:
 *
 * ### 1. Theme Title
 * **First appeared**: 2025-12-24
 * **Occurrences**: 8 (details...)
 *
 * Description paragraph...
 *
 * **Key moments**:
 * - "Quote one"
 * - "Quote two"
 */
export function parseThemes(markdown: string): Omit<Theme, 'id'>[] {
  if (!markdown.trim()) return [];

  const themes: Omit<Theme, 'id'>[] = [];

  // Split by theme headers (### followed by number and dot)
  const sections = markdown.split(/(?=###\s*\d+\.)/);

  for (const section of sections) {
    // Skip empty sections or header sections without content
    if (!section.trim() || !section.match(/###\s*\d+\./)) continue;

    try {
      // Extract title
      const titleMatch = section.match(/###\s*\d+\.\s*([^\n]+)/);
      if (!titleMatch) continue;
      const title = titleMatch[1].trim();

      // Extract occurrences count
      const occurrencesMatch = section.match(/\*\*Occurrences\*\*:\s*(\d+)/);
      const occurrences = occurrencesMatch ? parseInt(occurrencesMatch[1]) : 1;

      // Extract key moments
      const keyMoments: string[] = [];
      const keyMomentsSection = section.match(/\*\*Key moments\*\*:\s*\n([\s\S]*?)(?=\n---|\n###|$)/);
      if (keyMomentsSection) {
        const bullets = keyMomentsSection[1].match(/^-\s+"([^"]+)"/gm);
        if (bullets) {
          for (const bullet of bullets) {
            const quote = bullet.match(/-\s+"([^"]+)"/);
            if (quote) {
              keyMoments.push(quote[1]);
            }
          }
        }
      }

      // Extract description (text between metadata and key moments or end)
      let description = '';
      const descStart = section.indexOf('\n\n', section.indexOf('Occurrences'));
      if (descStart !== -1) {
        const descEnd = section.indexOf('**Key moments**');
        description = section
          .slice(descStart, descEnd !== -1 ? descEnd : undefined)
          .replace(/\*\*[^*]+\*\*:\s*[^\n]+\n/g, '') // Remove metadata lines
          .trim()
          .split('\n\n')[0] || ''; // Get first paragraph
      }

      themes.push({
        title,
        description: description.substring(0, 500), // Limit length
        occurrences,
        keyMoments: keyMoments.slice(0, 5), // Limit to 5
        linkedIdeas: [],
        source: 'paia',
      });
    } catch {
      console.warn('Failed to parse theme section:', section.substring(0, 100));
    }
  }

  return themes;
}

/**
 * Parse learnings.md format:
 *
 * ### 2026-01-09: Learning Title
 *
 * **Context**: ...
 * **Discovery**: ...
 * **Connections**: ...
 * **Actionable**: ...
 */
export function parseLearnings(markdown: string): Omit<Learning, 'id'>[] {
  if (!markdown.trim()) return [];

  const learnings: Omit<Learning, 'id'>[] = [];

  // Split by learning headers (### followed by date)
  const sections = markdown.split(/(?=###\s*\d{4}-\d{2}-\d{2}:)/);

  for (const section of sections) {
    // Skip empty sections or header sections without date
    if (!section.trim() || !section.match(/###\s*\d{4}-\d{2}-\d{2}:/)) continue;

    try {
      // Extract date and title
      const headerMatch = section.match(/###\s*(\d{4}-\d{2}-\d{2}):\s*([^\n]+)/);
      if (!headerMatch) continue;
      const date = headerMatch[1];
      const title = headerMatch[2].trim();

      // Extract fields
      const extractField = (field: string): string => {
        const regex = new RegExp(`\\*\\*${field}\\*\\*:\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n---|\\n###|$)`);
        const match = section.match(regex);
        return match ? match[1].trim() : '';
      };

      const context = extractField('Context');
      const discovery = extractField('Discovery');
      const actionable = extractField('Actionable');

      learnings.push({
        date,
        title,
        context: context.substring(0, 500),
        discovery: discovery.substring(0, 1000),
        actionable: actionable.substring(0, 500),
        linkedIdeas: [],
        source: 'paia',
      });
    } catch {
      console.warn('Failed to parse learning section:', section.substring(0, 100));
    }
  }

  return learnings;
}

/**
 * Combined parser for importing both files at once
 */
export function parsePAIAData(
  themesMarkdown: string,
  learningsMarkdown: string
): { themes: Omit<Theme, 'id'>[]; learnings: Omit<Learning, 'id'>[] } {
  return {
    themes: parseThemes(themesMarkdown),
    learnings: parseLearnings(learningsMarkdown),
  };
}
