import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CaseCategory, AnimalType, UrgencyLevel, CaseStatus } from '@lomito/shared/types/database';

interface ModerationCase {
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
}

interface UseModerationQueueResult {
  cases: ModerationCase[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useModerationQueue(): UseModerationQueueResult {
  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase
        .from('cases')
        .select('id, category, animal_type, description, urgency, status, location, created_at, jurisdiction_id, reporter_id')
        .eq('status', 'pending')
        .order('urgency', { ascending: false })
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error('Error fetching moderation queue:', queryError);
        setError(queryError.message);
        return;
      }

      if (data) {
        setCases(data as ModerationCase[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching moderation queue:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

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
