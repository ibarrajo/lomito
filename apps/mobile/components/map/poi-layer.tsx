/**
 * PoiLayer Component
 * Renders Points of Interest (government offices, animal shelters, vet clinics)
 * as colored circle markers on the native Mapbox map.
 */

import { memo, useCallback } from 'react';
import MapboxGL from '../../lib/mapbox';
import { colors } from '@lomito/ui/src/theme/tokens';
import type { PointOfInterest } from '@lomito/shared/types/database';

interface PoiFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: PointOfInterest;
}

interface PoiLayerProps {
  data: GeoJSON.FeatureCollection<GeoJSON.Point, PointOfInterest> | null;
  visible: boolean;
  onPress: (poi: PointOfInterest) => void;
}

export const PoiLayer = memo(function PoiLayer({
  data,
  visible,
  onPress,
}: PoiLayerProps) {
  const handlePress = useCallback(
    (event: unknown) => {
      const feature = (event as { features?: PoiFeature[] })?.features?.[0];
      if (feature?.properties) {
        onPress(feature.properties);
      }
    },
    [onPress],
  );

  if (!visible || data === null) {
    return null;
  }

  return (
    <MapboxGL.ShapeSource id="pois-source" shape={data} onPress={handlePress}>
      <MapboxGL.CircleLayer
        id="pois-circles"
        style={{
          circleColor: [
            'match',
            ['get', 'poi_type'],
            'government_office',
            colors.poi.government,
            'animal_shelter',
            colors.poi.shelter,
            'vet_clinic',
            colors.poi.vetStandard,
            colors.poi.government, // default fallback
          ] as unknown as string,
          circleRadius: 10,
          circleStrokeWidth: 2,
          circleStrokeColor: colors.white,
        }}
      />
    </MapboxGL.ShapeSource>
  );
});
