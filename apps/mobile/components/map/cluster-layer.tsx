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
          circleColor: colors.primary,
          circleRadius: [
            'step',
            ['get', 'point_count'],
            20, // radius for count < 10
            10,
            25, // radius for count >= 10
            30,
            35, // radius for count >= 30
          ],
          circleOpacity: 0.9,
          circleStrokeWidth: 2,
          circleStrokeColor: colors.white,
        }}
      />

      {/* Cluster count labels */}
      <MapboxGL.SymbolLayer
        id="cluster-count"
        filter={['has', 'point_count']}
        style={{
          textField: ['get', 'point_count_abbreviated'],
          textSize: 14,
          textColor: colors.white,
          textFont: ['DM Sans Bold', 'Arial Unicode MS Bold'],
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
            'stray',
            colors.category.stray.pin,
            'missing',
            colors.category.missing.pin,
            colors.neutral500, // default
          ] as unknown as string,
          circleRadius: 12,
          circleStrokeWidth: [
            'case',
            ['==', ['get', 'status'], 'resolved'],
            3,
            ['==', ['get', 'status'], 'verified'],
            2,
            ['==', ['get', 'status'], 'in_progress'],
            2,
            2, // default for pending
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
            'rgba(255, 255, 255, 0.9)', // default for pending
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
