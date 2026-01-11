'use client';

import { Plus } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { SearchFilters } from '@/lib/types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  allTags: string[];
  onNewIdea: () => void;
  resultCount?: number;
  isSearchActive?: boolean;
}

export function Header({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  allTags,
  onNewIdea,
  resultCount,
  isSearchActive,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="px-4 lg:px-8 py-3 flex items-center gap-4">
        {/* Search */}
        <div className="flex-1">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            filters={filters}
            onFiltersChange={onFiltersChange}
            allTags={allTags}
          />
        </div>

        {/* Result count when filtering */}
        {isSearchActive && resultCount !== undefined && (
          <span className="text-sm text-[var(--muted-foreground)] hidden sm:block">
            {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </span>
        )}

        {/* New Idea button */}
        <button
          onClick={onNewIdea}
          className="hidden lg:flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/20"
        >
          <Plus className="w-4 h-4" />
          New Idea
        </button>
      </div>
    </header>
  );
}
