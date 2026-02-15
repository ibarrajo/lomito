/**
 * useMapFilters Hook
 * Manages filter state for map screen (category and status filters).
 */

import { useState, useCallback } from 'react';
import type { CaseCategory, CaseStatus } from '@lomito/shared/types/database';

export type FilterValue<T> = Set<T> | 'all';

export interface MapFilters {
  selectedCategories: FilterValue<CaseCategory>;
  selectedStatuses: FilterValue<CaseStatus>;
}

// Type for Supabase query builder (simplified to avoid complex generics)
type QueryBuilder = {
  in: (column: string, values: unknown[]) => QueryBuilder;
};

export interface MapFiltersReturn extends MapFilters {
  toggleCategory: (category: CaseCategory | 'all') => void;
  toggleStatus: (status: CaseStatus | 'all') => void;
  clearFilters: () => void;
  buildQuery: <T extends QueryBuilder>(query: T) => T;
}

export function useMapFilters(): MapFiltersReturn {
  const [selectedCategories, setSelectedCategories] =
    useState<FilterValue<CaseCategory>>('all');
  const [selectedStatuses, setSelectedStatuses] =
    useState<FilterValue<CaseStatus>>('all');

  const toggleCategory = useCallback((category: CaseCategory | 'all') => {
    if (category === 'all') {
      setSelectedCategories('all');
      return;
    }

    setSelectedCategories((prev) => {
      if (prev === 'all') {
        return new Set([category]);
      }

      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }

      return newSet.size === 0 ? 'all' : newSet;
    });
  }, []);

  const toggleStatus = useCallback((status: CaseStatus | 'all') => {
    if (status === 'all') {
      setSelectedStatuses('all');
      return;
    }

    setSelectedStatuses((prev) => {
      if (prev === 'all') {
        return new Set([status]);
      }

      const newSet = new Set(prev);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }

      return newSet.size === 0 ? 'all' : newSet;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories('all');
    setSelectedStatuses('all');
  }, []);

  const buildQuery = useCallback(
    <T extends QueryBuilder>(query: T): T => {
      let filteredQuery = query;

      // Apply category filter
      if (selectedCategories !== 'all' && selectedCategories.size > 0) {
        const categories = Array.from(selectedCategories);
        filteredQuery = filteredQuery.in('category', categories) as T;
      }

      // Apply status filter
      if (selectedStatuses !== 'all' && selectedStatuses.size > 0) {
        const statuses = Array.from(selectedStatuses);
        filteredQuery = filteredQuery.in('status', statuses) as T;
      }

      return filteredQuery;
    },
    [selectedCategories, selectedStatuses],
  );

  return {
    selectedCategories,
    selectedStatuses,
    toggleCategory,
    toggleStatus,
    clearFilters,
    buildQuery,
  };
}
