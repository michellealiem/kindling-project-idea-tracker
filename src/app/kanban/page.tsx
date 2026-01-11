'use client';

import { useApp } from '@/components/AppProvider';
import { IdeaCard } from '@/components/IdeaCard';
import { Stage, STAGE_CONFIG } from '@/lib/types';
import { Zap, Flame, Lightbulb, CircleDot, Plus } from 'lucide-react';

// Fire-themed stage icons: Spark → Kindling → Blazing → Beacon → Banked
const stageIcons: Record<Stage, React.ReactNode> = {
  spark: <Zap className="w-5 h-5" />,
  exploring: <Flame className="w-5 h-5" />,
  building: <Flame className="w-5 h-5" />,
  shipped: <Lightbulb className="w-5 h-5" />,
  paused: <CircleDot className="w-5 h-5" />,
};

const stages: Stage[] = ['spark', 'exploring', 'building', 'shipped', 'paused'];

export default function KanbanPage() {
  const { isLoading, getIdeasByStage, openNewIdeaModal, openEditIdeaModal } = useApp();

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
    <div className="p-6 lg:p-8 h-[calc(100vh-4rem)] lg:h-screen flex flex-col animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
            Kanban Board
          </h1>
          <p className="text-[var(--muted)]">
            Fan the flames of your ideas
          </p>
        </div>
        <button
          onClick={openNewIdeaModal}
          className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[var(--primary)]/20"
        >
          <Plus className="w-5 h-5" />
          New Idea
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 h-full min-w-max stagger-children">
          {stages.map((stage) => {
            const config = STAGE_CONFIG[stage];
            const ideas = getIdeasByStage(stage);

            return (
              <div
                key={stage}
                className="w-80 flex-shrink-0 bg-[var(--background)] rounded-2xl p-4 flex flex-col border border-[var(--border)]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                      <span className={config.color}>{stageIcons[stage]}</span>
                    </div>
                    <h2 className="font-semibold text-[var(--foreground)]">
                      {config.label}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 bg-[var(--border)] rounded-full text-sm font-medium text-[var(--muted)] tabular-nums">
                    {ideas.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto space-y-3">
                  {ideas.length === 0 ? (
                    <div className="text-center py-8">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${config.bgColor} flex items-center justify-center`}>
                        <span className={`${config.color} opacity-50`}>{stageIcons[stage]}</span>
                      </div>
                      <p className="text-sm text-[var(--muted)]">No ideas here</p>
                      {stage === 'spark' && (
                        <button
                          onClick={openNewIdeaModal}
                          className="mt-2 text-[var(--primary)] text-sm hover:underline underline-offset-4"
                        >
                          Add your first spark
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3 stagger-children">
                      {ideas.map((idea) => (
                        <IdeaCard
                          key={idea.id}
                          idea={idea}
                          onClick={openEditIdeaModal}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Button */}
                {stage === 'spark' && (
                  <button
                    onClick={openNewIdeaModal}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--muted)] hover:border-[var(--spark)] hover:text-[var(--spark)] transition-all duration-300 group"
                  >
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
                    New Spark
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
