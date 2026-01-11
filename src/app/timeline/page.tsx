'use client';

import { useApp } from '@/components/AppProvider';
import { Stage, STAGE_CONFIG } from '@/lib/types';
import { Zap, Flame, Lightbulb, CircleDot, Calendar, Crown, Clock, Search } from 'lucide-react';

export default function TimelinePage() {
  const { ideas, isLoading, openEditIdeaModal } = useApp();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Flame className="w-12 h-12 text-[var(--primary)] animate-pulse" />
          <span className="text-[var(--muted)] font-medium">Tracing the flames...</span>
        </div>
      </div>
    );
  }

  // Get all stage changes across all ideas, sorted by date
  // Use startedAt for the first stage entry if available (for backdated projects)
  const timelineEvents = ideas
    .flatMap((idea) =>
      idea.stageHistory.map((entry, index) => {
        // For the first stage entry, use startedAt if available
        const useStartedAt = index === 0 && idea.startedAt;
        return {
          idea,
          stage: entry.stage,
          date: new Date(useStartedAt ? idea.startedAt! : entry.date),
          isBackdated: useStartedAt ? true : false,
        };
      })
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Group by date
  const groupedEvents: Record<string, typeof timelineEvents> = {};
  for (const event of timelineEvents) {
    const dateKey = event.date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!groupedEvents[dateKey]) {
      groupedEvents[dateKey] = [];
    }
    groupedEvents[dateKey].push(event);
  }

  // Stage icons matching the new 7-stage system
  const stageIcons: Record<Stage, React.ReactNode> = {
    spark: <Zap className="w-4 h-4" />,
    exploring: <Search className="w-4 h-4" />,
    building: <Flame className="w-4 h-4" />,
    waiting: <Clock className="w-4 h-4" />,
    simmering: <Flame className="w-4 h-4" />,
    shipped: <Lightbulb className="w-4 h-4" />,
    paused: <CircleDot className="w-4 h-4" />,
  };

  // Stage descriptions for timeline events
  const stageDescriptions: Record<Stage, string> = {
    spark: 'New idea captured',
    exploring: 'Started exploring',
    building: 'Now active',
    waiting: 'Waiting on blockers',
    simmering: 'Now simmering',
    shipped: 'Shipped!',
    paused: 'Paused',
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
          Timeline
        </h1>
        <p className="text-[var(--muted)]">
          Watch your ideas catch fire
        </p>
      </div>

      {timelineEvents.length === 0 ? (
        <div className="text-center py-16 card-base animate-scale-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-[var(--primary)] opacity-60" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
            No timeline yet
          </h2>
          <p className="text-[var(--muted)]">
            Strike your first spark to start the fire
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--spark)] via-[var(--building)] to-[var(--shipped)] opacity-30" />

          {/* Events grouped by date */}
          {Object.entries(groupedEvents).map(([dateKey, events], groupIdx) => (
            <div key={dateKey} className="mb-8 animate-fade-up" style={{ animationDelay: `${groupIdx * 100}ms` }}>
              {/* Date header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative z-10 w-12 lg:w-16 h-12 lg:h-16 flex items-center justify-center bg-[var(--primary)]/10 rounded-full border-2 border-[var(--primary)]/20">
                  <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--primary)]" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--foreground)]">
                  {dateKey}
                </h2>
              </div>

              {/* Events for this date */}
              <div className="ml-12 lg:ml-16 pl-6 border-l-2 border-transparent space-y-4">
                {events.map((event, idx) => {
                  const config = STAGE_CONFIG[event.stage];
                  const isPermasolution = event.idea.type === 'permasolution';
                  const isShipped = event.stage === 'shipped';

                  return (
                    <button
                      key={`${event.idea.id}-${event.stage}-${idx}`}
                      onClick={() => openEditIdeaModal(event.idea)}
                      className={`
                        w-full text-left card-base p-4
                        transition-all duration-300 group
                        ${isShipped ? 'hover:shadow-[var(--shipped)]/10' : ''}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Stage icon */}
                        <div className={`p-2 rounded-lg ${config.bgColor} ${config.color} transition-transform group-hover:scale-110`}>
                          {stageIcons[event.stage]}
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Title and badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] truncate transition-colors">
                              {event.idea.title}
                            </h3>
                            {isPermasolution && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--permasolution)]/10 text-[var(--permasolution)] rounded-full text-xs font-medium animate-shimmer">
                                <Crown className="w-3 h-3" />
                                Perma
                              </span>
                            )}
                            {event.isBackdated && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--muted)]/10 text-[var(--muted)] rounded-full text-xs font-medium">
                                <Clock className="w-3 h-3" />
                                Backdated
                              </span>
                            )}
                          </div>

                          {/* Action description */}
                          <p className={`text-sm ${isShipped ? 'text-[var(--shipped)] font-medium' : 'text-[var(--muted)]'}`}>
                            {stageDescriptions[event.stage]}
                          </p>

                          {/* Time */}
                          <p className="text-xs text-[var(--muted)] mt-1 opacity-70">
                            {event.date.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
