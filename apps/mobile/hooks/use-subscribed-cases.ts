import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
  CaseStatus,
} from '@lomito/shared/types/database';

interface SubscribedCase {
  id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  description: string;
  urgency: UrgencyLevel;
  status: CaseStatus;
  location: { type: 'Point'; coordinates: [number, number] };
  created_at: string;
  updated_at: string;
  jurisdiction_id: string | null;
}

interface UseSubscribedCasesResult {
  cases: SubscribedCase[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSubscribedCases(): UseSubscribedCasesResult {
  const [cases, setCases] = useState<SubscribedCase[]>([]);
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

      // Get case IDs from case_subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('case_subscriptions')
        .select('case_id')
        .eq('user_id', user.id);

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
        setError(subsError.message);
        return;
      }

      if (!subscriptions || subscriptions.length === 0) {
        setCases([]);
        setLoading(false);
        return;
      }

      const caseIds = subscriptions.map(
        (sub: { case_id: string }) => sub.case_id,
      );

      // Fetch case details
      const { data, error: queryError } = await supabase
        .from('cases')
        .select(
          'id, category, animal_type, description, urgency, status, location, created_at, updated_at, jurisdiction_id',
        )
        .in('id', caseIds)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (queryError) {
        console.error('Error fetching subscribed cases:', queryError);
        setError(queryError.message);
        return;
      }

      if (data) {
        setCases(data as SubscribedCase[]);
      }
    } catch (err) {
      console.error('Unexpected error fetching subscribed cases:', err);
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
