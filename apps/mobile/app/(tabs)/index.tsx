/**
 * Map Screen
 * Full-screen map with case pins, clustering, filters, and summary cards.
 */

import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MapView } from '../../components/map/map-view';
import { ClusterLayer } from '../../components/map/cluster-layer';
import { JurisdictionLayer } from '../../components/map/jurisdiction-layer';
import { CaseSummaryCard } from '../../components/map/case-summary-card';
import { FilterBar } from '../../components/map/filter-bar';
import { useMapFilters } from '../../hooks/use-map-filters';
import { useJurisdictions } from '../../hooks/use-jurisdictions';
import { supabase } from '../../lib/supabase';
import { colors, spacing, shadowStyles, iconSizes } from '@lomito/ui/src/theme/tokens';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const router = useRouter();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [mapBounds, setMapBounds] = useState<{
    west: number;
    south: number;
    east: number;
    north: number;
  } | null>(null);
  const [mapZoom, setMapZoom] = useState(12);

  const {
    selectedCategories,
    selectedStatuses,
    toggleCategory,
    toggleStatus,
    buildQuery,
  } = useMapFilters();

  const { data: jurisdictions } = useJurisdictions({
    bounds: mapBounds,
    zoom: mapZoom,
  });

  useEffect(() => {
    fetchCases();
  }, [selectedCategories, selectedStatuses]);

  async function fetchCases() {
    try {
      let query = supabase
        .from('cases')
        .select('id, category, animal_type, description, status, location, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply filters
      query = buildQuery(query);

      const { data, error } = await query;

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

  function convertToGeoJSON(): GeoJSON.FeatureCollection<GeoJSON.Point, { id: string; category: CaseCategory }> {
    return {
      type: 'FeatureCollection',
      features: cases.map((caseData) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: caseData.location.coordinates,
        },
        properties: {
          id: caseData.id,
          category: caseData.category,
        },
      })),
    };
  }

  function handlePinPress(caseId: string) {
    const caseData = cases.find((c) => c.id === caseId);
    if (caseData) {
      setSelectedCase(caseData);
    }
  }

  function handleCloseCard() {
    setSelectedCase(null);
  }

  function handleViewDetails(caseId: string) {
    // Navigate to case details screen (will be implemented in a later task)
    console.log('View case details:', caseId);
    // router.push(`/cases/${caseId}`);
  }

  function handleNewReport() {
    router.push('/report/new');
  }

  function handleToggleBoundaries() {
    setShowBoundaries((prev) => !prev);
  }

  function handleRegionChange(region: { bounds: { ne: [number, number]; sw: [number, number] }; zoomLevel: number }) {
    const { bounds, zoomLevel } = region;
    setMapBounds({
      west: bounds.sw[0],
      south: bounds.sw[1],
      east: bounds.ne[0],
      north: bounds.ne[1],
    });
    setMapZoom(zoomLevel);
  }

  function handleJurisdictionPress(_jurisdictionId: string, jurisdictionName: string) {
    Alert.alert(
      t('map.jurisdictionInfo', { name: jurisdictionName }),
      '',
      [{ text: t('common.ok') }]
    );
  }

  const geoJSONData = convertToGeoJSON();

  return (
    <View style={styles.container}>
      <FilterBar
        selectedCategories={selectedCategories}
        selectedStatuses={selectedStatuses}
        onToggleCategory={toggleCategory}
        onToggleStatus={toggleStatus}
      />

      {/* Jurisdiction toggle button */}
      <Pressable
        style={styles.jurisdictionToggle}
        onPress={handleToggleBoundaries}
        accessibilityLabel={showBoundaries ? t('map.hideBoundaries') : t('map.showBoundaries')}
        accessibilityRole="button"
      >
        <Text style={styles.jurisdictionToggleText}>
          {showBoundaries ? '🗺️' : '🗺️'}
        </Text>
      </Pressable>

      <MapView onRegionDidChange={handleRegionChange}>
        <ClusterLayer cases={geoJSONData} onPinPress={handlePinPress} />
        <JurisdictionLayer
          data={jurisdictions}
          visible={showBoundaries}
          onPress={handleJurisdictionPress}
        />
      </MapView>

      {selectedCase && (
        <CaseSummaryCard
          caseData={selectedCase}
          onClose={handleCloseCard}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* FAB for New Report */}
      <Pressable
        style={styles.fab}
        onPress={handleNewReport}
        accessibilityLabel={t('report.newReport')}
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  jurisdictionToggle: {
    position: 'absolute',
    top: 80,
    right: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...shadowStyles.card,
  },
  jurisdictionToggleText: {
    fontSize: iconSizes.default,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.md,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyles.elevated,
  },
  fabText: {
    color: colors.white,
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
});
