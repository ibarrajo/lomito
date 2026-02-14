/**
 * Map Screen
 * Full-screen map with case pins and summary cards.
 */

import { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapView } from '../../components/map/map-view';
import { CasePin } from '../../components/map/case-pin';
import { CaseSummaryCard } from '../../components/map/case-summary-card';
import { supabase } from '../../lib/supabase';
import type { CaseCategory, CaseStatus, AnimalType } from '@lomito/shared/types/database';

interface CaseSummary {
  id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  description: string;
  status: CaseStatus;
  location: { type: 'Point'; coordinates: [number, number] };
  created_at: string;
}

export default function MapScreen() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);

  useEffect(() => {
    fetchCases();
  }, []);

  async function fetchCases() {
    try {
      const { data, error } = await supabase
        .from('cases')
        .select('id, category, animal_type, description, status, location, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching cases:', error);
        return;
      }

      if (data) {
        setCases(data as CaseSummary[]);
      }
    } catch (error) {
      console.error('Unexpected error fetching cases:', error);
    }
  }

  function handlePinPress(caseData: CaseSummary) {
    setSelectedCase(caseData);
  }

  function handleCloseCard() {
    setSelectedCase(null);
  }

  function handleViewDetails(caseId: string) {
    // Navigate to case details screen (will be implemented in a later task)
    console.log('View case details:', caseId);
    // router.push(`/cases/${caseId}`);
  }

  return (
    <View style={styles.container}>
      <MapView>
        {cases.map((caseData) => (
          <CasePin
            key={caseData.id}
            id={caseData.id}
            category={caseData.category}
            longitude={caseData.location.coordinates[0]}
            latitude={caseData.location.coordinates[1]}
            onPress={() => handlePinPress(caseData)}
          />
        ))}
      </MapView>

      {selectedCase && (
        <CaseSummaryCard
          caseData={selectedCase}
          onClose={handleCloseCard}
          onViewDetails={handleViewDetails}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
