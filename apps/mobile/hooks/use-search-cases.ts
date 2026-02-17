/**
 * useSearchCases Hook
 * Searches cases by description and folio using full-text search.
 * Debounces the query by 300ms to avoid excessive RPC calls.
 */

import { useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type {
  CaseCategory,
  CaseStatus,
  UrgencyLevel,
} from '@lomito/shared/types/database';

export interface SearchResult {
  id: string;
  category: CaseCategory;
  animal_type: string;
  description: string;
  status: CaseStatus;
  urgency: UrgencyLevel;
  folio: string | null;
  created_at: string;
  location_geojson: { type: 'Point'; coordinates: [number, number] } | null;
  rank: number;
}

export interface UseSearchCasesReturn {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

const DEBOUNCE_DELAY = 300;
const RESULT_LIMIT = 20;

export function useSearchCases(): UseSearchCasesReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: rpcError } = (await (supabase as any).rpc(
        'search_cases',
        {
          search_query: query.trim(),
          result_limit: RESULT_LIMIT,
          result_offset: 0,
        },
      )) as {
        data: Array<{
          id: string;
          category: string;
          animal_type: string;
          description: string;
          status: string;
          urgency: string;
          folio: string | null;
          created_at: string;
          location_geojson: {
            type: 'Point';
            coordinates: [number, number];
          } | null;
          rank: number;
        }> | null;
        error: { message: string } | null;
      };

      if (rpcError) {
        setError(rpcError.message);
        setResults([]);
        return;
      }

      if (data) {
        const mapped: SearchResult[] = data.map((row) => ({
          id: row.id,
          category: row.category as CaseCategory,
          animal_type: row.animal_type,
          description: row.description,
          status: row.status as CaseStatus,
          urgency: row.urgency as UrgencyLevel,
          folio: row.folio,
          created_at: row.created_at,
          location_geojson: row.location_geojson,
          rank: row.rank,
        }));
        setResults(mapped);
      } else {
        setResults([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(
    (query: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);

      debounceTimerRef.current = setTimeout(() => {
        performSearch(query);
      }, DEBOUNCE_DELAY);
    },
    [performSearch],
  );

  const clearResults = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setResults([]);
    setLoading(false);
    setError(null);
  }, []);

  return { results, loading, error, search, clearResults };
}
