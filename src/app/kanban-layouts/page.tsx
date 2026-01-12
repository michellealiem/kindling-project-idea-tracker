'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  CollisionDetection,
} from '@dnd-kit/core';
import { useApp } from '@/components/AppProvider';
import { DroppableColumn } from '@/components/DroppableColumn';
import { IdeaCard } from '@/components/IdeaCard';
import { SearchBar } from '@/components/SearchBar';
import { Stage, Idea } from '@/lib/types';
import { Flame, ChevronRight, ChevronDown, Rows, Columns, Grid, Maximize } from 'lucide-react';

const stages: Stage[] = ['spark', 'exploring', 'building', 'waiting', 'simmering', 'shipped', 'paused'];

type LayoutMode = 'collapsible' | 'swimlane' | 'grouped' | 'responsive';

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  const columnCollisions = pointerCollisions.filter(
    collision => stages.includes(collision.id as Stage)
  );

  if (columnCollisions.length > 0) {
    return columnCollisions;
  }

  const rectCollisions = rectIntersection(args);
  const columnRectCollisions = rectCollisions.filter(
    collision => stages.includes(collision.id as Stage)
  );

  return columnRectCollisions.length > 0 ? columnRectCollisions : rectCollisions;
};

export default function KanbanLayoutsPage() {
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

  const [layoutMode, setLayoutMode] = useState<LayoutMode>('collapsible');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<Stage>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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

      if (!stages.includes(newStage)) return;

      const idea = ideas.find((i) => i.id === ideaId);
      if (!idea || idea.stage === newStage) return;

      updateIdea(ideaId, { stage: newStage });
    },
    [ideas, updateIdea]
  );

  const activeIdea = activeId ? ideas.find((i) => i.id === activeId) : null;

  const getColumnIdeas = useCallback(
    (stage: Stage) => {
      if (isSearchActive) {
        return filteredIdeas.filter((idea) => idea.stage === stage);
      }
      return getIdeasByStage(stage);
    },
    [isSearchActive, filteredIdeas, getIdeasByStage]
  );

  const toggleColumn = (stage: Stage) => {
    const newCollapsed = new Set(collapsedColumns);
    if (newCollapsed.has(stage)) {
      newCollapsed.delete(stage);
    } else {
      newCollapsed.add(stage);
    }
    setCollapsedColumns(newCollapsed);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Flame className="w-12 h-12 text-[var(--primary)] animate-pulse" />
          <span className="text-[var(--muted-foreground)] font-medium">Stoking the fire...</span>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-6 lg:p-8 h-[calc(100vh-4rem)] lg:h-[calc(100vh-60px)] flex flex-col animate-fade-up">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
                Kanban Layout Mockups
              </h1>
              <p className="text-[var(--muted-foreground)]">
                {isSearchActive
                  ? `Showing ${filteredIdeas.length} filtered ideas`
                  : 'Compare different layout approaches'}
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

          {/* Layout Switcher */}
          <div className="flex gap-2 p-1 bg-[var(--muted)] rounded-xl w-fit">
            <button
              onClick={() => setLayoutMode('collapsible')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                layoutMode === 'collapsible'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Columns className="w-4 h-4" />
              Collapsible
            </button>
            <button
              onClick={() => setLayoutMode('swimlane')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                layoutMode === 'swimlane'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Rows className="w-4 h-4" />
              Swimlane
            </button>
            <button
              onClick={() => setLayoutMode('grouped')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                layoutMode === 'grouped'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Grid className="w-4 h-4" />
              Grouped
            </button>
            <button
              onClick={() => setLayoutMode('responsive')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                layoutMode === 'responsive'
                  ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Maximize className="w-4 h-4" />
              Responsive
            </button>
          </div>
        </div>

        {/* Layout: Collapsible Columns */}
        {layoutMode === 'collapsible' && (
          <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-4 h-full min-w-max">
              {stages.map((stage) => {
                const isCollapsed = collapsedColumns.has(stage);
                const stageIdeas = getColumnIdeas(stage);

                return (
                  <div
                    key={stage}
                    className={`flex-shrink-0 rounded-2xl p-3 sm:p-4 flex flex-col border-2 transition-all duration-300 ${
                      isCollapsed ? 'w-16' : 'w-64 sm:w-72 lg:w-80'
                    }`}
                    style={{
                      borderTopColor: `var(--${stage}-border)`,
                      borderTopWidth: '3px',
                      borderColor: 'var(--border)',
                      backgroundImage: `linear-gradient(to bottom, var(--${stage}-bg) 0%, var(--background) 100px)`
                    }}
                  >
                    {/* Column Header */}
                    <button
                      onClick={() => toggleColumn(stage)}
                      className="flex items-center justify-between mb-4 w-full hover:opacity-70 transition-opacity"
                    >
                      {isCollapsed ? (
                        <div className="flex flex-col items-center gap-2 w-full">
                          <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
                          <div className="writing-mode-vertical text-sm font-semibold text-[var(--foreground)]">
                            {stage.toUpperCase()}
                          </div>
                          <span className="px-2 py-1 bg-[var(--border)] rounded-full text-xs font-medium text-[var(--muted-foreground)]">
                            {stageIdeas.length}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-[var(--foreground)] capitalize">{stage}</h2>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-[var(--border)] rounded-full text-sm font-medium text-[var(--muted-foreground)]">
                              {stageIdeas.length}
                            </span>
                            <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                          </div>
                        </>
                      )}
                    </button>

                    {/* Cards Container */}
                    {!isCollapsed && (
                      <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                        {stageIdeas.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-[var(--muted-foreground)]">No ideas here</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {stageIdeas.map((idea) => (
                              <IdeaCard key={idea.id} idea={idea} onClick={openEditIdeaModal} />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Layout: Swimlane (Horizontal Rows) */}
        {layoutMode === 'swimlane' && (
          <div className="flex-1 overflow-y-auto pb-4">
            <div className="space-y-4">
              {stages.map((stage) => {
                const stageIdeas = getColumnIdeas(stage);

                return (
                  <div
                    key={stage}
                    className="rounded-2xl p-4 border-l-4"
                    style={{
                      borderLeftColor: `var(--${stage}-border)`,
                      backgroundImage: `linear-gradient(to right, var(--${stage}-bg) 0%, var(--background) 200px)`
                    }}
                  >
                    {/* Row Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-semibold text-[var(--foreground)] capitalize text-lg">{stage}</h2>
                      <span className="px-3 py-1 bg-[var(--border)] rounded-full text-sm font-medium text-[var(--muted-foreground)]">
                        {stageIdeas.length}
                      </span>
                    </div>

                    {/* Horizontal Card Scroll */}
                    <div className="overflow-x-auto">
                      <div className="flex gap-3 pb-2">
                        {stageIdeas.length === 0 ? (
                          <div className="text-center py-8 px-12 text-sm text-[var(--muted-foreground)]">
                            No ideas in this stage
                          </div>
                        ) : (
                          stageIdeas.map((idea) => (
                            <div key={idea.id} className="w-72 flex-shrink-0">
                              <IdeaCard idea={idea} onClick={openEditIdeaModal} />
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Layout: Grouped Hybrid */}
        {layoutMode === 'grouped' && (
          <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-4 h-full min-w-max">
              {/* Ideation Group */}
              <div className="w-96 flex-shrink-0 rounded-2xl p-4 border-2 bg-gradient-to-b from-violet-50 to-amber-50 dark:from-violet-950/20 dark:to-amber-950/20">
                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">💡 Ideation</h2>
                <div className="space-y-4">
                  {['spark', 'exploring'].map((stage) => {
                    const stageIdeas = getColumnIdeas(stage as Stage);
                    return (
                      <div key={stage}>
                        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase mb-2 flex items-center gap-2">
                          {stage}
                          <span className="px-2 py-0.5 bg-[var(--border)] rounded-full text-xs">{stageIdeas.length}</span>
                        </h3>
                        <div className="space-y-2">
                          {stageIdeas.map((idea) => (
                            <IdeaCard key={idea.id} idea={idea} onClick={openEditIdeaModal} compact />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* In Progress Group */}
              <div className="w-96 flex-shrink-0 rounded-2xl p-4 border-2 bg-gradient-to-b from-orange-50 to-rose-50 dark:from-orange-950/20 dark:to-rose-950/20">
                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">🔥 In Progress</h2>
                <div className="space-y-4">
                  {['building', 'waiting', 'simmering'].map((stage) => {
                    const stageIdeas = getColumnIdeas(stage as Stage);
                    return (
                      <div key={stage}>
                        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase mb-2 flex items-center gap-2">
                          {stage}
                          <span className="px-2 py-0.5 bg-[var(--border)] rounded-full text-xs">{stageIdeas.length}</span>
                        </h3>
                        <div className="space-y-2">
                          {stageIdeas.map((idea) => (
                            <IdeaCard key={idea.id} idea={idea} onClick={openEditIdeaModal} compact />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Complete Group */}
              <div className="w-96 flex-shrink-0 rounded-2xl p-4 border-2 bg-gradient-to-b from-emerald-50 to-slate-50 dark:from-emerald-950/20 dark:to-slate-950/20">
                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">✨ Complete</h2>
                <div className="space-y-4">
                  {['shipped', 'paused'].map((stage) => {
                    const stageIdeas = getColumnIdeas(stage as Stage);
                    return (
                      <div key={stage}>
                        <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase mb-2 flex items-center gap-2">
                          {stage}
                          <span className="px-2 py-0.5 bg-[var(--border)] rounded-full text-xs">{stageIdeas.length}</span>
                        </h3>
                        <div className="space-y-2">
                          {stageIdeas.map((idea) => (
                            <IdeaCard key={idea.id} idea={idea} onClick={openEditIdeaModal} compact />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Layout: Responsive Column Widths */}
        {layoutMode === 'responsive' && (
          <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-4 h-full min-w-max">
              {stages.map((stage) => {
                const stageIdeas = getColumnIdeas(stage);
                const isEmpty = stageIdeas.length === 0;
                const isActive = stage === 'building';

                // Dynamic width based on content and importance
                const width = isEmpty
                  ? 'w-20'
                  : isActive
                  ? 'w-96'
                  : stageIdeas.length > 3
                  ? 'w-80'
                  : 'w-64';

                return (
                  <div
                    key={stage}
                    className={`${width} flex-shrink-0 rounded-2xl p-3 sm:p-4 flex flex-col border-2 transition-all duration-300`}
                    style={{
                      borderTopColor: `var(--${stage}-border)`,
                      borderTopWidth: '3px',
                      borderColor: 'var(--border)',
                      backgroundImage: `linear-gradient(to bottom, var(--${stage}-bg) 0%, var(--background) 100px)`,
                      opacity: isEmpty ? 0.5 : 1
                    }}
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between mb-4">
                      {isEmpty ? (
                        <div className="flex flex-col items-center gap-2 w-full">
                          <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                            {stage.substring(0, 3)}
                          </div>
                          <span className="text-xs text-[var(--muted-foreground)]">0</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <h2 className="font-semibold text-[var(--foreground)] capitalize">{stage}</h2>
                            {isActive && (
                              <span className="px-2 py-0.5 bg-[var(--building)] text-white text-xs rounded-full">
                                Focus
                              </span>
                            )}
                          </div>
                          <span className="px-2.5 py-1 bg-[var(--border)] rounded-full text-sm font-medium text-[var(--muted-foreground)]">
                            {stageIdeas.length}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Cards Container */}
                    {!isEmpty && (
                      <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
                        <div className="space-y-3">
                          {stageIdeas.map((idea) => (
                            <IdeaCard key={idea.id} idea={idea} onClick={openEditIdeaModal} compact={!isActive} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
