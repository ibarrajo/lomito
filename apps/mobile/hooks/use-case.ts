/**
 * useCase Hook
 * Fetches a single case by ID with related media and timeline.
 * Sets up realtime subscription for timeline updates.
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type {
  Case,
  CaseMedia,
  CaseTimeline,
} from '@lomito/shared/types/database';

interface UseCaseResult {
  caseData: Case | null;
  media: CaseMedia[];
  timeline: CaseTimeline[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCase(caseId: string): UseCaseResult {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [media, setMedia] = useState<CaseMedia[]>([]);
  const [timeline, setTimeline] = useState<CaseTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCase = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch case data
      const { data: caseRecord, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .single();

      if (caseError) throw caseError;

      setCaseData(caseRecord);

      // Fetch media ordered by sort_order
      const { data: mediaRecords, error: mediaError } = await supabase
        .from('case_media')
        .select('*')
        .eq('case_id', caseId)
        .order('sort_order', { ascending: true });

      if (mediaError) throw mediaError;

      setMedia(mediaRecords || []);

      // Fetch timeline ordered by created_at descending
      const { data: timelineRecords, error: timelineError } = await supabase
        .from('case_timeline')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (timelineError) throw timelineError;

      setTimeline(timelineRecords || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch case';
      setError(errorMessage);
      console.error('Error fetching case:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCase();

    // Set up realtime subscription for timeline updates
    const channel = supabase
      .channel(`case_timeline:${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_timeline',
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Add new timeline event to the beginning of the array
            setTimeline((prev) => [payload.new as CaseTimeline, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            // Update existing timeline event
            setTimeline((prev) =>
              prev.map((event) =>
                event.id === payload.new.id
                  ? (payload.new as CaseTimeline)
                  : event,
              ),
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted timeline event
            setTimeline((prev) =>
              prev.filter((event) => event.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, [caseId, fetchCase]);

  return {
    caseData,
    media,
    timeline,
    loading,
    error,
    refetch: fetchCase,
  };
}
