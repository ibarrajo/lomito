/**
 * ClusterLayer Component (Web)
 * Web placeholder — clustering is handled by mapbox-gl directly on web.
 * On web, the map data is rendered via the MapView component.
 */

import { memo } from 'react';
import type { CaseCategory, CaseStatus } from '@lomito/shared/types/database';

interface ClusterLayerProps {
  cases: GeoJSON.FeatureCollection<
    GeoJSON.Point,
    { id: string; category: CaseCategory; status: CaseStatus }
  >;
  onPinPress?: (caseId: string) => void;
}

export const ClusterLayer = memo(function ClusterLayer(
  _props: ClusterLayerProps,
) {
  // On web, map layers are managed by the MapView component via mapbox-gl JS API
  // This is a no-op wrapper to maintain the same component interface
  return null;
});
