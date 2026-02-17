/**
 * ClusterLayer Component
 * Mapbox clustering for case pins on the map.
 */

import { memo, useCallback } from 'react';
import MapboxGL from '../../lib/mapbox';
import { colors } from '@lomito/ui/src/theme/tokens';
import type { CaseCategory, CaseStatus } from '@lomito/shared/types/database';

interface CaseFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    category: CaseCategory;
    status: CaseStatus;
  };
}

interface ClusterLayerProps {
  cases: GeoJSON.FeatureCollection<
    GeoJSON.Point,
    { id: string; category: CaseCategory; status: CaseStatus }
  >;
  onPinPress?: (caseId: string) => void;
}

export const ClusterLayer = memo(function ClusterLayer({
  cases,
  onPinPress,
}: ClusterLayerProps) {
  const handlePress = useCallback(
    (event: unknown) => {
      if (!onPinPress) return;

      // Type assertion for event structure (actual implementation will have proper types)
      const feature = (event as { features?: CaseFeature[] })?.features?.[0];
      if (feature?.properties?.id) {
        onPinPress(feature.properties.id);
      }
    },
    [onPinPress],
  );

  return (
    <MapboxGL.ShapeSource
      id="cases-source"
      shape={cases}
      cluster
      clusterRadius={50}
      clusterMaxZoomLevel={14}
      onPress={handlePress}
    >
      {/* Cluster circles */}
      <MapboxGL.CircleLayer
        id="clusters"
        filter={['has', 'point_count']}
        style={{
          circleColor: colors.primaryDark,
          circleRadius: [
            'step',
            ['get', 'point_count'],
            20, // radius for count < 10
            10,
            25, // radius for count >= 10
            30,
            35, // radius for count >= 30
          ],
          circleOpacity: 1,
          circleStrokeWidth: 2.5,
          circleStrokeColor: colors.secondary,
        }}
      />

      {/* Cluster count labels */}
      <MapboxGL.SymbolLayer
        id="cluster-count"
        filter={['has', 'point_count']}
        style={{
          textField: ['get', 'point_count_abbreviated'],
          textSize: 14,
          textColor: colors.secondary,
          textFont: ['Public Sans Bold', 'Arial Unicode MS Bold'],
          textAllowOverlap: true,
        }}
      />

      {/* Individual unclustered points */}
      <MapboxGL.CircleLayer
        id="unclustered-points"
        filter={['!', ['has', 'point_count']]}
        style={{
          circleColor: [
            'match',
            ['get', 'category'],
            'abuse',
            colors.category.abuse.pin,
            'injured',
            colors.category.injured.pin,
            'stray',
            colors.category.stray.pin,
            'missing',
            colors.category.missing.pin,
            'zoonotic',
            colors.category.zoonotic.pin,
            'dead_animal',
            colors.category.dead_animal.pin,
            'dangerous_dog',
            colors.category.dangerous_dog.pin,
            'distress',
            colors.category.distress.pin,
            'illegal_sales',
            colors.category.illegal_sales.pin,
            'wildlife',
            colors.category.wildlife.pin,
            'noise_nuisance',
            colors.category.noise_nuisance.pin,
            colors.neutral500, // default fallback
          ] as unknown as string,
          circleRadius: 14,
          circleStrokeWidth: [
            'case',
            ['==', ['get', 'status'], 'resolved'],
            4,
            ['==', ['get', 'status'], 'verified'],
            3,
            ['==', ['get', 'status'], 'in_progress'],
            3,
            3, // default for pending
          ] as unknown as number,
          circleStrokeColor: [
            'case',
            ['==', ['get', 'status'], 'resolved'],
            colors.success,
            ['==', ['get', 'status'], 'verified'],
            colors.success,
            ['==', ['get', 'status'], 'in_progress'],
            colors.info,
            ['==', ['get', 'status'], 'rejected'],
            colors.neutral400,
            ['==', ['get', 'status'], 'archived'],
            colors.neutral400,
            'rgba(255, 255, 255, 1)', // default for pending
          ] as unknown as string,
          circleOpacity: [
            'case',
            ['==', ['get', 'status'], 'rejected'],
            0.5,
            ['==', ['get', 'status'], 'archived'],
            0.5,
            1.0, // default
          ] as unknown as number,
        }}
      />
    </MapboxGL.ShapeSource>
  );
});
