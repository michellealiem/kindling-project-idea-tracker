'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useApp } from '@/components/AppProvider';
import { DroppableColumn } from '@/components/DroppableColumn';
import { IdeaCard } from '@/components/IdeaCard';
import { SearchBar } from '@/components/SearchBar';
import { Stage } from '@/lib/types';
import { Flame } from 'lucide-react';

const stages: Stage[] = ['spark', 'exploring', 'building', 'shipped', 'paused'];

export default function KanbanPage() {
  const {
    isLoading,
    ideas,
    getIdeasByStage,
    updateIdea,
    openNewIdeaModal,
    openEditIdeaModal,
    filteredIdeas,
    isSearchActive,
    searchQuery,
    setSearchQuery,
    searchFilters,
    setSearchFilters,
    allTags,
  } = useApp();

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const ideaId = active.id as string;
      const newStage = over.id as Stage;

      // Check if dropped on a valid stage column
      if (!stages.includes(newStage)) return;

      // Find the idea being dragged
      const idea = ideas.find((i) => i.id === ideaId);
      if (!idea || idea.stage === newStage) return;

      // Update the stage
      updateIdea(ideaId, { stage: newStage });
    },
    [ideas, updateIdea]
  );

  const activeIdea = activeId ? ideas.find((i) => i.id === activeId) : null;

  // Get ideas for each stage - use filtered if search is active
  const getColumnIdeas = useCallback(
    (stage: Stage) => {
      if (isSearchActive) {
        return filteredIdeas.filter((idea) => idea.stage === stage);
      }
      return getIdeasByStage(stage);
    },
    [isSearchActive, filteredIdeas, getIdeasByStage]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Flame className="w-12 h-12 text-[var(--primary)] animate-pulse" />
          <span className="text-[var(--muted)] font-medium">Stoking the fire...</span>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-6 lg:p-8 h-[calc(100vh-4rem)] lg:h-[calc(100vh-60px)] flex flex-col animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
              Kanban Board
            </h1>
            <p className="text-[var(--muted)]">
              {isSearchActive
                ? `Showing ${filteredIdeas.length} filtered ideas`
                : 'Drag cards to move between stages'}
            </p>
          </div>
          <div className="sm:w-64 lg:w-80">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
              allTags={allTags}
            />
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-4 h-full min-w-max">
            {stages.map((stage) => (
              <DroppableColumn
                key={stage}
                stage={stage}
                ideas={getColumnIdeas(stage)}
                onOpenNewModal={openNewIdeaModal}
                onEditIdea={openEditIdeaModal}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drag overlay for visual feedback */}
      <DragOverlay>
        {activeIdea ? (
          <div className="rotate-2 scale-105 opacity-90">
            <IdeaCard idea={activeIdea} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
