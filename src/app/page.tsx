'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
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
import { ActiveColumn } from '@/components/ActiveColumn';
import { IdeaCard } from '@/components/IdeaCard';
import { SearchBar } from '@/components/SearchBar';
import { Stage } from '@/lib/types';
import { Flame } from 'lucide-react';

// Simple columns (not combined)
const simpleStages: Stage[] = ['spark', 'exploring', 'shipped', 'paused'];
// Combined "Active" stages shown with tabs
const activeStages: Stage[] = ['building', 'waiting', 'simmering'];
// All stages for collision detection
const allStages: Stage[] = ['spark', 'exploring', 'building', 'waiting', 'simmering', 'shipped', 'paused'];

// Custom collision detection that prioritizes column drops
// Uses pointerWithin first (more forgiving), falls back to rectIntersection
const customCollisionDetection: CollisionDetection = (args) => {
  // First try pointerWithin (checks if pointer is within droppable)
  const pointerCollisions = pointerWithin(args);

  // Filter to only include stage columns (not cards)
  const columnCollisions = pointerCollisions.filter(
    collision => allStages.includes(collision.id as Stage)
  );

  if (columnCollisions.length > 0) {
    return columnCollisions;
  }

  // Fall back to rect intersection with all droppables
  const rectCollisions = rectIntersection(args);
  const columnRectCollisions = rectCollisions.filter(
    collision => allStages.includes(collision.id as Stage)
  );

  return columnRectCollisions.length > 0 ? columnRectCollisions : rectCollisions;
};

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
  const [collapsedColumns, setCollapsedColumns] = useState<Set<Stage> | null>(null);
  const [hasInitializedCollapse, setHasInitializedCollapse] = useState(false);

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

  // Compute which columns should be auto-collapsed
  const autoCollapsedColumns = useMemo(() => {
    const collapsed = new Set<Stage>();
    // Always collapse Shipped
    collapsed.add('shipped');
    // Collapse empty simple columns (except spark - always show it)
    for (const stage of simpleStages) {
      if (stage !== 'spark' && getColumnIdeas(stage).length === 0) {
        collapsed.add(stage);
      }
    }
    return collapsed;
  }, [getColumnIdeas]);

  // Initialize collapsed state once data is loaded
  useEffect(() => {
    if (!isLoading && !hasInitializedCollapse) {
      setCollapsedColumns(autoCollapsedColumns);
      setHasInitializedCollapse(true);
    }
  }, [isLoading, hasInitializedCollapse, autoCollapsedColumns]);

  const toggleColumn = useCallback((stage: Stage) => {
    setCollapsedColumns(prev => {
      const next = new Set(prev || []);
      if (next.has(stage)) {
        next.delete(stage);
      } else {
        next.add(stage);
      }
      return next;
    });
  }, []);

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
      if (!allStages.includes(newStage)) return;

      // Find the idea being dragged
      const idea = ideas.find((i) => i.id === ideaId);
      if (!idea || idea.stage === newStage) return;

      // Update the stage
      updateIdea(ideaId, { stage: newStage });
    },
    [ideas, updateIdea]
  );

  const activeIdea = activeId ? ideas.find((i) => i.id === activeId) : null;

  // Get ideas for combined Active column (building + waiting + simmering)
  const activeColumnIdeas = useMemo(() => ({
    building: getColumnIdeas('building'),
    waiting: getColumnIdeas('waiting'),
    simmering: getColumnIdeas('simmering'),
  }), [getColumnIdeas]);

  // Use initialized collapsed state, or empty set while loading
  const effectiveCollapsedColumns = collapsedColumns || new Set<Stage>();

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
      <div className="p-6 lg:p-8 pb-24 lg:pb-8 min-h-screen flex flex-col animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
              Kindling
            </h1>
            <p className="text-[var(--muted-foreground)]">
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
          <div className="flex gap-4 items-start min-w-max">
            {/* Spark column */}
            <DroppableColumn
              stage="spark"
              ideas={getColumnIdeas('spark')}
              onOpenNewModal={openNewIdeaModal}
              onEditIdea={openEditIdeaModal}
              isCollapsed={effectiveCollapsedColumns.has('spark')}
              onToggleCollapse={() => toggleColumn('spark')}
            />

            {/* Exploring column */}
            <DroppableColumn
              stage="exploring"
              ideas={getColumnIdeas('exploring')}
              onOpenNewModal={openNewIdeaModal}
              onEditIdea={openEditIdeaModal}
              isCollapsed={effectiveCollapsedColumns.has('exploring')}
              onToggleCollapse={() => toggleColumn('exploring')}
            />

            {/* Combined Active column (Building/Waiting/Simmering) */}
            <ActiveColumn
              ideas={activeColumnIdeas}
              onEditIdea={openEditIdeaModal}
            />

            {/* Shipped column */}
            <DroppableColumn
              stage="shipped"
              ideas={getColumnIdeas('shipped')}
              onOpenNewModal={openNewIdeaModal}
              onEditIdea={openEditIdeaModal}
              isCollapsed={effectiveCollapsedColumns.has('shipped')}
              onToggleCollapse={() => toggleColumn('shipped')}
            />

            {/* Paused column */}
            <DroppableColumn
              stage="paused"
              ideas={getColumnIdeas('paused')}
              onOpenNewModal={openNewIdeaModal}
              onEditIdea={openEditIdeaModal}
              isCollapsed={effectiveCollapsedColumns.has('paused')}
              onToggleCollapse={() => toggleColumn('paused')}
            />
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
