/**
 * useMapFilters Hook
 * Manages filter state for map screen (category and status filters).
 */

import { useState, useCallback } from 'react';
import type { CaseCategory, CaseStatus } from '@lomito/shared/types/database';

export type FilterValue<T> = T | 'all';

export interface MapFilters {
  selectedCategories: FilterValue<CaseCategory>;
  selectedStatuses: FilterValue<CaseStatus>;
}

// Type for Supabase query builder (simplified to avoid complex generics)
type QueryBuilder = {
  in: (column: string, values: string[]) => QueryBuilder;
  eq: (column: string, value: string) => QueryBuilder;
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
      // If clicking the already-active value, revert to 'all'
      if (prev === category) {
        return 'all';
      }
      // Otherwise, select the new value
      return category;
    });
  }, []);

  const toggleStatus = useCallback((status: CaseStatus | 'all') => {
    if (status === 'all') {
      setSelectedStatuses('all');
      return;
    }

    setSelectedStatuses((prev) => {
      // If clicking the already-active value, revert to 'all'
      if (prev === status) {
        return 'all';
      }
      // Otherwise, select the new value
      return status;
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
      if (selectedCategories !== 'all') {
        filteredQuery = filteredQuery.eq('category', selectedCategories) as T;
      }

      // Apply status filter
      if (selectedStatuses !== 'all') {
        filteredQuery = filteredQuery.eq('status', selectedStatuses) as T;
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
