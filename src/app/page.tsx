'use client';

import { useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { StatsCard } from '@/components/StatsCard';
import { IdeaCard } from '@/components/IdeaCard';
import { SearchBar } from '@/components/SearchBar';
import {
  Zap,
  Flame,
  Lightbulb,
  Crown,
  Plus,
  Search,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    stats,
    isLoading,
    ideas,
    themes,
    getIdeasByStage,
    getRecentIdeas,
    openNewIdeaModal,
    openEditIdeaModal,
    searchQuery,
    setSearchQuery,
    searchFilters,
    setSearchFilters,
    allTags,
    filteredIdeas,
    isSearchActive,
  } = useApp();

  // Dashboard insights state
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);

  const handleGetInsights = async () => {
    setInsightsLoading(true);
    setInsights(null);

    try {
      const { buildDashboardInsightsPrompt } = await import('@/lib/ollama');
      const prompt = buildDashboardInsightsPrompt(
        ideas.map((i) => ({ title: i.title, type: i.type, stage: i.stage, tags: i.tags })),
        themes.map((t) => ({ title: t.title, description: t.description }))
      );

      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type: 'dashboard-insights' }),
      });

      if (!response.ok) throw new Error('Failed to get insights');

      const data = await response.json();
      setInsights(data.suggestion);
    } catch (error) {
      console.error('Dashboard insights error:', error);
      setInsights('Unable to generate insights. Make sure Ollama is running.');
    } finally {
      setInsightsLoading(false);
    }
  };

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

  const activeIdeas = getIdeasByStage('building');
  const waitingIdeas = getIdeasByStage('waiting');
  const simmeringIdeas = getIdeasByStage('simmering');
  const recentSparks = getIdeasByStage('spark').slice(0, 5);
  const recentShipped = getIdeasByStage('shipped').slice(0, 5);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto animate-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--foreground)]">
            Dashboard
          </h1>
          <p className="text-[var(--muted)]">
            {isSearchActive
              ? `${filteredIdeas.length} ${filteredIdeas.length === 1 ? 'result' : 'results'}`
              : 'Overview of all your ideas and projects'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 sm:w-64 lg:w-80">
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
              allTags={allTags}
            />
          </div>
          <button
            onClick={openNewIdeaModal}
            className="hidden lg:flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[var(--primary)]/20"
          >
            <Plus className="w-5 h-5" />
            New Idea
          </button>
        </div>
      </div>

      {/* Stats Row - Primary stages */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <StatsCard
          label="Ideas"
          value={stats?.byStage.spark ?? 0}
          icon={<Zap className="w-6 h-6" />}
          stage="spark"
        />
        <StatsCard
          label="Exploring"
          value={stats?.byStage.exploring ?? 0}
          icon={<Search className="w-6 h-6" />}
          stage="exploring"
        />
        {/* Active card with Waiting/Simmering badges */}
        <div className="card-base p-4 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Active</p>
              <p className="text-3xl font-bold text-[var(--building)]">
                {stats?.byStage.building ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-[var(--building-bg)]">
              <Flame className="w-6 h-6 text-[var(--building)]" />
            </div>
          </div>
          {/* Sub-badges for Waiting & Simmering */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border)]">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--waiting-bg)] text-xs">
              <Clock className="w-3 h-3 text-[var(--waiting)]" />
              <span className="font-medium text-[var(--waiting)]">{stats?.byStage.waiting ?? 0}</span>
              <span className="text-[var(--muted)]">waiting</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--simmering-bg)] text-xs">
              <Flame className="w-3 h-3 text-[var(--simmering)] opacity-60" />
              <span className="font-medium text-[var(--simmering)]">{stats?.byStage.simmering ?? 0}</span>
              <span className="text-[var(--muted)]">simmering</span>
            </div>
          </div>
        </div>
        <StatsCard
          label="Shipped"
          value={stats?.byStage.shipped ?? 0}
          icon={<Lightbulb className="w-6 h-6" />}
          stage="shipped"
        />
      </div>

      {/* Secondary row - Paused & Eternal Flames */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card-base p-4 opacity-70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Paused</p>
              <p className="text-2xl font-bold text-[var(--muted)]">
                {stats?.byStage.paused ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-[var(--secondary)]">
              <Clock className="w-5 h-5 text-[var(--muted)]" />
            </div>
          </div>
        </div>
        <div className="card-base p-4 bg-gradient-to-br from-[var(--card)] to-amber-50/30 dark:to-amber-900/10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Eternal Flames</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats?.permasolutions ?? 0}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Section */}
      {ideas.length > 0 && (
        <div className="mb-8 card-base p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-r from-[var(--spark-bg)] to-[var(--primary)]/10">
                <Sparkles className="w-5 h-5 text-[var(--spark)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                AI Insights
              </h2>
            </div>
            <button
              onClick={handleGetInsights}
              disabled={insightsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--spark)] to-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {insightsLoading ? (
                <>
                  <Flame className="w-4 h-4 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Portfolio
                </>
              )}
            </button>
          </div>

          {insights ? (
            <div className="prose prose-sm max-w-none text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
              {insights}
            </div>
          ) : (
            <p className="text-[var(--muted)] text-sm">
              Click &quot;Analyze Portfolio&quot; to get AI-powered insights about your ideas and projects.
            </p>
          )}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Currently Active - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Projects */}
          <div className="card-base p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-[var(--building-bg)]">
                <Flame className="w-5 h-5 text-[var(--building)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Currently Active
              </h2>
              {activeIdeas.length > 3 && (
                <span className="text-xs text-[var(--spark)] bg-[var(--spark-bg)] px-2 py-0.5 rounded-full">
                  {activeIdeas.length} active - consider focusing!
                </span>
              )}
            </div>

            {activeIdeas.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--building-bg)] flex items-center justify-center">
                  <Flame className="w-8 h-8 text-[var(--building)] opacity-50" />
                </div>
                <p className="text-[var(--muted)] mb-4">
                  No active projects yet
                </p>
                <button
                  onClick={openNewIdeaModal}
                  className="text-[var(--primary)] font-medium hover:underline underline-offset-4 transition-all"
                >
                  Start building something
                </button>
              </div>
            ) : (
              <div className="grid gap-4 stagger-children">
                {activeIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onClick={openEditIdeaModal}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Waiting & Simmering row */}
          {(waitingIdeas.length > 0 || simmeringIdeas.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Waiting */}
              {waitingIdeas.length > 0 && (
                <div className="card-base p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 rounded-lg bg-[var(--waiting-bg)]">
                      <Clock className="w-4 h-4 text-[var(--waiting)]" />
                    </div>
                    <h3 className="font-medium text-[var(--foreground)]">Waiting</h3>
                    <span className="text-xs text-[var(--muted)]">({waitingIdeas.length})</span>
                  </div>
                  <div className="space-y-2">
                    {waitingIdeas.slice(0, 3).map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onClick={openEditIdeaModal}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Simmering */}
              {simmeringIdeas.length > 0 && (
                <div className="card-base p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1 rounded-lg bg-[var(--simmering-bg)]">
                      <Flame className="w-4 h-4 text-[var(--simmering)] opacity-60" />
                    </div>
                    <h3 className="font-medium text-[var(--foreground)]">Simmering</h3>
                    <span className="text-xs text-[var(--muted)]">({simmeringIdeas.length})</span>
                  </div>
                  <div className="space-y-2">
                    {simmeringIdeas.slice(0, 3).map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onClick={openEditIdeaModal}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Ideas */}
        <div className="space-y-8">
          <div className="card-base p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-[var(--spark-bg)]">
                <Zap className="w-5 h-5 text-[var(--spark)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Recent Ideas
              </h2>
            </div>

            {recentSparks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--spark-bg)] flex items-center justify-center">
                  <Zap className="w-7 h-7 text-[var(--spark)] opacity-50" />
                </div>
                <p className="text-sm text-[var(--muted)]">
                  No ideas yet. Capture your first!
                </p>
              </div>
            ) : (
              <div className="space-y-3 stagger-children">
                {recentSparks.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onClick={openEditIdeaModal}
                    compact
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recently Shipped */}
          <div className="card-base p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-[var(--shipped-bg)]">
                <Lightbulb className="w-5 h-5 text-[var(--shipped)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Recently Shipped
              </h2>
            </div>

            {recentShipped.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--shipped-bg)] flex items-center justify-center">
                  <Lightbulb className="w-7 h-7 text-[var(--shipped)] opacity-50" />
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Ship your first project!
                </p>
              </div>
            ) : (
              <div className="space-y-3 stagger-children">
                {recentShipped.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onClick={openEditIdeaModal}
                    compact
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {stats?.total === 0 && (
        <div className="mt-12 text-center py-16 bg-gradient-to-br from-[var(--spark-bg)] via-[var(--card)] to-[var(--primary)]/5 rounded-3xl border border-[var(--border)] animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--spark)] to-[var(--primary)] flex items-center justify-center animate-spark-glow">
            <Flame className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Welcome to Kindling
          </h2>
          <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">
            Where ideas catch fire. Nurture sparks into blazing beacons.
          </p>
          <button
            onClick={openNewIdeaModal}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[var(--primary)]/20"
          >
            <Plus className="w-5 h-5" />
            Strike Your First Spark
          </button>
        </div>
      )}
    </div>
  );
}
