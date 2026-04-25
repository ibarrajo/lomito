import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardStats {
  total_cases: number;
  resolved_cases: number;
  pending_cases: number;
  in_progress_cases: number;
  abuse_cases: number;
  stray_cases: number;
  missing_cases: number;
  total_donations: number;
  avg_resolution_days: number;
}

interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: queryError } = await supabase.rpc(
        'get_dashboard_stats',
      );

      if (queryError) {
        console.error('Error fetching dashboard stats:', queryError);
        setError(queryError.message);
        return;
      }

      if (data) {
        // RPC returns Json from supabase-js generated types; this RPC's
        // server-side function returns a single jsonb object matching
        // DashboardStats. The runtime guarantee comes from the SQL function
        // signature, not the TS types — narrow via `unknown` to satisfy strict
        // checking.
        setStats(data as unknown as DashboardStats);
      }
    } catch (err) {
      console.error('Unexpected error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
