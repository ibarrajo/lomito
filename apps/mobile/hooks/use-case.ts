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
  CaseStatus,
  UrgencyLevel,
} from '@lomito/shared/types/database';

/**
 * Fields from a realtime UPDATE payload on the `cases` table that are safe to
 * apply directly (i.e. no PostGIS geometry conversion required).
 */
interface CaseUpdatePayload {
  status: CaseStatus;
  urgency: UrgencyLevel;
  flag_count: number;
  folio: string | null;
  escalated_at: string | null;
  marked_unresponsive: boolean;
  government_response_at: string | null;
  incident_at: string | null;
  updated_at: string;
}

function isCaseUpdatePayload(value: unknown): value is CaseUpdatePayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v['status'] === 'string' &&
    typeof v['urgency'] === 'string' &&
    typeof v['flag_count'] === 'number' &&
    typeof v['marked_unresponsive'] === 'boolean' &&
    typeof v['updated_at'] === 'string'
  );
}

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
      // Fetch case data using RPC to get location as GeoJSON instead of WKB hex
      // The RPC returns an array of records with location_geojson instead of location
      type CaseRPCResult = Omit<Case, 'location'> & {
        location_geojson: { type: 'Point'; coordinates: [number, number] };
      };

      const { data: caseRecords, error: caseError } =
        await // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any).rpc('get_case_by_id', { case_uuid: caseId });

      if (caseError) throw caseError;

      const rawRecord = caseRecords?.[0] as CaseRPCResult | undefined;
      if (!rawRecord) throw new Error('CASE_NOT_FOUND');

      // Map location_geojson to location for Case type compatibility
      const caseRecord: Case = {
        ...rawRecord,
        location: rawRecord.location_geojson,
      };

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
      const errorMessage = err instanceof Error ? err.message : 'FETCH_ERROR';
      setError(errorMessage);
      console.error('Error fetching case:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchCase();

    // Set up realtime subscription for timeline updates
    const timelineChannel = supabase
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

    // Set up realtime subscription for case status changes.
    // The realtime payload carries the raw PostGIS WKB hex in `location`,
    // so we update only the non-location fields and keep the GeoJSON location
    // that was returned by the get_case_by_id RPC on initial fetch.
    const caseChannel = supabase
      .channel(`case_status:${caseId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'cases',
          filter: `id=eq.${caseId}`,
        },
        (payload) => {
          const raw: unknown = payload.new;
          if (!isCaseUpdatePayload(raw)) return;

          setCaseData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              status: raw.status,
              urgency: raw.urgency,
              flag_count: raw.flag_count,
              folio: raw.folio,
              escalated_at: raw.escalated_at,
              marked_unresponsive: raw.marked_unresponsive,
              government_response_at: raw.government_response_at,
              incident_at: raw.incident_at,
              updated_at: raw.updated_at,
            };
          });
        },
      )
      .subscribe();

    // Cleanup both subscriptions on unmount
    return () => {
      timelineChannel.unsubscribe();
      caseChannel.unsubscribe();
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
