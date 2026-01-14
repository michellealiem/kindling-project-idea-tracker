'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Stage, STAGE_CONFIG, Idea } from '@/lib/types';
import { DraggableIdeaCard } from './DraggableIdeaCard';
import { Zap, Flame, Lightbulb, CircleDot, Plus, Clock, Search, ChevronRight, ChevronDown } from 'lucide-react';

const stageIcons: Record<Stage, React.ReactNode> = {
  spark: <Zap className="w-5 h-5" />,
  exploring: <Search className="w-5 h-5" />,
  building: <Flame className="w-5 h-5" />,
  waiting: <Clock className="w-5 h-5" />,
  simmering: <Flame className="w-5 h-5" />,
  shipped: <Lightbulb className="w-5 h-5" />,
  paused: <CircleDot className="w-5 h-5" />,
};

interface DroppableColumnProps {
  stage: Stage;
  ideas: Idea[];
  onOpenNewModal: () => void;
  onEditIdea: (idea: Idea) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function DroppableColumn({
  stage,
  ideas,
  onOpenNewModal,
  onEditIdea,
  isCollapsed = false,
  onToggleCollapse,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const config = STAGE_CONFIG[stage];

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 rounded-2xl p-3 sm:p-4 flex flex-col border-2 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64 sm:w-72 lg:w-80'
      } ${
        isOver
          ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg shadow-[var(--primary)]/10'
          : 'border-transparent bg-[var(--background)]'
      }`}
      style={{
        borderTopColor: isOver ? undefined : `var(--${stage}-border)`,
        borderTopWidth: isOver ? undefined : '3px',
        backgroundImage: isOver ? undefined : `linear-gradient(to bottom, var(--${stage}-bg) 0%, var(--background) 100px)`
      }}
    >
      {/* Column Header */}
      {isCollapsed ? (
        <button
          onClick={onToggleCollapse}
          className="flex flex-col items-center gap-3 py-2 w-full hover:opacity-70 transition-opacity"
        >
          <ChevronRight className="w-5 h-5 text-[var(--muted-foreground)]" />
          <div className="writing-vertical text-sm font-semibold text-[var(--foreground)]">
            {config.label}
          </div>
          <span className="px-2 py-1 bg-[var(--border)] rounded-full text-xs font-medium text-[var(--muted-foreground)] tabular-nums">
            {ideas.length}
          </span>
        </button>
      ) : (
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-between mb-4 w-full hover:opacity-70 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
              <span className={config.color}>{stageIcons[stage]}</span>
            </div>
            <h2 className="font-semibold text-[var(--foreground)]">{config.label}</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-[var(--border)] rounded-full text-sm font-medium text-[var(--muted-foreground)] tabular-nums">
              {ideas.length}
            </span>
            <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
          </div>
        </button>
      )}

      {/* Cards Container - only show when expanded */}
      {!isCollapsed && (
        <SortableContext items={ideas.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
            {ideas.length === 0 ? (
              <div
                className={`text-center py-8 border-2 border-dashed rounded-xl transition-colors ${
                  isOver ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-transparent'
                }`}
              >
                <div
                  className={`w-12 h-12 mx-auto mb-3 rounded-full ${config.bgColor} flex items-center justify-center`}
                >
                  <span className={`${config.color} opacity-50`}>{stageIcons[stage]}</span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {isOver ? 'Drop here' : 'No ideas here'}
                </p>
                {stage === 'spark' && !isOver && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewModal();
                    }}
                    className="mt-2 text-[var(--primary)] text-sm hover:underline underline-offset-4"
                  >
                    Add your first spark
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {ideas.map((idea) => (
                  <DraggableIdeaCard key={idea.id} idea={idea} onClick={onEditIdea} />
                ))}
              </div>
            )}
          </div>
        </SortableContext>
      )}

      {/* Add Button - only show when expanded */}
      {!isCollapsed && stage === 'spark' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenNewModal();
          }}
          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--muted)] hover:border-[var(--spark)] hover:text-[var(--spark)] transition-all duration-300 group"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
          New Spark
        </button>
      )}
    </div>
  );
}
