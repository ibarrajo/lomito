import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
  CaseStatus,
} from '@lomito/shared/types/database';

interface MyCase {
  id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  description: string;
  urgency: UrgencyLevel;
  status: CaseStatus;
  location: { type: 'Point'; coordinates: [number, number] };
  created_at: string;
  jurisdiction_id: string | null;
}

interface UseMyCasesResult {
  cases: MyCase[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMyCases(): UseMyCasesResult {
  const [cases, setCases] = useState<MyCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setCases([]);
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from('cases')
        .select(
          'id, category, animal_type, description, urgency, status, location, created_at, jurisdiction_id',
        )
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (queryError) {
        console.error('Error fetching my cases:', queryError);
        setError(queryError.message);
        return;
      }

      if (data) {
        setCases(data as MyCase[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching my cases:', err);
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
