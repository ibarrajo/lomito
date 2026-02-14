/**
 * JurisdictionLayer Component (Web)
 * Web placeholder — jurisdiction boundaries are handled by mapbox-gl directly on web.
 */

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

export function JurisdictionLayer(_props: JurisdictionLayerProps) {
  // On web, jurisdiction layers are managed by the MapView component via mapbox-gl JS API
  return null;
}
