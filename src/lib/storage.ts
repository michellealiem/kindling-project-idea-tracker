// localStorage wrapper for Idea Forge data

import { AppData, Idea, Theme, Learning } from './types';

const STORAGE_KEY = 'idea-forge-data';

const DEFAULT_DATA: AppData = {
  version: '1.0',
  lastUpdated: new Date().toISOString(),
  ideas: [],
  themes: [],
  learnings: [],
  settings: {
    defaultView: 'dashboard',
    ollamaModel: 'llama3.1:8b',
  },
};

export function getData(): AppData {
  if (typeof window === 'undefined') return DEFAULT_DATA;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_DATA;

    const parsed = JSON.parse(stored) as AppData;
    // Ensure all required fields exist (migration safety)
    return {
      ...DEFAULT_DATA,
      ...parsed,
      settings: { ...DEFAULT_DATA.settings, ...parsed.settings },
    };
  } catch {
    console.error('Failed to parse stored data');
    return DEFAULT_DATA;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;

  const updated = {
    ...data,
    lastUpdated: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Idea CRUD operations
export function createIdea(idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory'>): Idea {
  const now = new Date().toISOString();
  return {
    ...idea,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    stageHistory: [{ stage: idea.stage, date: now }],
  };
}

export function updateIdea(data: AppData, id: string, updates: Partial<Idea>): AppData {
  const now = new Date().toISOString();
  const ideas = data.ideas.map((idea) => {
    if (idea.id !== id) return idea;

    const updated = { ...idea, ...updates, updatedAt: now };

    // Track stage changes
    if (updates.stage && updates.stage !== idea.stage) {
      updated.stageHistory = [...idea.stageHistory, { stage: updates.stage, date: now }];
    }

    return updated;
  });

  return { ...data, ideas };
}

export function deleteIdea(data: AppData, id: string): AppData {
  return {
    ...data,
    ideas: data.ideas.filter((idea) => idea.id !== id),
  };
}

// Theme operations
export function addTheme(data: AppData, theme: Omit<Theme, 'id'>): AppData {
  const newTheme: Theme = {
    ...theme,
    id: generateId(),
  };
  return { ...data, themes: [...data.themes, newTheme] };
}

// Learning operations
export function addLearning(data: AppData, learning: Omit<Learning, 'id'>): AppData {
  const newLearning: Learning = {
    ...learning,
    id: generateId(),
  };
  return { ...data, learnings: [...data.learnings, newLearning] };
}

// Export/Import
export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): AppData | null {
  try {
    const parsed = JSON.parse(jsonString) as AppData;
    // Validate required structure
    if (!parsed.ideas || !Array.isArray(parsed.ideas)) {
      throw new Error('Invalid data structure');
    }
    return {
      ...DEFAULT_DATA,
      ...parsed,
      version: parsed.version || '1.0',
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to import data:', error);
    return null;
  }
}

// Download as file
export function downloadData(data: AppData): void {
  const json = exportData(data);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `idea-forge-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Statistics helpers
export function getStats(data: AppData) {
  const byStage = {
    spark: data.ideas.filter((i) => i.stage === 'spark').length,
    exploring: data.ideas.filter((i) => i.stage === 'exploring').length,
    building: data.ideas.filter((i) => i.stage === 'building').length,
    waiting: data.ideas.filter((i) => i.stage === 'waiting').length,
    simmering: data.ideas.filter((i) => i.stage === 'simmering').length,
    shipped: data.ideas.filter((i) => i.stage === 'shipped').length,
    paused: data.ideas.filter((i) => i.stage === 'paused').length,
  };

  const permasolutions = data.ideas.filter((i) => i.type === 'permasolution').length;

  return {
    total: data.ideas.length,
    byStage,
    permasolutions,
    activeBuilding: byStage.building,
    themes: data.themes.length,
    learnings: data.learnings.length,
  };
}
