'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  AppData,
  Idea,
  Theme,
  Learning,
  SearchFilters,
} from '@/lib/types';
import {
  getData,
  saveData,
  createIdea,
  updateIdea as updateIdeaInData,
  deleteIdea as deleteIdeaFromData,
  addTheme,
  addLearning,
  downloadData,
  importData,
  getStats,
} from '@/lib/storage';

export function useIdeas() {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loaded = getData();
    setData(loaded);
    setIsLoading(false);
  }, []);

  // Save whenever data changes
  useEffect(() => {
    if (data && !isLoading) {
      saveData(data);
    }
  }, [data, isLoading]);

  // Idea operations
  const addIdea = useCallback((idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory'>) => {
    setData((prev) => {
      if (!prev) return prev;
      const newIdea = createIdea(idea);
      return { ...prev, ideas: [...prev.ideas, newIdea] };
    });
  }, []);

  const updateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    setData((prev) => {
      if (!prev) return prev;
      return updateIdeaInData(prev, id, updates);
    });
  }, []);

  const deleteIdea = useCallback((id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return deleteIdeaFromData(prev, id);
    });
  }, []);

  // Theme operations
  const importTheme = useCallback((theme: Omit<Theme, 'id'>) => {
    setData((prev) => {
      if (!prev) return prev;
      return addTheme(prev, theme);
    });
  }, []);

  // Learning operations
  const importLearning = useCallback((learning: Omit<Learning, 'id'>) => {
    setData((prev) => {
      if (!prev) return prev;
      return addLearning(prev, learning);
    });
  }, []);

  // Bulk theme/learning import (replaces existing)
  const importPAIAData = useCallback((themes: Omit<Theme, 'id'>[], learnings: Omit<Learning, 'id'>[]) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        themes: themes.map((t, i) => ({ ...t, id: `theme-${Date.now()}-${i}` })),
        learnings: learnings.map((l, i) => ({ ...l, id: `learning-${Date.now()}-${i}` })),
      };
    });
  }, []);

  // Export/Import
  const exportToFile = useCallback(() => {
    if (data) {
      downloadData(data);
    }
  }, [data]);

  const importFromJson = useCallback((jsonString: string): boolean => {
    const imported = importData(jsonString);
    if (imported) {
      setData(imported);
      return true;
    }
    return false;
  }, []);

  // Get ideas by stage
  const getIdeasByStage = useCallback(
    (stage: Idea['stage']) => {
      if (!data) return [];
      return data.ideas.filter((idea) => idea.stage === stage);
    },
    [data]
  );

  // Get recent ideas
  const getRecentIdeas = useCallback(
    (limit = 5) => {
      if (!data) return [];
      return [...data.ideas]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, limit);
    },
    [data]
  );

  // Update settings
  const updateSettings = useCallback((settings: Partial<AppData['settings']>) => {
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, settings: { ...prev.settings, ...settings } };
    });
  }, []);

  // Search and filter ideas
  const searchIdeas = useCallback(
    (query: string, filters: SearchFilters) => {
      if (!data) return [];

      let results = data.ideas;

      // Text search (title, description, notes, tags)
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        results = results.filter(
          (idea) =>
            idea.title.toLowerCase().includes(lowerQuery) ||
            idea.description.toLowerCase().includes(lowerQuery) ||
            idea.notes.toLowerCase().includes(lowerQuery) ||
            idea.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      }

      // Filter by stage
      if (filters.stages.length > 0) {
        results = results.filter((idea) => filters.stages.includes(idea.stage));
      }

      // Filter by type
      if (filters.types.length > 0) {
        results = results.filter((idea) => filters.types.includes(idea.type));
      }

      // Filter by effort
      if (filters.efforts.length > 0) {
        results = results.filter((idea) => filters.efforts.includes(idea.effort));
      }

      // Filter by tags
      if (filters.tags.length > 0) {
        results = results.filter((idea) =>
          filters.tags.some((tag) => idea.tags.includes(tag))
        );
      }

      return results;
    },
    [data]
  );

  // Get all unique tags for filter dropdown
  const getAllTags = useCallback(() => {
    if (!data) return [];
    const tagSet = new Set<string>();
    data.ideas.forEach((idea) => idea.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [data]);

  return {
    data,
    isLoading,
    stats: data ? getStats(data) : null,
    ideas: data?.ideas ?? [],
    themes: data?.themes ?? [],
    learnings: data?.learnings ?? [],
    settings: data?.settings,
    addIdea,
    updateIdea,
    deleteIdea,
    importTheme,
    importLearning,
    importPAIAData,
    exportToFile,
    importFromJson,
    getIdeasByStage,
    getRecentIdeas,
    updateSettings,
    searchIdeas,
    getAllTags,
  };
}
