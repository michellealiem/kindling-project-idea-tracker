'use client';

import { Idea, Stage, STAGE_CONFIG } from '@/lib/types';
import { Clock, Tag, Zap, Flame, Lightbulb, CircleDot, Search, LucideIcon, Target, AlertCircle, Timer, Brain, BookOpen, Users } from 'lucide-react';

interface IdeaCardProps {
  idea: Idea;
  onClick: (idea: Idea) => void;
  compact?: boolean;
}

// Stage icons matching the 7-stage system
const stageIcons: Record<Stage, LucideIcon> = {
  spark: Zap,
  exploring: Search,
  building: Flame,
  waiting: Clock,
  simmering: Flame,
  shipped: Lightbulb,
  paused: CircleDot,
};

// Status bar config for active stages
const statusBarConfig: Record<string, { icon: LucideIcon; placeholder: string; label: string }> = {
  building: { icon: Target, placeholder: 'What feature are you building?', label: 'Focus' },
  waiting: { icon: AlertCircle, placeholder: 'What\'s the blocker?', label: 'Blocked' },
  simmering: { icon: Timer, placeholder: 'Why is this simmering?', label: 'Reason' },
};

export function IdeaCard({ idea, onClick, compact = false }: IdeaCardProps) {
  const stageConfig = STAGE_CONFIG[idea.stage];
  const isSpark = idea.stage === 'spark';
  const isShipped = idea.stage === 'shipped';
  const isActiveStage = ['building', 'waiting', 'simmering'].includes(idea.stage);
  const StageIcon = stageIcons[idea.stage];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Compare dates in local timezone by using date-only components
    const dateLocal = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffDays = Math.floor((nowLocal.getTime() - dateLocal.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (compact) {
    return (
      <button
        onClick={() => onClick(idea)}
        className={`w-full text-left p-3 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)]/30 card-hover group ${isSpark ? 'animate-spark-glow' : ''} border-l-3`}
        style={{
          borderLeftColor: `var(--${idea.stage}-border)`,
          backgroundImage: `linear-gradient(to right, var(--${idea.stage}-bg) 0%, transparent 20%)`
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <StageIcon className={`w-3.5 h-3.5 ${stageConfig.color}`} />
          <span className={`text-xs font-medium ${stageConfig.color}`}>
            {stageConfig.label}
          </span>
        </div>
        <h4 className="font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] line-clamp-1 transition-colors">
          {idea.title}
        </h4>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(idea)}
      className={`w-full text-left p-5 bg-[var(--card)] rounded-2xl border border-[var(--border)] card-hover group animate-fade-up ${isSpark ? 'hover:animate-spark-glow' : ''} ${isShipped ? 'hover:animate-celebrate' : ''} border-l-4 border-l-[var(--${idea.stage}-border)] bg-gradient-to-r from-[var(--${idea.stage}-bg)] to-transparent`}
      style={{
        borderLeftColor: `var(--${idea.stage}-border)`,
        backgroundImage: `linear-gradient(to right, var(--${idea.stage}-bg) 0%, transparent 15%)`
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Stage badge with icon */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${stageConfig.bgColor} ${stageConfig.color} border ${stageConfig.borderColor}`}
          >
            <StageIcon className="w-3.5 h-3.5" />
            {stageConfig.label}
          </span>
        </div>

        {/* Time indicator */}
        <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
          <Clock className="w-3 h-3" />
          {formatDate(idea.updatedAt)}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] mb-2 line-clamp-2 transition-colors">
        {idea.title}
      </h3>

      {/* Description */}
      {idea.description && (
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-3 leading-relaxed">
          {idea.description}
        </p>
      )}

      {/* Status Bar - for active stages */}
      {isActiveStage && (
        <div
          className={`flex items-start gap-2 px-3 py-2 rounded-lg mb-3 border-l-2`}
          style={{
            backgroundColor: `var(--${idea.stage}-bg)`,
            borderLeftColor: `var(--${idea.stage}-border)`,
          }}
        >
          {(() => {
            const config = statusBarConfig[idea.stage];
            const StatusIcon = config.icon;
            return (
              <>
                <StatusIcon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0`} style={{ color: `var(--${idea.stage})` }} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium" style={{ color: `var(--${idea.stage})` }}>
                    {config.label}:
                  </span>
                  <p className="text-xs text-[var(--foreground)] line-clamp-2">
                    {idea.statusNote || (
                      <span className="italic text-[var(--muted-foreground)]">{config.placeholder}</span>
                    )}
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Footer: Tags and PAIA Links */}
      {(idea.tags.length > 0 || idea.memoryLinks?.length || idea.resourceLinks?.length || idea.personLinks?.length) && (
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          {/* Tags */}
          <div className="flex items-center flex-wrap gap-2">
            {idea.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-md text-xs"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
            {idea.tags.length > 2 && (
              <span className="text-xs text-[var(--muted-foreground)]">
                +{idea.tags.length - 2}
              </span>
            )}
          </div>

          {/* PAIA Integration Indicators */}
          <div className="flex items-center gap-2">
            {/* Memory links indicator */}
            {idea.memoryLinks && idea.memoryLinks.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--spark)]" title={`${idea.memoryLinks.length} linked memories`}>
                <Brain className="w-3.5 h-3.5" />
                {idea.memoryLinks.length}
              </span>
            )}
            {/* Resource links indicator */}
            {idea.resourceLinks && idea.resourceLinks.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--exploring)]" title={`${idea.resourceLinks.length} linked resources`}>
                <BookOpen className="w-3.5 h-3.5" />
                {idea.resourceLinks.length}
              </span>
            )}
            {/* Person links indicator */}
            {idea.personLinks && idea.personLinks.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-[var(--primary)]" title={`${idea.personLinks.length} linked people`}>
                <Users className="w-3.5 h-3.5" />
                {idea.personLinks.length}
              </span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}
