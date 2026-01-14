'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Stage, STAGE_CONFIG, Idea } from '@/lib/types';
import { DraggableIdeaCard } from './DraggableIdeaCard';
import { Flame, Clock } from 'lucide-react';

type ActiveStage = 'building' | 'waiting' | 'simmering';

const tabConfig: Record<ActiveStage, { label: string; icon: React.ReactNode }> = {
  building: { label: 'Building', icon: <Flame className="w-4 h-4" /> },
  waiting: { label: 'Waiting', icon: <Clock className="w-4 h-4" /> },
  simmering: { label: 'Simmering', icon: <Flame className="w-4 h-4" /> },
};

// Droppable tab component
function DroppableTab({
  tab,
  count,
  isActive,
  onClick
}: {
  tab: ActiveStage;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: tab });

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      title={tabConfig[tab].label}
      className={`flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-md text-xs font-medium transition-all min-w-0 ${
        isOver
          ? 'bg-[var(--primary)]/20 ring-2 ring-[var(--primary)] scale-105'
          : isActive
            ? 'bg-[var(--card)] text-[var(--foreground)] shadow-sm'
            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
      }`}
      style={{
        borderBottom: isActive && !isOver ? `2px solid var(--${tab}-border)` : undefined,
      }}
    >
      <span className={`flex-shrink-0 ${isActive ? `text-[var(--${tab})]` : ''}`}>
        {tabConfig[tab].icon}
      </span>
      <span className={`flex-shrink-0 min-w-[18px] text-center px-1 py-0.5 rounded-full text-[10px] tabular-nums ${
        isActive
          ? `bg-[var(--${tab})]/20 text-[var(--${tab})]`
          : 'bg-[var(--border)] text-[var(--muted-foreground)]'
      }`}>
        {count}
      </span>
    </button>
  );
}

interface ActiveColumnProps {
  ideas: Record<ActiveStage, Idea[]>;
  onEditIdea: (idea: Idea) => void;
}

export function ActiveColumn({ ideas, onEditIdea }: ActiveColumnProps) {
  const [activeTab, setActiveTab] = useState<ActiveStage>('building');

  const currentIdeas = ideas[activeTab];
  const totalCount = ideas.building.length + ideas.waiting.length + ideas.simmering.length;

  const config = STAGE_CONFIG[activeTab];

  return (
    <div
      className="w-64 sm:w-72 lg:w-80 flex-shrink-0 rounded-2xl p-3 sm:p-4 flex flex-col border-2 transition-all duration-300 border-transparent bg-[var(--background)]"
      style={{
        borderTopColor: `var(--${activeTab}-border)`,
        borderTopWidth: '3px',
        backgroundImage: `linear-gradient(to bottom, var(--${activeTab}-bg) 0%, var(--background) 100px)`
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
            <span className={config.color}>{tabConfig[activeTab].icon}</span>
          </div>
          <h2 className="font-semibold text-[var(--foreground)]">Active</h2>
        </div>
        <span className="px-2.5 py-1 bg-[var(--border)] rounded-full text-sm font-medium text-[var(--muted-foreground)] tabular-nums">
          {totalCount}
        </span>
      </div>

      {/* Tabs - droppable for drag-to-move between sub-stages */}
      <div className="flex gap-1 mb-4 p-1 bg-[var(--muted)]/50 rounded-lg overflow-hidden">
        {(['building', 'waiting', 'simmering'] as ActiveStage[]).map((tab) => (
          <DroppableTab
            key={tab}
            tab={tab}
            count={ideas[tab].length}
            isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          />
        ))}
      </div>

      {/* Cards Container */}
      <SortableContext items={currentIdeas.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
          {currentIdeas.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-transparent rounded-xl">
              <div
                className={`w-12 h-12 mx-auto mb-3 rounded-full ${config.bgColor} flex items-center justify-center`}
              >
                <span className={`${config.color} opacity-50`}>{tabConfig[activeTab].icon}</span>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">
                No {tabConfig[activeTab].label.toLowerCase()} ideas
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1 opacity-60">
                Drag cards to tabs above
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentIdeas.map((idea) => (
                <DraggableIdeaCard key={idea.id} idea={idea} onClick={onEditIdea} />
              ))}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
