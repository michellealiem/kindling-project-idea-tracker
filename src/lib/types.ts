// Core data types for Kindling - Where Ideas Catch Fire

export type Stage = 'spark' | 'exploring' | 'building' | 'waiting' | 'simmering' | 'shipped' | 'paused';
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
  startedAt?: string; // Optional: when work actually began (for backdating old projects)
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

// Stage configuration for UI - 7-stage progression
// Idea → Exploring → Active/Waiting/Simmering → Shipped → Paused
export const STAGE_CONFIG: Record<Stage, { label: string; description: string; color: string; bgColor: string; borderColor: string; icon: string }> = {
  spark: {
    label: 'Idea',
    description: 'A new idea just captured, not yet explored',
    color: 'text-[var(--spark)]',
    bgColor: 'bg-[var(--spark-bg)]',
    borderColor: 'border-[var(--spark)]/20',
    icon: 'Zap'
  },
  exploring: {
    label: 'Exploring',
    description: 'Researching, planning, or validating the idea',
    color: 'text-[var(--exploring)]',
    bgColor: 'bg-[var(--exploring-bg)]',
    borderColor: 'border-[var(--exploring)]/20',
    icon: 'Search'
  },
  building: {
    label: 'Active',
    description: 'Currently working on this (try to limit to 1-3)',
    color: 'text-[var(--building)]',
    bgColor: 'bg-[var(--building-bg)]',
    borderColor: 'border-[var(--building)]/20',
    icon: 'Flame'
  },
  waiting: {
    label: 'Waiting',
    description: 'Blocked on feedback, decision, or external dependency',
    color: 'text-[var(--waiting)]',
    bgColor: 'bg-[var(--waiting-bg)]',
    borderColor: 'border-[var(--waiting)]/20',
    icon: 'Clock'
  },
  simmering: {
    label: 'Simmering',
    description: 'Background project with slow, occasional progress',
    color: 'text-[var(--simmering)]',
    bgColor: 'bg-[var(--simmering-bg)]',
    borderColor: 'border-[var(--simmering)]/20',
    icon: 'Flame'
  },
  shipped: {
    label: 'Shipped',
    description: 'Complete and released into the world',
    color: 'text-[var(--shipped)]',
    bgColor: 'bg-[var(--shipped-bg)]',
    borderColor: 'border-[var(--shipped)]/20',
    icon: 'Lightbulb'
  },
  paused: {
    label: 'Paused',
    description: 'On hold - not abandoned, just resting',
    color: 'text-[var(--paused)]',
    bgColor: 'bg-[var(--paused-bg)]',
    borderColor: 'border-[var(--paused)]/20',
    icon: 'CircleDot'
  },
};

export const TYPE_CONFIG: Record<IdeaType, { label: string; color: string; description: string; longDescription: string }> = {
  permasolution: {
    label: 'Eternal Flame',
    color: 'text-[var(--permasolution)]',
    description: 'Build once, burns forever',
    longDescription: 'A solution built once that runs indefinitely without ongoing maintenance. Set it up and forget it.'
  },
  project: {
    label: 'Campfire',
    color: 'text-[var(--exploring)]',
    description: 'Needs tending',
    longDescription: 'A project requiring ongoing attention, updates, or maintenance to keep running.'
  },
  experiment: {
    label: 'Test Spark',
    color: 'text-[var(--spark)]',
    description: 'See if it catches',
    longDescription: 'A quick test or prototype to validate an idea before committing more time.'
  },
  learning: {
    label: 'Torch',
    color: 'text-[var(--primary)]',
    description: 'Light the way',
    longDescription: 'Knowledge acquisition - a skill, concept, or domain to explore and understand.'
  },
};

export const EFFORT_CONFIG: Record<Effort, { label: string; description: string }> = {
  trivial: { label: 'Quick Strike', description: '< 1 hour' },
  small: { label: 'Kindling', description: '1-4 hours' },
  medium: { label: 'Campfire', description: '1-2 days' },
  large: { label: 'Bonfire', description: '1 week+' },
  epic: { label: 'Inferno', description: 'Multi-week' },
};

// Search/Filter types
export interface SearchFilters {
  stages: Stage[];
  types: IdeaType[];
  efforts: Effort[];
  tags: string[];
}
