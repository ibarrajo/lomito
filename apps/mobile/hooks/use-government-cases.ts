import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
  CaseStatus,
} from '@lomito/shared/types/database';

interface GovernmentCase {
  id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  description: string;
  urgency: UrgencyLevel;
  status: CaseStatus;
  location: { type: 'Point'; coordinates: [number, number] };
  created_at: string;
  jurisdiction_id: string | null;
  reporter_id: string;
  folio: string | null;
  escalated_at: string | null;
  government_response_at: string | null;
}

type FilterStatus = 'all' | 'escalated' | 'pending_response' | 'in_progress' | 'resolved';

interface UseGovernmentCasesOptions {
  statusFilter?: FilterStatus;
}

interface UseGovernmentCasesResult {
  cases: GovernmentCase[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useGovernmentCases(
  options: UseGovernmentCasesOptions = {}
): UseGovernmentCasesResult {
  const { statusFilter = 'all' } = options;
  const [cases, setCases] = useState<GovernmentCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('cases')
        .select(
          'id, category, animal_type, description, urgency, status, location, created_at, jurisdiction_id, reporter_id, folio, escalated_at, government_response_at'
        );

      // Apply status filter
      if (statusFilter === 'escalated') {
        query = query.not('escalated_at', 'is', null);
      } else if (statusFilter === 'pending_response') {
        query = query
          .not('escalated_at', 'is', null)
          .is('government_response_at', null);
      } else if (statusFilter === 'in_progress') {
        query = query.eq('status', 'in_progress');
      } else if (statusFilter === 'resolved') {
        query = query.eq('status', 'resolved');
      }

      // Sort: escalated without response first, then by urgency, then date
      // Build custom order: escalated cases without response at the top
      const { data, error: queryError } = await query;

      if (queryError) {
        console.error('Error fetching government cases:', queryError);
        setError(queryError.message);
        return;
      }

      if (data) {
        // Custom sort: prioritize escalated cases without response
        const sortedData = [...(data as GovernmentCase[])].sort((a, b) => {
          // First: escalated without response
          const aEscalatedNoResponse = a.escalated_at && !a.government_response_at;
          const bEscalatedNoResponse = b.escalated_at && !b.government_response_at;

          if (aEscalatedNoResponse && !bEscalatedNoResponse) return -1;
          if (!aEscalatedNoResponse && bEscalatedNoResponse) return 1;

          // Then: by urgency
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          const urgencyDiff = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
          if (urgencyDiff !== 0) return urgencyDiff;

          // Finally: by date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setCases(sortedData);
      }
    } catch (err) {
      console.error('Unexpected error fetching government cases:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return {
    cases,
    loading,
    error,
    refetch: fetchCases,
  };
}
