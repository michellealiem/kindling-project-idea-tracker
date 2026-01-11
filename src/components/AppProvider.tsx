'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Idea } from '@/lib/types';
import { useIdeas } from '@/hooks/useIdeas';
import { parsePAIAData } from '@/lib/paia-parser';
import { Sidebar } from './Sidebar';
import { IdeaModal } from './IdeaModal';
import { ImportModal } from './ImportModal';
import { Embers } from './Embers';
import { Plus } from 'lucide-react';

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
  } = useIdeas();

  // Modal state
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

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
    openNewIdeaModal,
    openEditIdeaModal,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex min-h-screen bg-[var(--background)] relative">
        {/* Ember particles floating upward */}
        <Embers />

        <Sidebar
          stats={stats}
          onExport={exportToFile}
          onImportClick={() => setImportModalOpen(true)}
        />

        <main className="flex-1 lg:ml-0 pb-20 lg:pb-0">{children}</main>

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
