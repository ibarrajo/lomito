/**
 * ClusterLayer Component
 * Mapbox clustering for case pins on the map.
 */

import MapboxGL from '../../lib/mapbox';
import { colors } from '@lomito/ui/src/theme/tokens';
import type { CaseCategory } from '@lomito/shared/types/database';

interface CaseFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    category: CaseCategory;
  };
}

interface ClusterLayerProps {
  cases: GeoJSON.FeatureCollection<GeoJSON.Point, { id: string; category: CaseCategory }>;
  onPinPress?: (caseId: string) => void;
}

export function ClusterLayer({ cases, onPinPress }: ClusterLayerProps) {
  const handlePress = (event: unknown) => {
    if (!onPinPress) return;

    // Type assertion for event structure (actual implementation will have proper types)
    const feature = (event as { features?: CaseFeature[] })?.features?.[0];
    if (feature?.properties?.id) {
      onPinPress(feature.properties.id);
    }
  };

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
            10, 25, // radius for count >= 10
            30, 35, // radius for count >= 30
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
            'abuse', colors.category.abuse.pin,
            'stray', colors.category.stray.pin,
            'missing', colors.category.missing.pin,
            colors.neutral500, // default
          ],
          circleRadius: 12,
          circleStrokeWidth: 2,
          circleStrokeColor: 'rgba(255, 255, 255, 0.9)',
        }}
      />
    </MapboxGL.ShapeSource>
  );
}
