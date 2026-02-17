/**
 * Hook for creating a case
 * Inserts a new case into the database and returns the result.
 */

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type {
  CaseCategory,
  AnimalType,
  UrgencyLevel,
} from '@lomito/shared/types';

interface CreateCaseInput {
  category: CaseCategory;
  animal_type: AnimalType;
  description: string;
  location: { latitude: number; longitude: number };
  location_notes?: string;
  urgency: UrgencyLevel;
  incident_at?: string;
}

interface CreateCaseResult {
  createCase: (data: CreateCaseInput) => Promise<string>;
  loading: boolean;
  error: string | null;
  caseId: string | null;
}

export function useCreateCase(): CreateCaseResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);

  const createCase = async (data: CreateCaseInput): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      // Get the current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        const err = new Error('AUTH_REQUIRED');
        err.name = 'AuthError';
        throw err;
      }

      // Convert location to PostGIS Point format (GeoJSON string for PostgREST)
      const locationPoint = JSON.stringify({
        type: 'Point',
        coordinates: [data.location.longitude, data.location.latitude],
      });

      // Insert the case - using type assertion because Database types may not be fully generated yet
      const insertData = {
        reporter_id: user.id,
        category: data.category,
        animal_type: data.animal_type,
        description: data.description,
        location: locationPoint,
        location_notes: data.location_notes ?? null,
        urgency: data.urgency,
        incident_at: data.incident_at ?? null,
      };

      const { data: newCase, error: insertError } = (await supabase
        .from('cases')
        .insert(insertData as never)
        .select('id')
        .single()) as { data: { id: string } | null; error: unknown };

      if (insertError) {
        throw insertError;
      }

      if (!newCase) {
        throw new Error('Failed to get case ID');
      }

      setCaseId(newCase.id);
      return newCase.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create case');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCase, loading, error, caseId };
}
