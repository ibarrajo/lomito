/**
 * MapView Component
 * Full-screen Mapbox map centered on Tijuana.
 */

import { StyleSheet, View } from 'react-native';
import MapboxGL, { TIJUANA_CENTER, DEFAULT_ZOOM } from '../../lib/mapbox';
import type { ReactNode } from 'react';

interface Region {
  bounds: {
    ne: [number, number];
    sw: [number, number];
  };
  zoomLevel: number;
}

interface MapViewProps {
  children?: ReactNode;
  cases?: GeoJSON.FeatureCollection;
  onMapReady?: () => void;
  onRegionDidChange?: (region: Region) => void;
  onPinPress?: (caseId: string) => void;
}

export function MapView({
  children,
  onMapReady,
  onRegionDidChange,
}: MapViewProps) {
  const handleRegionDidChange = async (event: unknown) => {
    if (!onRegionDidChange) return;

    try {
      // Extract region data from event
      const regionData = event as {
        properties?: {
          visibleBounds?: [[number, number], [number, number]];
          zoomLevel?: number;
        };
      };

      const visibleBounds = regionData.properties?.visibleBounds;
      const zoomLevel = regionData.properties?.zoomLevel;

      if (visibleBounds && zoomLevel !== undefined) {
        onRegionDidChange({
          bounds: {
            ne: visibleBounds[0],
            sw: visibleBounds[1],
          },
          zoomLevel,
        });
      }
    } catch (err) {
      console.error('Error handling region change:', err);
    }
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        onDidFinishLoadingMap={onMapReady}
        onRegionDidChange={handleRegionDidChange}
        compassEnabled={false}
        scaleBarEnabled={false}
      >
        <MapboxGL.Camera
          zoomLevel={DEFAULT_ZOOM}
          centerCoordinate={[TIJUANA_CENTER.longitude, TIJUANA_CENTER.latitude]}
        />
        {children}
      </MapboxGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
