/**
 * Map Screen
 * Full-screen map with case pins, clustering, filters, and summary cards.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MapView } from '../../components/map/map-view';
import { ClusterLayer } from '../../components/map/cluster-layer';
import { JurisdictionLayer } from '../../components/map/jurisdiction-layer';
import { CaseSummaryCard } from '../../components/map/case-summary-card';
import { FilterBar } from '../../components/map/filter-bar';
import { useMapFilters } from '../../hooks/use-map-filters';
import { useJurisdictions } from '../../hooks/use-jurisdictions';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { supabase } from '../../lib/supabase';
import {
  colors,
  spacing,
  shadowStyles,
  iconSizes,
  typography,
} from '@lomito/ui/src/theme/tokens';
import { AppModal } from '@lomito/ui';
import { useTranslation } from 'react-i18next';
import type {
  CaseCategory,
  CaseStatus,
  AnimalType,
} from '@lomito/shared/types/database';

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
  const { isDesktop } = useBreakpoint();
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
  const [jurisdictionModal, setJurisdictionModal] = useState<string | null>(
    null,
  );

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

  const fetchCases = useCallback(async () => {
    try {
      let query = supabase
        .from('cases')
        .select(
          'id, category, animal_type, description, status, location, created_at',
        )
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
  }, [buildQuery]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const geoJSONData = useMemo<
    GeoJSON.FeatureCollection<
      GeoJSON.Point,
      { id: string; category: CaseCategory; status: CaseStatus }
    >
  >(
    () => ({
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
          status: caseData.status,
        },
      })),
    }),
    [cases],
  );

  const handlePinPress = useCallback(
    (caseId: string) => {
      const caseData = cases.find((c) => c.id === caseId);
      if (caseData) {
        setSelectedCase(caseData);
      }
    },
    [cases],
  );

  const handleCloseCard = useCallback(() => {
    setSelectedCase(null);
  }, []);

  const handleViewDetails = useCallback(
    (caseId: string) => {
      router.push(`/case/${caseId}`);
    },
    [router],
  );

  const handleNewReport = useCallback(() => {
    router.push('/report/new');
  }, [router]);

  const handleToggleBoundaries = useCallback(() => {
    setShowBoundaries((prev) => !prev);
  }, []);

  const handleRegionChange = useCallback(
    (region: {
      bounds: { ne: [number, number]; sw: [number, number] };
      zoomLevel: number;
    }) => {
      const { bounds, zoomLevel } = region;
      setMapBounds({
        west: bounds.sw[0],
        south: bounds.sw[1],
        east: bounds.ne[0],
        north: bounds.ne[1],
      });
      setMapZoom(zoomLevel);
    },
    [],
  );

  const handleJurisdictionPress = useCallback(
    (_jurisdictionId: string, jurisdictionName: string) => {
      setJurisdictionModal(
        t('map.jurisdictionInfo', { name: jurisdictionName }),
      );
    },
    [t],
  );

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
        accessibilityLabel={
          showBoundaries ? t('map.hideBoundaries') : t('map.showBoundaries')
        }
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

      {/* FAB for New Report - hidden on desktop web since navbar has CTA */}
      {(Platform.OS !== 'web' || !isDesktop) && (
        <Pressable
          style={styles.fab}
          onPress={handleNewReport}
          accessibilityLabel={t('report.newReport')}
          accessibilityRole="button"
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      )}

      <AppModal
        visible={!!jurisdictionModal}
        title={jurisdictionModal ?? ''}
        actions={[
          { label: t('common.ok'), onPress: () => setJurisdictionModal(null) },
        ]}
        onClose={() => setJurisdictionModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    bottom: spacing.xl,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.md,
    width: 56,
    ...shadowStyles.elevated,
  },
  fabText: {
    color: colors.white,
    fontSize: typography.display.fontSize,
    fontWeight: '300',
    lineHeight: typography.display.fontSize,
  },
  jurisdictionToggle: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.md,
    top: 80,
    width: 44,
    zIndex: 10,
    ...shadowStyles.card,
  },
  jurisdictionToggleText: {
    fontSize: iconSizes.default,
  },
});
