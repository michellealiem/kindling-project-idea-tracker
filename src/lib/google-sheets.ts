// Google Sheets storage adapter for Kindling
// Server-side only - credentials must not be exposed to client

import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Idea, Theme, Learning, AppData, Stage, IdeaType, Effort } from './types';

// Check if Google Sheets is properly configured
export function isGoogleSheetsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_SHEET_ID
  );
}

// Parse the private key from environment variable
// Netlify can store it in various formats, so we try multiple approaches
function parsePrivateKey(rawKey: string): string {
  let key = rawKey;

  // Remove surrounding quotes if present
  if ((key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }

  // Replace literal \n sequences with actual newlines
  // This handles: \\n, \n as literal characters
  key = key.replace(/\\n/g, '\n');

  // If the key doesn't look valid, try JSON.parse as a last resort
  // (in case Netlify stored it as a JSON string)
  if (!key.includes('-----BEGIN') && rawKey.startsWith('"')) {
    try {
      key = JSON.parse(rawKey);
    } catch {
      // JSON parse failed, continue with what we have
    }
  }

  return key;
}

// Initialize auth - uses service account credentials
function getAuth() {
  if (!isGoogleSheetsConfigured()) {
    throw new Error('Google Sheets credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, and GOOGLE_SHEET_ID environment variables.');
  }

  const privateKey = parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY!);

  const credentials = {
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  };

  return new JWT(credentials);
}

// Get spreadsheet instance
async function getSpreadsheet() {
  const auth = getAuth();
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, auth);
  await doc.loadInfo();
  return doc;
}

// Convert row to Idea
function rowToIdea(row: GoogleSpreadsheetRow<Record<string, string>>): Idea {
  const tagsStr = row.get('tags') || '';
  const aiSuggestionsStr = row.get('aiSuggestions') || '';
  const stageHistoryStr = row.get('stageHistory') || '';

  // Parse stageHistory from "stage1|date1;stage2|date2" format
  const stageHistory = stageHistoryStr
    ? stageHistoryStr.split(';').filter(Boolean).map((entry: string) => {
        const [stage, date] = entry.split('|');
        return { stage: stage as Stage, date };
      })
    : [];

  return {
    id: row.get('id'),
    title: row.get('title'),
    description: row.get('description') || '',
    stage: row.get('stage') as Stage,
    type: row.get('type') as IdeaType,
    tags: tagsStr ? tagsStr.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    effort: row.get('effort') as Effort,
    notes: row.get('notes') || '',
    createdAt: row.get('createdAt'),
    updatedAt: row.get('updatedAt'),
    stageHistory,
    aiSuggestions: aiSuggestionsStr ? aiSuggestionsStr.split('|||').filter(Boolean) : undefined,
  };
}

// Convert Idea to row data
function ideaToRow(idea: Idea): Record<string, string> {
  // Convert stageHistory to a simple format: "stage1|date1;stage2|date2"
  const stageHistoryStr = idea.stageHistory
    .map(h => `${h.stage}|${h.date}`)
    .join(';');

  return {
    id: idea.id,
    title: idea.title,
    description: idea.description || '',
    stage: idea.stage,
    type: idea.type,
    tags: idea.tags.join(','),  // Store as comma-separated
    effort: idea.effort,
    notes: idea.notes || '',
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
    stageHistory: stageHistoryStr,
    aiSuggestions: idea.aiSuggestions ? idea.aiSuggestions.join('|||') : '',
  };
}

// Convert row to Theme
function rowToTheme(row: GoogleSpreadsheetRow<Record<string, string>>): Theme {
  return {
    id: row.get('id'),
    title: row.get('title'),
    description: row.get('description') || '',
    occurrences: parseInt(row.get('occurrences') || '0', 10),
    keyMoments: row.get('keyMoments') ? JSON.parse(row.get('keyMoments')) : [],
    linkedIdeas: row.get('linkedIdeas') ? JSON.parse(row.get('linkedIdeas')) : [],
    source: row.get('source') as 'paia' | 'manual',
  };
}

// Convert Theme to row data
function themeToRow(theme: Theme): Record<string, string> {
  return {
    id: theme.id,
    title: theme.title,
    description: theme.description,
    occurrences: theme.occurrences.toString(),
    keyMoments: JSON.stringify(theme.keyMoments),
    linkedIdeas: JSON.stringify(theme.linkedIdeas),
    source: theme.source,
  };
}

// Convert row to Learning
function rowToLearning(row: GoogleSpreadsheetRow<Record<string, string>>): Learning {
  return {
    id: row.get('id'),
    date: row.get('date'),
    title: row.get('title'),
    context: row.get('context') || '',
    discovery: row.get('discovery') || '',
    actionable: row.get('actionable') || '',
    linkedIdeas: row.get('linkedIdeas') ? JSON.parse(row.get('linkedIdeas')) : [],
    source: row.get('source') as 'paia' | 'manual',
  };
}

// Convert Learning to row data
function learningToRow(learning: Learning): Record<string, string> {
  return {
    id: learning.id,
    date: learning.date,
    title: learning.title,
    context: learning.context,
    discovery: learning.discovery,
    actionable: learning.actionable,
    linkedIdeas: JSON.stringify(learning.linkedIdeas),
    source: learning.source,
  };
}

// ============================================
// CRUD Operations
// ============================================

export async function getAllIdeas(): Promise<Idea[]> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Ideas'];
  if (!sheet) return [];

  const rows = await sheet.getRows<Record<string, string>>();
  return rows.map(rowToIdea);
}

export async function getIdea(id: string): Promise<Idea | null> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Ideas'];
  if (!sheet) return null;

  const rows = await sheet.getRows<Record<string, string>>();
  const row = rows.find(r => r.get('id') === id);
  return row ? rowToIdea(row) : null;
}

export async function createIdea(idea: Idea): Promise<Idea> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Ideas'];
  if (!sheet) throw new Error('Ideas sheet not found');

  await sheet.addRow(ideaToRow(idea));
  return idea;
}

export async function updateIdea(id: string, updates: Partial<Idea>): Promise<Idea | null> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Ideas'];
  if (!sheet) return null;

  const rows = await sheet.getRows<Record<string, string>>();
  const row = rows.find(r => r.get('id') === id);
  if (!row) return null;

  const currentIdea = rowToIdea(row);
  const updatedIdea = { ...currentIdea, ...updates, updatedAt: new Date().toISOString() };

  // Track stage changes
  if (updates.stage && updates.stage !== currentIdea.stage) {
    updatedIdea.stageHistory = [
      ...currentIdea.stageHistory,
      { stage: updates.stage, date: new Date().toISOString() }
    ];
  }

  const rowData = ideaToRow(updatedIdea);
  Object.entries(rowData).forEach(([key, value]) => {
    row.set(key, value);
  });
  await row.save();

  return updatedIdea;
}

export async function deleteIdea(id: string): Promise<boolean> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Ideas'];
  if (!sheet) return false;

  const rows = await sheet.getRows<Record<string, string>>();
  const row = rows.find(r => r.get('id') === id);
  if (!row) return false;

  await row.delete();
  return true;
}

// ============================================
// Themes CRUD
// ============================================

export async function getAllThemes(): Promise<Theme[]> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Themes'];
  if (!sheet) return [];

  const rows = await sheet.getRows<Record<string, string>>();
  return rows.map(rowToTheme);
}

export async function createTheme(theme: Theme): Promise<Theme> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Themes'];
  if (!sheet) throw new Error('Themes sheet not found');

  await sheet.addRow(themeToRow(theme));
  return theme;
}

// ============================================
// Learnings CRUD
// ============================================

export async function getAllLearnings(): Promise<Learning[]> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Learnings'];
  if (!sheet) return [];

  const rows = await sheet.getRows<Record<string, string>>();
  return rows.map(rowToLearning);
}

export async function createLearning(learning: Learning): Promise<Learning> {
  const doc = await getSpreadsheet();
  const sheet = doc.sheetsByTitle['Learnings'];
  if (!sheet) throw new Error('Learnings sheet not found');

  await sheet.addRow(learningToRow(learning));
  return learning;
}

// ============================================
// Full data sync (for initial load/export)
// ============================================

export async function getAllData(): Promise<AppData> {
  const [ideas, themes, learnings] = await Promise.all([
    getAllIdeas(),
    getAllThemes(),
    getAllLearnings(),
  ]);

  return {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    ideas,
    themes,
    learnings,
    settings: {
      defaultView: 'dashboard',
      ollamaModel: 'llama3.1:8b',
    },
  };
}

// Initialize sheets with headers (run once)
export async function initializeSheets(): Promise<void> {
  const doc = await getSpreadsheet();

  const ideasHeaders = ['id', 'title', 'description', 'stage', 'type', 'tags', 'effort', 'notes', 'createdAt', 'updatedAt', 'stageHistory', 'aiSuggestions'];
  const themesHeaders = ['id', 'title', 'description', 'occurrences', 'keyMoments', 'linkedIdeas', 'source'];
  const learningsHeaders = ['id', 'date', 'title', 'context', 'discovery', 'actionable', 'linkedIdeas', 'source'];

  // Ideas sheet
  let ideasSheet = doc.sheetsByTitle['Ideas'];
  if (!ideasSheet) {
    ideasSheet = await doc.addSheet({
      title: 'Ideas',
      headerValues: ideasHeaders
    });
  } else {
    // Ensure headers are set
    await ideasSheet.setHeaderRow(ideasHeaders);
  }

  // Themes sheet
  let themesSheet = doc.sheetsByTitle['Themes'];
  if (!themesSheet) {
    themesSheet = await doc.addSheet({
      title: 'Themes',
      headerValues: themesHeaders
    });
  } else {
    await themesSheet.setHeaderRow(themesHeaders);
  }

  // Learnings sheet
  let learningsSheet = doc.sheetsByTitle['Learnings'];
  if (!learningsSheet) {
    learningsSheet = await doc.addSheet({
      title: 'Learnings',
      headerValues: learningsHeaders
    });
  } else {
    await learningsSheet.setHeaderRow(learningsHeaders);
  }
}
