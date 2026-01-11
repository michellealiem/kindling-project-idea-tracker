'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Idea, SearchFilters } from '@/lib/types';
import { useIdeas } from '@/hooks/useIdeas';
import { parsePAIAData } from '@/lib/paia-parser';
import { buildSparkDevelopmentPrompt } from '@/lib/ollama';
import { Sidebar } from './Sidebar';
import { IdeaModal } from './IdeaModal';
import { ImportModal } from './ImportModal';
import { Embers } from './Embers';
import { MouseSparks } from './MouseSparks';
import { Plus } from 'lucide-react';

const emptyFilters: SearchFilters = {
  stages: [],
  types: [],
  efforts: [],
  tags: [],
};

interface AppContextType {
  // Data
  ideas: Idea[];
  stats: ReturnType<typeof useIdeas>['stats'];
  themes: ReturnType<typeof useIdeas>['themes'];
  learnings: ReturnType<typeof useIdeas>['learnings'];
  isLoading: boolean;

  // Idea operations
  addIdea: ReturnType<typeof useIdeas>['addIdea'];
  updateIdea: ReturnType<typeof useIdeas>['updateIdea'];
  deleteIdea: ReturnType<typeof useIdeas>['deleteIdea'];
  getIdeasByStage: ReturnType<typeof useIdeas>['getIdeasByStage'];
  getRecentIdeas: ReturnType<typeof useIdeas>['getRecentIdeas'];

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  filteredIdeas: Idea[];
  isSearchActive: boolean;
  allTags: string[];

  // Modal controls
  openNewIdeaModal: () => void;
  openEditIdeaModal: (idea: Idea) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const {
    ideas,
    stats,
    themes,
    learnings,
    isLoading,
    addIdea,
    updateIdea,
    deleteIdea,
    getIdeasByStage,
    getRecentIdeas,
    exportToFile,
    importFromJson,
    importPAIAData,
    searchIdeas,
    getAllTags,
  } = useIdeas();

  // Modal state
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // AI suggestion state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>(emptyFilters);

  // Compute filtered ideas
  const isSearchActive =
    searchQuery.trim() !== '' ||
    searchFilters.stages.length > 0 ||
    searchFilters.types.length > 0 ||
    searchFilters.efforts.length > 0 ||
    searchFilters.tags.length > 0;

  const filteredIdeas = useMemo(
    () => (isSearchActive ? searchIdeas(searchQuery, searchFilters) : ideas),
    [isSearchActive, searchQuery, searchFilters, searchIdeas, ideas]
  );

  const allTags = useMemo(() => getAllTags(), [getAllTags]);

  const openNewIdeaModal = useCallback(() => {
    setEditingIdea(null);
    setIdeaModalOpen(true);
  }, []);

  const openEditIdeaModal = useCallback((idea: Idea) => {
    setEditingIdea(idea);
    setIdeaModalOpen(true);
  }, []);

  const closeIdeaModal = useCallback(() => {
    setIdeaModalOpen(false);
    setEditingIdea(null);
    setAiSuggestion(null);
  }, []);

  const handleAISuggest = useCallback(async (ideaData: Partial<Idea>) => {
    setAiLoading(true);
    setAiSuggestion(null);

    try {
      const prompt = buildSparkDevelopmentPrompt(
        ideaData.title || '',
        ideaData.description || ''
      );

      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'spark-development' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI request failed');
      }

      const data = await response.json();
      setAiSuggestion(data.suggestion);
    } catch (error) {
      console.error('AI suggestion error:', error);
      setAiSuggestion(
        error instanceof Error
          ? `Unable to get AI suggestions: ${error.message}`
          : 'Unable to get AI suggestions. Make sure Ollama is running.'
      );
    } finally {
      setAiLoading(false);
    }
  }, []);

  const handleImportPAIA = useCallback(
    (themesMarkdown: string, learningsMarkdown: string) => {
      const { themes, learnings } = parsePAIAData(themesMarkdown, learningsMarkdown);
      importPAIAData(themes, learnings);
    },
    [importPAIAData]
  );

  const contextValue: AppContextType = {
    ideas,
    stats,
    themes,
    learnings,
    isLoading,
    addIdea,
    updateIdea,
    deleteIdea,
    getIdeasByStage,
    getRecentIdeas,
    searchQuery,
    setSearchQuery,
    searchFilters,
    setSearchFilters,
    filteredIdeas,
    isSearchActive,
    allTags,
    openNewIdeaModal,
    openEditIdeaModal,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex min-h-screen bg-[var(--background)] relative">
        {/* Ember particles floating upward */}
        <Embers />

        {/* Mouse-following fire sparks */}
        <MouseSparks />

        <Sidebar
          stats={stats}
          onExport={exportToFile}
          onImportClick={() => setImportModalOpen(true)}
        />

        <main className="flex-1 pb-20 lg:pb-0">{children}</main>

        {/* Floating Action Button (mobile) */}
        <button
          onClick={openNewIdeaModal}
          className="lg:hidden fixed right-6 bottom-24 w-14 h-14 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 z-40 hover:scale-110 active:scale-95"
          aria-label="New Idea"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Modals */}
        <IdeaModal
          idea={editingIdea}
          isOpen={ideaModalOpen}
          onClose={closeIdeaModal}
          onSave={addIdea}
          onUpdate={updateIdea}
          onDelete={deleteIdea}
          onAISuggest={handleAISuggest}
          aiLoading={aiLoading}
          aiSuggestion={aiSuggestion}
        />

        <ImportModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImportJSON={importFromJson}
          onImportPAIA={handleImportPAIA}
        />
      </div>
    </AppContext.Provider>
  );
}
