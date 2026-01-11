'use client';

import { useApp } from '@/components/AppProvider';
import { BookOpen, Lightbulb, Tag, TrendingUp, Calendar, Flame, Sparkles } from 'lucide-react';

export default function InsightsPage() {
  const { themes, learnings, ideas, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Flame className="w-12 h-12 text-[var(--primary)] animate-pulse" />
          <span className="text-[var(--muted)] font-medium">Loading insights...</span>
        </div>
      </div>
    );
  }

  // Calculate tag frequency
  const tagCounts: Record<string, number> = {};
  for (const idea of ideas) {
    for (const tag of idea.tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
          Insights
        </h1>
        <p className="text-[var(--muted)]">
          Themes, learnings, and patterns from your journey
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 stagger-children">
        {/* Recurring Themes */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-lg bg-[var(--exploring-bg)]">
              <BookOpen className="w-5 h-5 text-[var(--exploring)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Recurring Themes
            </h2>
            {themes.length > 0 && (
              <span className="ml-auto px-2.5 py-1 bg-[var(--exploring-bg)] text-[var(--exploring)] rounded-full text-xs font-medium tabular-nums">
                {themes.length} themes
              </span>
            )}
          </div>

          {themes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--exploring-bg)] flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-[var(--exploring)] opacity-50" />
              </div>
              <p className="text-[var(--muted)] mb-2">
                No themes imported yet
              </p>
              <p className="text-sm text-[var(--muted)] opacity-70">
                Import your PAIA themes from the sidebar
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {themes.map((theme, idx) => (
                <div
                  key={theme.id}
                  className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] transition-all hover:border-[var(--exploring)]/30 hover:shadow-sm"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-[var(--foreground)]">
                      {theme.title}
                    </h3>
                    <span className="flex items-center gap-1 px-2 py-1 bg-[var(--exploring-bg)] text-[var(--exploring)] rounded-full text-xs font-medium">
                      <TrendingUp className="w-3 h-3" />
                      {theme.occurrences}x
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)] line-clamp-3">
                    {theme.description}
                  </p>
                  {theme.keyMoments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <p className="text-xs text-[var(--muted)] mb-2">
                        Key moments:
                      </p>
                      <ul className="text-xs text-[var(--muted)] space-y-1">
                        {theme.keyMoments.slice(0, 2).map((moment, idx) => (
                          <li key={idx} className="line-clamp-1 italic">
                            &ldquo;{moment}&rdquo;
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learnings */}
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-lg bg-[var(--spark-bg)]">
              <Lightbulb className="w-5 h-5 text-[var(--spark)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Key Learnings
            </h2>
            {learnings.length > 0 && (
              <span className="ml-auto px-2.5 py-1 bg-[var(--spark-bg)] text-[var(--spark)] rounded-full text-xs font-medium tabular-nums">
                {learnings.length} learnings
              </span>
            )}
          </div>

          {learnings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--spark-bg)] flex items-center justify-center">
                <Lightbulb className="w-8 h-8 text-[var(--spark)] opacity-50" />
              </div>
              <p className="text-[var(--muted)] mb-2">
                No learnings imported yet
              </p>
              <p className="text-sm text-[var(--muted)] opacity-70">
                Import your PAIA learnings from the sidebar
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {learnings.map((learning, idx) => (
                <div
                  key={learning.id}
                  className="p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] transition-all hover:border-[var(--spark)]/30 hover:shadow-sm"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-[var(--muted)] mt-0.5" />
                    <span className="text-xs text-[var(--muted)]">
                      {learning.date}
                    </span>
                  </div>
                  <h3 className="font-medium text-[var(--foreground)] mb-2">
                    {learning.title}
                  </h3>
                  {learning.context && (
                    <p className="text-sm text-[var(--muted)] mb-2 line-clamp-2">
                      <span className="font-medium">Context:</span> {learning.context}
                    </p>
                  )}
                  {learning.discovery && (
                    <p className="text-sm text-[var(--muted)] line-clamp-3">
                      {learning.discovery}
                    </p>
                  )}
                  {learning.actionable && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <p className="text-xs text-[var(--building)]">
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        <span className="font-medium">Actionable:</span> {learning.actionable}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tag Cloud */}
        <div className="lg:col-span-2 card-base p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-1.5 rounded-lg bg-[var(--primary)]/10">
              <Tag className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Tag Cloud
            </h2>
          </div>

          {sortedTags.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <Tag className="w-7 h-7 text-[var(--primary)] opacity-50" />
              </div>
              <p className="text-[var(--muted)]">
                No tags yet. Add tags to your ideas to see patterns.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sortedTags.map(([tag, count], idx) => {
                // Size based on count
                const maxCount = sortedTags[0][1];
                const ratio = count / maxCount;
                const sizeClass =
                  ratio > 0.75
                    ? 'text-lg px-4 py-2'
                    : ratio > 0.5
                      ? 'text-base px-3 py-1.5'
                      : ratio > 0.25
                        ? 'text-sm px-3 py-1'
                        : 'text-xs px-2 py-1';

                // Cycle through stage colors for visual variety
                const colors = [
                  'bg-[var(--spark-bg)] text-[var(--spark)]',
                  'bg-[var(--exploring-bg)] text-[var(--exploring)]',
                  'bg-[var(--building-bg)] text-[var(--building)]',
                  'bg-[var(--shipped-bg)] text-[var(--shipped)]',
                  'bg-[var(--primary)]/10 text-[var(--primary)]',
                ];
                const colorClass = colors[idx % colors.length];

                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all hover:scale-105 cursor-default ${sizeClass} ${colorClass}`}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    {tag}
                    <span className="opacity-60 text-[0.8em]">
                      {count}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
