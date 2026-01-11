'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Filter, Zap, Flame, Lightbulb, CircleDot } from 'lucide-react';
import { Stage, IdeaType, Effort, STAGE_CONFIG, TYPE_CONFIG, EFFORT_CONFIG, SearchFilters } from '@/lib/types';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  allTags: string[];
}

const stages: Stage[] = ['spark', 'exploring', 'building', 'shipped', 'paused'];
const types: IdeaType[] = ['permasolution', 'project', 'experiment', 'learning'];
const efforts: Effort[] = ['trivial', 'small', 'medium', 'large', 'epic'];

const stageIcons: Record<Stage, typeof Zap> = {
  spark: Zap,
  exploring: Flame,
  building: Flame,
  shipped: Lightbulb,
  paused: CircleDot,
};

export function SearchBar({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  allTags,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filters when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleStage = (stage: Stage) => {
    const newStages = filters.stages.includes(stage)
      ? filters.stages.filter((s) => s !== stage)
      : [...filters.stages, stage];
    onFiltersChange({ ...filters, stages: newStages });
  };

  const toggleType = (type: IdeaType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];
    onFiltersChange({ ...filters, types: newTypes });
  };

  const toggleEffort = (effort: Effort) => {
    const newEfforts = filters.efforts.includes(effort)
      ? filters.efforts.filter((e) => e !== effort)
      : [...filters.efforts, effort];
    onFiltersChange({ ...filters, efforts: newEfforts });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: newTags });
  };

  const clearFilters = () => {
    onFiltersChange({ stages: [], types: [], efforts: [], tags: [] });
  };

  const hasActiveFilters =
    filters.stages.length > 0 ||
    filters.types.length > 0 ||
    filters.efforts.length > 0 ||
    filters.tags.length > 0;

  const activeFilterCount =
    filters.stages.length + filters.types.length + filters.efforts.length + filters.tags.length;

  return (
    <div className="relative" ref={filterRef}>
      {/* Search input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search ideas..."
            className="w-full pl-10 pr-10 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-[var(--secondary)] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[var(--muted-foreground)]" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative p-2.5 rounded-xl border transition-all ${
            hasActiveFilters
              ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
              : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--foreground)]'
          }`}
        >
          <Filter className="w-4 h-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--primary)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg z-50 animate-scale-in max-w-2xl">
          {/* Stage filters */}
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
              Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {stages.map((stage) => {
                const config = STAGE_CONFIG[stage];
                const Icon = stageIcons[stage];
                const isSelected = filters.stages.includes(stage);
                return (
                  <button
                    key={stage}
                    onClick={() => toggleStage(stage)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? `${config.bgColor} ${config.color}`
                        : 'bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type filters */}
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => {
                const config = TYPE_CONFIG[type];
                const isSelected = filters.types.includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                        : 'bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Effort filters */}
          <div className="mb-4">
            <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
              Effort
            </label>
            <div className="flex flex-wrap gap-2">
              {efforts.map((effort) => {
                const config = EFFORT_CONFIG[effort];
                const isSelected = filters.efforts.includes(effort);
                return (
                  <button
                    key={effort}
                    onClick={() => toggleEffort(effort)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                        : 'bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tag filters */}
          {allTags.length > 0 && (
            <div className="mb-4">
              <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 block">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {allTags.slice(0, 20).map((tag) => {
                  const isSelected = filters.tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[var(--spark)]/20 text-[var(--spark)]'
                          : 'bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-[var(--primary)] hover:underline font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
