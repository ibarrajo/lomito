/**
 * Map Screen
 * Full-screen map with case pins, clustering, filters, and summary cards.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MapView } from '../../components/map/map-view';
import { ClusterLayer } from '../../components/map/cluster-layer';
import { PoiLayer } from '../../components/map/poi-layer';
import { JurisdictionLayer } from '../../components/map/jurisdiction-layer';
import { JurisdictionInfoModal } from '../../components/map/jurisdiction-info-modal';
import { PoiDetailModal } from '../../components/map/poi-detail-modal';
import { CaseSummaryCard } from '../../components/map/case-summary-card';
import { FilterBar } from '../../components/map/filter-bar';
import { MapFilterSidebar } from '../../components/map/map-filter-sidebar';
import { MapActivityPanel } from '../../components/map/map-activity-panel';
import { useMapFilters } from '../../hooks/use-map-filters';
import { useJurisdictions } from '../../hooks/use-jurisdictions';
import { usePois } from '../../hooks/use-pois';
import { useBreakpoint } from '../../hooks/use-breakpoint';
import { useAnalytics } from '../../hooks/use-analytics';
import { useSearchCases } from '../../hooks/use-search-cases';
import { supabase } from '../../lib/supabase';
import {
  colors,
  spacing,
  shadowStyles,
  borderRadius,
  iconSizes,
  typography,
} from '@lomito/ui/src/theme/tokens';
import { useTranslation } from 'react-i18next';
import type {
  CaseCategory,
  CaseStatus,
  AnimalType,
  UrgencyLevel,
  PoiType,
  PointOfInterest,
} from '@lomito/shared/types/database';
import type { SearchResult } from '../../hooks/use-search-cases';

interface CaseSummary {
  id: string;
  category: CaseCategory;
  animal_type: AnimalType;
  description: string;
  status: CaseStatus;
  urgency: UrgencyLevel;
  location: { type: 'Point'; coordinates: [number, number] };
  created_at: string;
}

export default function MapScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDesktop } = useBreakpoint();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);
  const [showBoundaries, setShowBoundaries] = useState(false);
  const [mapBounds, setMapBounds] = useState<{
    west: number;
    south: number;
    east: number;
    north: number;
  } | null>(null);
  const [mapZoom, setMapZoom] = useState(12);
  const [displayMode, setDisplayMode] = useState<
    'pins' | 'heatmap' | 'clusters'
  >('clusters');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const [showGovOffices, setShowGovOffices] = useState(false);
  const [showShelters, setShowShelters] = useState(false);
  const [showClinics, setShowClinics] = useState(false);

  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest | null>(null);

  const toggleGovOffices = useCallback(
    () => setShowGovOffices((prev) => !prev),
    [],
  );
  const toggleShelters = useCallback(
    () => setShowShelters((prev) => !prev),
    [],
  );
  const toggleClinics = useCallback(() => setShowClinics((prev) => !prev), []);

  const enabledPoiTypes = useMemo<PoiType[]>(() => {
    const types: PoiType[] = [];
    if (showGovOffices) types.push('government_office');
    if (showShelters) types.push('animal_shelter');
    if (showClinics) types.push('vet_clinic');
    return types;
  }, [showGovOffices, showShelters, showClinics]);

  const { data: poiData } = usePois({
    bounds: mapBounds,
    enabledTypes: enabledPoiTypes,
  });

  const showPois = enabledPoiTypes.length > 0;

  const handlePoiPress = useCallback((poi: PointOfInterest) => {
    setSelectedPoi(poi);
  }, []);

  const {
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    search,
    clearResults,
  } = useSearchCases();

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
      search(text);
    },
    [search],
  );

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    // Small delay so result row tap can register before overlay closes
    setTimeout(() => setSearchFocused(false), 150);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
    clearResults();
    setSearchFocused(false);
    searchInputRef.current?.blur();
  }, [clearResults]);

  const handleSearchResultPress = useCallback(
    (caseId: string) => {
      handleSearchClear();
      router.push(`/case/${caseId}`);
    },
    [handleSearchClear, router],
  );

  const showSearchDropdown =
    searchFocused && (searchQuery.trim().length > 0 || searchLoading);

  const {
    selectedCategories,
    selectedStatuses,
    toggleCategory: _toggleCategory,
    toggleStatus: _toggleStatus,
    clearFilters: _clearFilters,
  } = useMapFilters();
  const { trackEvent } = useAnalytics();

  const toggleCategory = useCallback(
    (category: Parameters<typeof _toggleCategory>[0]) => {
      _toggleCategory(category);
      trackEvent('map_filter_applied', {
        filter_type: 'category',
        filter_value: category,
      });
    },
    [_toggleCategory, trackEvent],
  );

  const toggleStatus = useCallback(
    (status: Parameters<typeof _toggleStatus>[0]) => {
      _toggleStatus(status);
      trackEvent('map_filter_applied', {
        filter_type: 'status',
        filter_value: status,
      });
    },
    [_toggleStatus, trackEvent],
  );

  const clearFilters = useCallback(() => {
    _clearFilters();
    trackEvent('map_filter_cleared', {});
  }, [_clearFilters, trackEvent]);

  const { data: jurisdictions } = useJurisdictions({
    bounds: mapBounds,
    zoom: mapZoom,
  });

  const fetchCases = useCallback(async () => {
    try {
      setIsLoading(true);

      // Build filter arrays from selected categories/statuses
      const filterCategories =
        selectedCategories !== 'all' ? [selectedCategories] : null;
      const filterStatuses =
        selectedStatuses !== 'all' ? [selectedStatuses] : null;

      // Use RPC function to get cases with GeoJSON locations
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = (await (supabase as any).rpc(
        'get_cases_for_map',
        {
          limit_count: 100,
          filter_categories: filterCategories,
          filter_statuses: filterStatuses,
        },
      )) as {
        data: Array<{
          id: string;
          category: string;
          animal_type: string;
          description: string;
          status: string;
          urgency: string;
          location_geojson: { type: 'Point'; coordinates: [number, number] };
          created_at: string;
        }> | null;
        error: { message: string } | null;
      };

      if (error) {
        console.error('Error fetching cases:', error);
        return;
      }

      if (data) {
        // Map the RPC result to our CaseSummary type
        const mappedCases = data.map((row) => ({
          id: row.id,
          category: row.category as CaseCategory,
          animal_type: row.animal_type as AnimalType,
          description: row.description,
          status: row.status as CaseStatus,
          urgency: row.urgency as UrgencyLevel,
          location: row.location_geojson,
          created_at: row.created_at,
        }));
        setCases(mappedCases);
      }
    } catch (error) {
      console.error('Unexpected error fetching cases:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategories, selectedStatuses]);

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
    (jurisdictionId: string, jurisdictionName: string) => {
      setSelectedJurisdiction({ id: jurisdictionId, name: jurisdictionName });
    },
    [],
  );

  const handleViewAll = useCallback(() => {
    // TODO: navigate to a full case list page when available
  }, []);

  const isDesktopWeb = Platform.OS === 'web' && isDesktop;

  // Helper: format time since creation
  const formatTimeAgo = useCallback((isoDate: string): string => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  }, []);

  // Helper: get category pin color
  const getCategoryColor = useCallback((category: CaseCategory): string => {
    const map: Record<CaseCategory, string> = {
      abuse: colors.category.abuse.pin,
      injured: colors.category.injured.pin,
      missing: colors.category.missing.pin,
      stray: colors.category.stray.pin,
      zoonotic: colors.category.zoonotic.pin,
      dead_animal: colors.category.dead_animal.pin,
      dangerous_dog: colors.category.dangerous_dog.pin,
      distress: colors.category.distress.pin,
      illegal_sales: colors.category.illegal_sales.pin,
      wildlife: colors.category.wildlife.pin,
      noise_nuisance: colors.category.noise_nuisance.pin,
    };
    return map[category] ?? colors.neutral500;
  }, []);

  // Render a single search result row
  const renderSearchResult = useCallback(
    ({ item }: { item: SearchResult }) => (
      <Pressable
        style={styles.searchResultRow}
        onPress={() => handleSearchResultPress(item.id)}
        accessibilityLabel={`${t(`category.${item.category}`)} — ${item.description}`}
        accessibilityRole="button"
      >
        <View
          style={[
            styles.searchResultBadge,
            { backgroundColor: getCategoryColor(item.category) },
          ]}
        >
          <Text style={styles.searchResultBadgeText}>
            {t(`category.${item.category}`)}
          </Text>
        </View>
        <View style={styles.searchResultBody}>
          <Text style={styles.searchResultDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.searchResultMeta}>
            {item.folio ? (
              <Text style={styles.searchResultFolio}>{item.folio}</Text>
            ) : null}
            <Text style={styles.searchResultTime}>
              {formatTimeAgo(item.created_at)}
            </Text>
          </View>
        </View>
      </Pressable>
    ),
    [t, handleSearchResultPress, getCategoryColor, formatTimeAgo],
  );

  // Desktop web: 3-column layout
  if (isDesktopWeb) {
    return (
      <View style={styles.desktopContainer}>
        <MapFilterSidebar
          selectedCategories={selectedCategories}
          selectedStatuses={selectedStatuses}
          onToggleCategory={toggleCategory}
          onToggleStatus={toggleStatus}
          onReset={clearFilters}
          showGovOffices={showGovOffices}
          showShelters={showShelters}
          showClinics={showClinics}
          onToggleGovOffices={toggleGovOffices}
          onToggleShelters={toggleShelters}
          onToggleClinics={toggleClinics}
        />

        <View style={styles.mapColumn}>
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={t('map.searchPlaceholder')}
              placeholderTextColor={colors.neutral400}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              accessibilityLabel={t('map.searchPlaceholder')}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && Platform.OS !== 'ios' && (
              <Pressable
                style={styles.searchClearButton}
                onPress={handleSearchClear}
                accessibilityLabel={t('common.close')}
                accessibilityRole="button"
              >
                <Text style={styles.searchClearText}>x</Text>
              </Pressable>
            )}
          </View>

          {/* Search results dropdown */}
          {showSearchDropdown && (
            <View style={styles.searchDropdown}>
              {searchLoading && (
                <View style={styles.searchLoadingRow}>
                  <ActivityIndicator
                    size="small"
                    color={colors.primary}
                    accessibilityLabel={t('common.loading')}
                  />
                </View>
              )}
              {!searchLoading && searchError && (
                <View style={styles.searchMessageRow}>
                  <Text style={styles.searchMessageText}>
                    {t('map.searchError')}
                  </Text>
                </View>
              )}
              {!searchLoading && !searchError && searchResults.length === 0 && (
                <View style={styles.searchMessageRow}>
                  <Text style={styles.searchMessageText}>
                    {t('map.searchNoResults')}
                  </Text>
                </View>
              )}
              {!searchLoading && searchResults.length > 0 && (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSearchResult}
                  style={styles.searchResultsList}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          )}

          {/* Layer toggle tabs */}
          <View style={styles.layerToggleBar}>
            {(['pins', 'heatmap', 'clusters'] as const).map((mode) => (
              <Pressable
                key={mode}
                style={[
                  styles.layerToggleTab,
                  displayMode === mode && styles.layerToggleTabActive,
                ]}
                onPress={() => setDisplayMode(mode)}
                accessibilityLabel={t(
                  `map.display${mode.charAt(0).toUpperCase() + mode.slice(1)}` as never,
                )}
                accessibilityRole="tab"
                accessibilityState={{ selected: displayMode === mode }}
              >
                <Text
                  style={[
                    styles.layerToggleText,
                    displayMode === mode && styles.layerToggleTextActive,
                  ]}
                >
                  {t(
                    `map.display${mode.charAt(0).toUpperCase() + mode.slice(1)}` as never,
                  )}
                </Text>
              </Pressable>
            ))}
          </View>

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

          <MapView
            onRegionDidChange={handleRegionChange}
            cases={geoJSONData}
            displayMode={displayMode}
            onPinPress={handlePinPress}
            jurisdictionData={jurisdictions}
            showJurisdictions={showBoundaries}
            onJurisdictionPress={handleJurisdictionPress}
            poiData={poiData}
            showPois={showPois}
            onPoiPress={handlePoiPress}
          >
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
        </View>

        <MapActivityPanel
          cases={cases}
          onCasePress={handleViewDetails}
          onViewAll={handleViewAll}
          isLoading={isLoading}
        />

        <JurisdictionInfoModal
          visible={!!selectedJurisdiction}
          jurisdictionId={selectedJurisdiction?.id ?? ''}
          jurisdictionName={selectedJurisdiction?.name ?? ''}
          onClose={() => setSelectedJurisdiction(null)}
        />

        <PoiDetailModal
          visible={!!selectedPoi}
          poi={selectedPoi}
          onClose={() => setSelectedPoi(null)}
        />
      </View>
    );
  }

  // Mobile / tablet: original layout
  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          ref={searchInputRef}
          style={styles.searchInput}
          placeholder={t('map.searchPlaceholder')}
          placeholderTextColor={colors.neutral400}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          accessibilityLabel={t('map.searchPlaceholder')}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && Platform.OS !== 'ios' && (
          <Pressable
            style={styles.searchClearButton}
            onPress={handleSearchClear}
            accessibilityLabel={t('common.close')}
            accessibilityRole="button"
          >
            <Text style={styles.searchClearText}>x</Text>
          </Pressable>
        )}
      </View>

      {/* Search results dropdown */}
      {showSearchDropdown && (
        <View style={styles.searchDropdown}>
          {searchLoading && (
            <View style={styles.searchLoadingRow}>
              <ActivityIndicator
                size="small"
                color={colors.primary}
                accessibilityLabel={t('common.loading')}
              />
            </View>
          )}
          {!searchLoading && searchError && (
            <View style={styles.searchMessageRow}>
              <Text style={styles.searchMessageText}>
                {t('map.searchError')}
              </Text>
            </View>
          )}
          {!searchLoading && !searchError && searchResults.length === 0 && (
            <View style={styles.searchMessageRow}>
              <Text style={styles.searchMessageText}>
                {t('map.searchNoResults')}
              </Text>
            </View>
          )}
          {!searchLoading && searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderSearchResult}
              style={styles.searchResultsList}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}

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

      <MapView
        onRegionDidChange={handleRegionChange}
        {...(Platform.OS === 'web'
          ? {
              cases: geoJSONData,
              onPinPress: handlePinPress,
              jurisdictionData: jurisdictions,
              showJurisdictions: showBoundaries,
              onJurisdictionPress: handleJurisdictionPress,
              poiData,
              showPois,
              onPoiPress: handlePoiPress,
            }
          : {})}
      >
        {Platform.OS !== 'web' && (
          <>
            <ClusterLayer cases={geoJSONData} onPinPress={handlePinPress} />
            <PoiLayer
              data={poiData}
              visible={showPois}
              onPress={handlePoiPress}
            />
          </>
        )}
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

      <Pressable
        style={styles.fab}
        onPress={handleNewReport}
        accessibilityLabel={t('report.newReport')}
        accessibilityRole="button"
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <JurisdictionInfoModal
        visible={!!selectedJurisdiction}
        jurisdictionId={selectedJurisdiction?.id ?? ''}
        jurisdictionName={selectedJurisdiction?.name ?? ''}
        onClose={() => setSelectedJurisdiction(null)}
      />

      <PoiDetailModal
        visible={!!selectedPoi}
        poi={selectedPoi}
        onClose={() => setSelectedPoi(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
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
    color: colors.secondary,
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
  layerToggleBar: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    left: '50%',
    position: 'absolute',
    top: spacing.md,
    transform: [{ translateX: '-50%' }],
    zIndex: 10,
    ...shadowStyles.card,
  },
  layerToggleTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  layerToggleTabActive: {
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  layerToggleText: {
    color: colors.neutral500,
    fontSize: 13,
    fontWeight: '600',
  },
  layerToggleTextActive: {
    color: colors.secondary,
  },
  mapColumn: {
    flex: 1,
    position: 'relative' as const,
  },
  // Search bar
  searchClearButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginLeft: spacing.sm,
    minWidth: 44,
  },
  searchClearText: {
    color: colors.neutral500,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    zIndex: 20,
    ...shadowStyles.card,
  },
  searchDropdown: {
    backgroundColor: colors.white,
    borderColor: colors.neutral200,
    borderTopWidth: 0,
    borderWidth: 1,
    left: 0,
    maxHeight: 400,
    position: 'absolute',
    right: 0,
    top: 61,
    zIndex: 19,
    ...shadowStyles.elevated,
  },
  searchInput: {
    backgroundColor: colors.neutral100,
    borderColor: colors.neutral200,
    borderRadius: borderRadius.input,
    borderWidth: 1,
    color: colors.secondary,
    flex: 1,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    height: 44,
    paddingHorizontal: spacing.md,
  },
  searchLoadingRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  searchMessageRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  searchMessageText: {
    color: colors.neutral500,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.small.fontSize,
  },
  searchResultBadge: {
    borderRadius: borderRadius.tag,
    marginRight: spacing.sm,
    marginTop: 2,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  searchResultBadgeText: {
    color: colors.white,
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
  },
  searchResultBody: {
    flex: 1,
  },
  searchResultDescription: {
    color: colors.secondary,
    fontFamily: typography.body.fontFamily,
    fontSize: typography.small.fontSize,
    lineHeight: typography.small.fontSize * typography.small.lineHeight,
  },
  searchResultFolio: {
    color: colors.neutral500,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.caption.fontSize,
  },
  searchResultMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  searchResultRow: {
    alignItems: 'flex-start',
    borderBottomColor: colors.neutral200,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchResultTime: {
    color: colors.neutral400,
    fontFamily: typography.caption.fontFamily,
    fontSize: typography.caption.fontSize,
  },
  searchResultsList: {
    maxHeight: 400,
  },
});
