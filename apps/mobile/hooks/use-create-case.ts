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
  urgency: UrgencyLevel;
}

interface CreateCaseResult {
  createCase: (data: CreateCaseInput) => Promise<void>;
  loading: boolean;
  error: string | null;
  caseId: string | null;
}

export function useCreateCase(): CreateCaseResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);

  const createCase = async (data: CreateCaseInput) => {
    try {
      setLoading(true);
      setError(null);

      // Get the current user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('You must be logged in to submit a report');
      }

      // Convert location to PostGIS Point format (GeoJSON)
      const locationPoint = {
        type: 'Point' as const,
        coordinates: [data.location.longitude, data.location.latitude],
      };

      // Insert the case - using type assertion because Database types may not be fully generated yet
      const insertData = {
        reporter_id: user.id,
        category: data.category,
        animal_type: data.animal_type,
        description: data.description,
        location: locationPoint,
        urgency: data.urgency,
      };

      const { data: newCase, error: insertError } = (await supabase
        .from('cases')
        .insert(insertData as never)
        .select('id')
        .single()) as { data: { id: string } | null; error: unknown };

      if (insertError) {
        throw insertError;
      }

      if (newCase) {
        setCaseId(newCase.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create case');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createCase, loading, error, caseId };
}
