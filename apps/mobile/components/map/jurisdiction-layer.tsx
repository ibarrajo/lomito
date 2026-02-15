/**
 * JurisdictionLayer Component
 * Renders jurisdiction boundary polygons as semi-transparent overlays on the map.
 * Shows jurisdiction names as labels centered in each polygon.
 *
 * NOTE: FillLayer and LineLayer are not currently available in the MapboxGL stub types.
 * This component will work once @rnmapbox/maps is fully installed.
 * For now, we're using a simplified implementation that will be enhanced later.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import MapboxGL from '../../lib/mapbox';
import { colors } from '@lomito/ui/src/theme/tokens';

interface JurisdictionFeature {
  type: 'Feature';
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
  properties: {
    id: string;
    name: string;
    level: string;
    authority_name: string | null;
  };
}

interface JurisdictionGeoJSON {
  type: 'FeatureCollection';
  features: JurisdictionFeature[];
}

interface JurisdictionLayerProps {
  data: JurisdictionGeoJSON | null;
  visible: boolean;
  onPress?: (jurisdictionId: string, jurisdictionName: string) => void;
}

export function JurisdictionLayer({
  data,
  visible,
  onPress,
}: JurisdictionLayerProps) {
  if (!data || !visible) {
    return null;
  }

  const handlePress = (event: unknown) => {
    if (!onPress) return;

    const feature = (event as { features?: JurisdictionFeature[] })
      ?.features?.[0];
    if (feature?.properties?.id && feature?.properties?.name) {
      onPress(feature.properties.id, feature.properties.name);
    }
  };

  // Type assertion for MapboxGL to access FillLayer and LineLayer
  // These are available in the actual @rnmapbox/maps package
  const MapboxGLAny = MapboxGL as any;

  return (
    <MapboxGL.ShapeSource
      id="jurisdictions-source"
      shape={data}
      onPress={handlePress}
    >
      {/* Fill layer - semi-transparent overlay */}
      <MapboxGLAny.FillLayer
        id="jurisdictions-fill"
        style={{
          fillColor: colors.secondary,
          fillOpacity: 0.15,
        }}
      />

      {/* Line layer - visible borders */}
      <MapboxGLAny.LineLayer
        id="jurisdictions-line"
        style={{
          lineColor: colors.secondary,
          lineOpacity: 0.6,
          lineWidth: 2,
        }}
      />

      {/* Symbol layer - jurisdiction name labels */}
      <MapboxGL.SymbolLayer
        id="jurisdictions-labels"
        style={{
          textField: ['get', 'name'],
          textSize: 14,
          textColor: colors.secondary,
          textFont: ['Source Sans 3 Semibold', 'Arial Unicode MS Regular'],
          textAllowOverlap: false,
        }}
      />
    </MapboxGL.ShapeSource>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
