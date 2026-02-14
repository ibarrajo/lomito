/**
 * MapView Component
 * Full-screen Mapbox map centered on Tijuana.
 */

import { StyleSheet, View } from 'react-native';
import MapboxGL, { TIJUANA_CENTER, DEFAULT_ZOOM } from '../../lib/mapbox';
import type { ReactNode } from 'react';

interface MapViewProps {
  children?: ReactNode;
  onMapReady?: () => void;
}

export function MapView({ children, onMapReady }: MapViewProps) {
  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MapboxGL.StyleURL.Street}
        onDidFinishLoadingMap={onMapReady}
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
