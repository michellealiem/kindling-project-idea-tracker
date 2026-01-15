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
  getData as getLocalData,
  saveData as saveLocalData,
  createIdea as createLocalIdea,
  updateIdea as updateIdeaInLocalData,
  deleteIdea as deleteIdeaFromLocalData,
  addTheme,
  addLearning,
  downloadData,
  importData,
  getStats,
} from '@/lib/storage';

// Check if Google Sheets is configured
const isGoogleSheetsConfigured = () => {
  // This will be true if the API is working
  // We'll detect this by trying the API and falling back
  return true;
};

export function useIdeas() {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useApi, setUseApi] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load data on mount - try API first, fall back to localStorage
  useEffect(() => {
    async function loadData() {
      if (useApi) {
        try {
          const response = await fetch('/api/data');
          if (response.ok) {
            const apiData = await response.json();
            setData(apiData);
            // Also save to localStorage as backup
            saveLocalData(apiData);
            setSyncError(null);
          } else {
            throw new Error('API returned error');
          }
        } catch {
          console.log('API unavailable, using localStorage');
          setUseApi(false);
          const localData = getLocalData();
          setData(localData);
          setSyncError('Using offline mode - Google Sheets not configured');
        }
      } else {
        const localData = getLocalData();
        setData(localData);
      }
      setIsLoading(false);
    }

    loadData();
  }, [useApi]);

  // Save to localStorage whenever data changes (backup)
  useEffect(() => {
    if (data && !isLoading) {
      saveLocalData(data);
    }
  }, [data, isLoading]);

  // Idea operations with API support
  const addIdea = useCallback(async (idea: Omit<Idea, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory'>) => {
    // Optimistically update local state
    const localIdea = createLocalIdea(idea);
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, ideas: [...prev.ideas, localIdea] };
    });

    // Try to sync with API
    if (useApi) {
      try {
        const response = await fetch('/api/ideas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(idea),
        });
        if (response.ok) {
          const apiIdea = await response.json();
          // Update with the API-generated idea (may have different ID)
          setData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              ideas: prev.ideas.map(i => i.id === localIdea.id ? apiIdea : i)
            };
          });
        }
      } catch (error) {
        console.error('Failed to sync new idea to API:', error);
      }
    }
  }, [useApi]);

  const updateIdea = useCallback(async (id: string, updates: Partial<Idea>) => {
    // Optimistically update local state
    setData((prev) => {
      if (!prev) return prev;
      return updateIdeaInLocalData(prev, id, updates);
    });

    // Try to sync with API
    if (useApi) {
      try {
        await fetch(`/api/ideas/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
      } catch (error) {
        console.error('Failed to sync update to API:', error);
      }
    }
  }, [useApi]);

  const deleteIdea = useCallback(async (id: string) => {
    // If using API, wait for confirmation before updating local state
    if (useApi) {
      try {
        const response = await fetch(`/api/ideas/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          console.error('Failed to delete from cloud');
          return; // Don't update local state if API failed
        }
      } catch (error) {
        console.error('Failed to sync delete to API:', error);
        return; // Don't update local state if API failed
      }
    }

    // Only update local state after successful API delete (or if not using API)
    setData((prev) => {
      if (!prev) return prev;
      return deleteIdeaFromLocalData(prev, id);
    });
  }, [useApi]);

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

  // Manual sync with Google Sheets
  const syncWithCloud = useCallback(async () => {
    if (!useApi) {
      setSyncError('Google Sheets not configured');
      return false;
    }

    try {
      const response = await fetch('/api/data');
      if (response.ok) {
        const apiData = await response.json();
        setData(apiData);
        setSyncError(null);
        return true;
      }
    } catch (error) {
      setSyncError('Failed to sync with Google Sheets');
      console.error('Sync failed:', error);
    }
    return false;
  }, [useApi]);

  return {
    data,
    isLoading,
    syncError,
    isOnline: useApi,
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
    syncWithCloud,
  };
}
