// Core data types for Kindling - Where Ideas Catch Fire

export type Stage = 'spark' | 'exploring' | 'building' | 'shipped' | 'paused';
export type IdeaType = 'permasolution' | 'project' | 'experiment' | 'learning';
export type Effort = 'trivial' | 'small' | 'medium' | 'large' | 'epic';

export interface StageHistoryEntry {
  stage: Stage;
  date: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  stage: Stage;
  type: IdeaType;
  tags: string[];
  effort: Effort;
  notes: string;
  createdAt: string;
  updatedAt: string;
  stageHistory: StageHistoryEntry[];
  aiSuggestions?: string[];
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  occurrences: number;
  keyMoments: string[];
  linkedIdeas: string[];
  source: 'paia' | 'manual';
}

export interface Learning {
  id: string;
  date: string;
  title: string;
  context: string;
  discovery: string;
  actionable: string;
  linkedIdeas: string[];
  source: 'paia' | 'manual';
}

export interface AppData {
  version: string;
  lastUpdated: string;
  ideas: Idea[];
  themes: Theme[];
  learnings: Learning[];
  settings: {
    defaultView: 'dashboard' | 'kanban' | 'timeline' | 'insights';
    ollamaModel: string;
  };
}

// Stage configuration for UI - Fire-themed progression
// Spark → Kindling → Blazing → Beacon → Banked
export const STAGE_CONFIG: Record<Stage, { label: string; color: string; bgColor: string; borderColor: string; icon: string }> = {
  spark: {
    label: 'Spark',
    color: 'text-[var(--spark)]',
    bgColor: 'bg-[var(--spark-bg)]',
    borderColor: 'border-[var(--spark)]/20',
    icon: 'Zap'
  },
  exploring: {
    label: 'Kindling',
    color: 'text-[var(--exploring)]',
    bgColor: 'bg-[var(--exploring-bg)]',
    borderColor: 'border-[var(--exploring)]/20',
    icon: 'Flame'
  },
  building: {
    label: 'Blazing',
    color: 'text-[var(--building)]',
    bgColor: 'bg-[var(--building-bg)]',
    borderColor: 'border-[var(--building)]/20',
    icon: 'Flame'
  },
  shipped: {
    label: 'Beacon',
    color: 'text-[var(--shipped)]',
    bgColor: 'bg-[var(--shipped-bg)]',
    borderColor: 'border-[var(--shipped)]/20',
    icon: 'Lightbulb'
  },
  paused: {
    label: 'Banked',
    color: 'text-[var(--paused)]',
    bgColor: 'bg-[var(--paused-bg)]',
    borderColor: 'border-[var(--paused)]/20',
    icon: 'CircleDot'
  },
};

export const TYPE_CONFIG: Record<IdeaType, { label: string; color: string; description: string }> = {
  permasolution: { label: 'Eternal Flame', color: 'text-[var(--permasolution)]', description: 'Build once, burns forever' },
  project: { label: 'Campfire', color: 'text-[var(--exploring)]', description: 'Needs tending' },
  experiment: { label: 'Test Spark', color: 'text-[var(--spark)]', description: 'See if it catches' },
  learning: { label: 'Torch', color: 'text-[var(--primary)]', description: 'Light the way' },
};

export const EFFORT_CONFIG: Record<Effort, { label: string; description: string }> = {
  trivial: { label: 'Quick Strike', description: '< 1 hour' },
  small: { label: 'Kindling', description: '1-4 hours' },
  medium: { label: 'Campfire', description: '1-2 days' },
  large: { label: 'Bonfire', description: '1 week+' },
  epic: { label: 'Inferno', description: 'Multi-week' },
};
