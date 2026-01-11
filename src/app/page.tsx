'use client';

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
} from 'lucide-react';

export default function DashboardPage() {
  const {
    stats,
    isLoading,
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

  const buildingIdeas = getIdeasByStage('building');
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8 stagger-children">
        <StatsCard
          label="Sparks"
          value={stats?.byStage.spark ?? 0}
          icon={<Zap className="w-6 h-6" />}
          stage="spark"
        />
        <StatsCard
          label="Kindling"
          value={stats?.byStage.exploring ?? 0}
          icon={<Flame className="w-6 h-6" />}
          stage="exploring"
        />
        <StatsCard
          label="Blazing"
          value={stats?.byStage.building ?? 0}
          icon={<Flame className="w-6 h-6" />}
          stage="building"
        />
        <StatsCard
          label="Beacons"
          value={stats?.byStage.shipped ?? 0}
          icon={<Lightbulb className="w-6 h-6" />}
          stage="shipped"
        />
        <StatsCard
          label="Eternal Flames"
          value={stats?.permasolutions ?? 0}
          icon={<Crown className="w-6 h-6" />}
          stage="permasolution"
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Currently Building - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="card-base p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-[var(--building-bg)]">
                <Flame className="w-5 h-5 text-[var(--building)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Currently Blazing
              </h2>
            </div>

            {buildingIdeas.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--building-bg)] flex items-center justify-center">
                  <Flame className="w-8 h-8 text-[var(--building)] opacity-50" />
                </div>
                <p className="text-[var(--muted)] mb-4">
                  No flames blazing yet
                </p>
                <button
                  onClick={openNewIdeaModal}
                  className="text-[var(--primary)] font-medium hover:underline underline-offset-4 transition-all"
                >
                  Start a blaze
                </button>
              </div>
            ) : (
              <div className="grid gap-4 stagger-children">
                {buildingIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onClick={openEditIdeaModal}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Sparks */}
        <div className="space-y-8">
          <div className="card-base p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-[var(--spark-bg)]">
                <Zap className="w-5 h-5 text-[var(--spark)]" />
              </div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Recent Sparks
              </h2>
            </div>

            {recentSparks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--spark-bg)] flex items-center justify-center">
                  <Zap className="w-7 h-7 text-[var(--spark)] opacity-50" />
                </div>
                <p className="text-sm text-[var(--muted)]">
                  No sparks yet. Strike your first!
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
                Recent Beacons
              </h2>
            </div>

            {recentShipped.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[var(--shipped-bg)] flex items-center justify-center">
                  <Lightbulb className="w-7 h-7 text-[var(--shipped)] opacity-50" />
                </div>
                <p className="text-sm text-[var(--muted)]">
                  Light your first beacon!
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
